#!/bin/bash

# Project Sync Script
# Sync Claude Code preferences and pull latest changes across all projects

echo "🔄 Project Sync - Claude Code Preferences"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFERENCES_DIR="$( dirname "$SCRIPT_DIR" )"

# Step 1: Sync claude-code-preferences repository
echo ""
echo "Step 1: Syncing Claude Code Preferences..."
cd "$PREFERENCES_DIR" || exit 1

if git status &>/dev/null; then
    print_info "Git repository detected"
    
    # Check for local changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "Local changes detected in preferences"
        git status --porcelain
        echo ""
        read -p "Do you want to commit these changes first? [y/N]: " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Update preferences before sync

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
            print_status "Local changes committed"
        fi
    fi
    
    # Pull latest changes
    print_info "Pulling latest preferences..."
    if git pull; then
        print_status "Preferences updated successfully"
    else
        print_error "Failed to pull latest preferences"
        exit 1
    fi
else
    print_warning "Not a git repository - skipping sync"
fi

# Step 2: Check symlink for CLAUDE.md
echo ""
echo "Step 2: Verifying CLAUDE.md symlink..."
CLAUDE_MD_DEST="$HOME/.claude/CLAUDE.md"
CLAUDE_MD_SOURCE="$PREFERENCES_DIR/CLAUDE.md"

if [ -L "$CLAUDE_MD_DEST" ]; then
    LINK_TARGET=$(readlink "$CLAUDE_MD_DEST")
    if [ "$LINK_TARGET" = "$CLAUDE_MD_SOURCE" ]; then
        print_status "CLAUDE.md symlink is correct"
    else
        print_warning "CLAUDE.md symlink points to wrong location: $LINK_TARGET"
        print_info "Updating symlink..."
        ln -sf "$CLAUDE_MD_SOURCE" "$CLAUDE_MD_DEST"
        print_status "Symlink updated"
    fi
elif [ -f "$CLAUDE_MD_DEST" ]; then
    print_warning "CLAUDE.md is a regular file, not a symlink"
    print_info "Creating backup and symlinking..."
    mv "$CLAUDE_MD_DEST" "$CLAUDE_MD_DEST.backup.$(date +%Y%m%d_%H%M%S)"
    ln -sf "$CLAUDE_MD_SOURCE" "$CLAUDE_MD_DEST"
    print_status "Symlink created, backup saved"
else
    print_info "Creating CLAUDE.md symlink..."
    mkdir -p "$(dirname "$CLAUDE_MD_DEST")"
    ln -sf "$CLAUDE_MD_SOURCE" "$CLAUDE_MD_DEST"
    print_status "Symlink created"
fi

# Step 3: Optional project updates
echo ""
echo "Step 3: Project Updates (optional)..."

# Define key projects to check
declare -A PROJECTS=(
    ["Tmux-Orchestrator"]="/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator"
    ["shaktech-website"]="/Users/shakeelbhamani/projects/personal/shaktech-website"
    ["email-sender"]="/Users/shakeelbhamani/projects/personal/email-sender"
    ["ai-stock-researcher"]="/Users/shakeelbhamani/projects/personal/ai-stock-researcher"
    ["virtual-ai-team-manager"]="/Users/shakeelbhamani/projects/personal/virtual-ai-team-manager"
)

read -p "Do you want to pull latest changes for key projects? [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for project_name in "${!PROJECTS[@]}"; do
        project_path="${PROJECTS[$project_name]}"
        
        if [ -d "$project_path" ]; then
            echo ""
            print_info "Checking $project_name..."
            cd "$project_path" || continue
            
            if git status &>/dev/null; then
                # Check for uncommitted changes
                if ! git diff-index --quiet HEAD --; then
                    print_warning "$project_name has uncommitted changes - skipping"
                    continue
                fi
                
                # Pull latest
                if git pull; then
                    print_status "$project_name updated"
                else
                    print_error "Failed to update $project_name"
                fi
            else
                print_warning "$project_name is not a git repository"
            fi
        else
            print_warning "$project_name not found at $project_path"
        fi
    done
fi

# Step 4: Summary and next steps
echo ""
echo "=================================="
echo -e "${GREEN}✅ Sync Complete!${NC}"
echo ""
echo "Summary:"
echo "- ✅ Claude Code preferences synced"
echo "- ✅ CLAUDE.md symlink verified"
echo "- ✅ Optional project updates completed"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code to pick up any preference changes"
echo "2. Check that all tools and scripts are working correctly"
echo "3. Run 'claude-sync' alias in other terminals to sync"
echo ""
echo "Useful commands:"
echo "- claude-sync: Run this sync script"
echo "- claude-check-teams: Check AI team status"
echo "- claude-screenshot: Take website screenshots"
echo "- claude-email: Send emails from anywhere"
echo ""