#!/bin/bash

# Backup & Restore Claude Code Preferences
# Creates timestamped backups of all preference data

set -e

echo "💾 Claude Code Preferences Backup Manager"
echo "=========================================="

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
BACKUP_DIR="$HOME/.claude/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Parse command line arguments
ACTION="${1:-backup}"
BACKUP_NAME="${2:-$TIMESTAMP}"

case "$ACTION" in
    "backup"|"b")
        echo ""
        print_info "Creating backup: $BACKUP_NAME"
        
        # Create backup directory
        mkdir -p "$BACKUP_DIR"
        BACKUP_PATH="$BACKUP_DIR/claude-preferences-$BACKUP_NAME"
        
        if [ -d "$BACKUP_PATH" ]; then
            print_error "Backup already exists: $BACKUP_PATH"
            read -p "Overwrite? [y/N]: " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Backup cancelled"
                exit 0
            fi
            rm -rf "$BACKUP_PATH"
        fi
        
        mkdir -p "$BACKUP_PATH"
        
        # Backup main repository
        print_info "Backing up repository..."
        cp -r "$PREFS_DIR"/* "$BACKUP_PATH/" 2>/dev/null || true
        cp -r "$PREFS_DIR"/.git* "$BACKUP_PATH/" 2>/dev/null || true
        
        # Backup global CLAUDE.md
        if [ -f "$HOME/.claude/CLAUDE.md" ]; then
            print_info "Backing up global CLAUDE.md..."
            cp "$HOME/.claude/CLAUDE.md" "$BACKUP_PATH/global-CLAUDE.md"
        fi
        
        # Backup project-specific settings
        print_info "Backing up project settings..."
        PROJECTS_BACKUP="$BACKUP_PATH/project-settings"
        mkdir -p "$PROJECTS_BACKUP"
        
        # Read project paths and backup their .claude directories
        if [ -f "$PREFS_DIR/configs/project-paths.json" ]; then
            PROJECT_PATHS=$(node -e "
                const config = JSON.parse(require('fs').readFileSync('$PREFS_DIR/configs/project-paths.json', 'utf8'));
                Object.entries(config.projectPaths || {}).forEach(([name, path]) => {
                    console.log(name + ':' + path);
                });
            " 2>/dev/null)
            
            while IFS=':' read -r name path; do
                if [ -d "$path/.claude" ]; then
                    print_info "  → $name (.claude)"
                    cp -r "$path/.claude" "$PROJECTS_BACKUP/$name-claude" 2>/dev/null || true
                fi
                if [ -f "$path/CLAUDE.md" ]; then
                    print_info "  → $name (CLAUDE.md)"
                    cp "$path/CLAUDE.md" "$PROJECTS_BACKUP/$name-CLAUDE.md" 2>/dev/null || true
                fi
            done <<< "$PROJECT_PATHS"
        fi
        
        # Create backup manifest
        cat > "$BACKUP_PATH/backup-manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "backup_name": "$BACKUP_NAME",
  "created_by": "$(whoami)@$(hostname)",
  "claude_prefs_version": "$(cd "$PREFS_DIR" && git describe --tags 2>/dev/null || git rev-parse --short HEAD)",
  "system_info": {
    "os": "$(uname -s)",
    "os_version": "$(uname -r)",
    "node_version": "$(node --version 2>/dev/null || echo 'not installed')",
    "git_version": "$(git --version 2>/dev/null || echo 'not installed')"
  },
  "files_backed_up": {
    "repository": true,
    "global_claude_md": $([ -f "$HOME/.claude/CLAUDE.md" ] && echo "true" || echo "false"),
    "project_settings": true
  }
}
EOF
        
        # Calculate backup size
        BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
        
        print_status "Backup created successfully!"
        echo ""
        echo "📍 Location: $BACKUP_PATH"
        echo "📊 Size: $BACKUP_SIZE"
        echo "🕒 Created: $(date)"
        echo ""
        echo "To restore: $0 restore $BACKUP_NAME"
        ;;
        
    "restore"|"r")
        if [ -z "$2" ]; then
            print_error "Please specify backup name to restore"
            echo ""
            echo "Available backups:"
            ls -1 "$BACKUP_DIR" 2>/dev/null | grep "claude-preferences-" | sed 's/claude-preferences-/  - /' || echo "  No backups found"
            exit 1
        fi
        
        BACKUP_PATH="$BACKUP_DIR/claude-preferences-$BACKUP_NAME"
        
        if [ ! -d "$BACKUP_PATH" ]; then
            print_error "Backup not found: $BACKUP_PATH"
            exit 1
        fi
        
        echo ""
        print_warning "This will overwrite current preferences!"
        print_info "Backup to restore: $BACKUP_NAME"
        
        if [ -f "$BACKUP_PATH/backup-manifest.json" ]; then
            echo ""
            print_info "Backup details:"
            node -e "
                const manifest = JSON.parse(require('fs').readFileSync('$BACKUP_PATH/backup-manifest.json', 'utf8'));
                console.log('  Created:', manifest.timestamp);
                console.log('  By:', manifest.created_by);
                console.log('  Version:', manifest.claude_prefs_version);
            " 2>/dev/null || true
        fi
        
        echo ""
        read -p "Continue with restore? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restore cancelled"
            exit 0
        fi
        
        # Create current backup before restore
        print_info "Creating safety backup of current state..."
        SAFETY_BACKUP="pre-restore-$(date +%Y%m%d_%H%M%S)"
        "$0" backup "$SAFETY_BACKUP" >/dev/null 2>&1 || print_warning "Could not create safety backup"
        
        # Restore repository
        print_info "Restoring repository..."
        rm -rf "$PREFS_DIR"/.git* "$PREFS_DIR"/*
        cp -r "$BACKUP_PATH"/* "$PREFS_DIR/" 2>/dev/null || true
        
        # Restore global CLAUDE.md
        if [ -f "$BACKUP_PATH/global-CLAUDE.md" ]; then
            print_info "Restoring global CLAUDE.md..."
            mkdir -p "$HOME/.claude"
            cp "$BACKUP_PATH/global-CLAUDE.md" "$HOME/.claude/CLAUDE.md"
        fi
        
        print_status "Restore completed successfully!"
        print_info "Safety backup created: $SAFETY_BACKUP"
        ;;
        
    "list"|"ls")
        echo ""
        print_info "Available backups:"
        if [ -d "$BACKUP_DIR" ]; then
            for backup in "$BACKUP_DIR"/claude-preferences-*; do
                if [ -d "$backup" ]; then
                    name=$(basename "$backup" | sed 's/claude-preferences-//')
                    size=$(du -sh "$backup" | cut -f1)
                    date=$(stat -f %Sm -t "%Y-%m-%d %H:%M" "$backup" 2>/dev/null || stat -c %y "$backup" 2>/dev/null || echo "unknown")
                    echo "  📦 $name ($size) - $date"
                fi
            done
        else
            echo "  No backups found"
        fi
        ;;
        
    "clean")
        echo ""
        print_warning "This will remove old backups (keeping last 10)"
        read -p "Continue? [y/N]: " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [ -d "$BACKUP_DIR" ]; then
                cd "$BACKUP_DIR"
                ls -t claude-preferences-* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true
                print_status "Cleanup completed"
            fi
        fi
        ;;
        
    *)
        echo ""
        echo "Usage: $0 <command> [backup_name]"
        echo ""
        echo "Commands:"
        echo "  backup|b [name]    Create backup (default: timestamp)"
        echo "  restore|r <name>   Restore from backup"
        echo "  list|ls           List available backups"
        echo "  clean             Remove old backups (keep last 10)"
        echo ""
        echo "Examples:"
        echo "  $0 backup"
        echo "  $0 backup before-major-changes"
        echo "  $0 restore 20240902_120000"
        echo "  $0 list"
        exit 1
        ;;
esac