#!/bin/bash

# Auto-Update Claude Code Preferences
# Checks for updates and applies them with safety backups

set -e

echo "🔄 Claude Code Preferences Auto-Updater"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFS_DIR="$( dirname "$SCRIPT_DIR" )"
BACKUP_SCRIPT="$SCRIPT_DIR/backup-preferences.sh"

# Configuration
CHECK_REMOTE="${1:-true}"
AUTO_APPLY="${2:-false}"
UPDATE_LOG="$HOME/.claude/update.log"

# Ensure we're in a git repository
cd "$PREFS_DIR"

if [ ! -d .git ]; then
    print_error "Not a git repository. Please run this from claude-code-preferences directory."
    exit 1
fi

echo ""
print_info "Current status:"
echo "  Repository: $(pwd)"
echo "  Current branch: $(git branch --show-current)"
echo "  Current commit: $(git rev-parse --short HEAD) - $(git log -1 --pretty=format:'%s')"

# Check for local changes
if ! git diff-index --quiet HEAD --; then
    print_warning "Local changes detected:"
    git status --porcelain
    echo ""
    if [ "$AUTO_APPLY" = "false" ]; then
        read -p "Stash changes and continue? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Update cancelled. Commit or stash your changes first."
            exit 0
        fi
    fi
    
    print_info "Stashing local changes..."
    git stash push -m "Auto-stash before update $(date)"
    STASHED_CHANGES=true
else
    STASHED_CHANGES=false
fi

# Check for remote updates
if [ "$CHECK_REMOTE" = "true" ]; then
    print_info "Checking for remote updates..."
    git fetch origin
    
    BEHIND=$(git rev-list --count HEAD..origin/$(git branch --show-current) 2>/dev/null || echo "0")
    AHEAD=$(git rev-list --count origin/$(git branch --show-current)..HEAD 2>/dev/null || echo "0")
    
    if [ "$BEHIND" -eq 0 ]; then
        print_status "Already up to date!"
        if [ "$STASHED_CHANGES" = "true" ]; then
            print_info "Restoring stashed changes..."
            git stash pop
        fi
        exit 0
    fi
    
    print_warning "Updates available:"
    echo "  $BEHIND commits behind origin"
    if [ "$AHEAD" -gt 0 ]; then
        echo "  $AHEAD commits ahead (you have local commits)"
    fi
    
    echo ""
    print_info "Recent commits on remote:"
    git log --oneline HEAD..origin/$(git branch --show-current) | head -5
    
    if [ "$AUTO_APPLY" = "false" ]; then
        echo ""
        read -p "Apply updates? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Update cancelled"
            if [ "$STASHED_CHANGES" = "true" ]; then
                print_info "Restoring stashed changes..."
                git stash pop
            fi
            exit 0
        fi
    fi
fi

# Create backup before updating
print_info "Creating backup before update..."
BACKUP_NAME="pre-update-$(date +%Y%m%d_%H%M%S)"
if [ -x "$BACKUP_SCRIPT" ]; then
    "$BACKUP_SCRIPT" backup "$BACKUP_NAME" >/dev/null 2>&1
    print_status "Backup created: $BACKUP_NAME"
else
    print_warning "Backup script not found or not executable"
fi

# Apply updates
print_info "Applying updates..."
OLD_COMMIT=$(git rev-parse --short HEAD)

if [ "$AHEAD" -gt 0 ]; then
    # We have local commits, need to rebase
    print_info "Rebasing local commits on remote changes..."
    if git rebase origin/$(git branch --show-current); then
        print_status "Rebase successful"
    else
        print_error "Rebase failed. Manual intervention required."
        print_info "Backup available: $BACKUP_NAME"
        exit 1
    fi
else
    # Simple fast-forward merge
    if git merge origin/$(git branch --show-current); then
        print_status "Merge successful"
    else
        print_error "Merge failed. Manual intervention required."
        print_info "Backup available: $BACKUP_NAME"
        exit 1
    fi
fi

NEW_COMMIT=$(git rev-parse --short HEAD)

# Restore stashed changes if any
if [ "$STASHED_CHANGES" = "true" ]; then
    print_info "Restoring stashed changes..."
    if git stash pop; then
        print_status "Stashed changes restored"
    else
        print_warning "Could not restore stashed changes automatically"
        print_info "Manual merge may be required: git stash pop"
    fi
fi

# Run post-update validation
echo ""
print_info "Running post-update validation..."
if npm run validate >/dev/null 2>&1; then
    print_status "Validation passed"
else
    print_error "Validation failed after update"
    print_warning "Consider reviewing changes or restoring backup: $BACKUP_NAME"
fi

# Check if install script needs to run
if git diff --name-only "$OLD_COMMIT" HEAD | grep -q "CLAUDE.md\|install.sh\|package.json"; then
    print_info "Core files updated. Consider running: npm run setup"
fi

# Log the update
mkdir -p "$(dirname "$UPDATE_LOG")"
cat >> "$UPDATE_LOG" << EOF
$(date): Updated from $OLD_COMMIT to $NEW_COMMIT (backup: $BACKUP_NAME)
EOF

print_status "Update completed successfully!"
echo ""
echo "Summary:"
echo "  From: $OLD_COMMIT"
echo "  To: $NEW_COMMIT"
echo "  Backup: $BACKUP_NAME"
echo ""
print_info "What's new:"
git log --oneline "$OLD_COMMIT".."$NEW_COMMIT" | head -5

echo ""
print_info "Next steps:"
echo "  • Review changes: git diff $OLD_COMMIT HEAD"
echo "  • Run setup if needed: npm run setup"
echo "  • Check health: npm run doctor"