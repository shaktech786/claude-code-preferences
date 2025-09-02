#!/bin/bash

# Environment Manager for Claude Code Preferences
# Manages different environment configurations (dev, staging, prod)

set -e

echo "🌍 Claude Code Environment Manager"
echo "=================================="

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
ENV_DIR="$HOME/.claude/environments"

# Parse arguments
COMMAND="${1:-list}"
ENVIRONMENT="${2:-}"

# Ensure environment directory exists
mkdir -p "$ENV_DIR"

case "$COMMAND" in
    "create"|"c")
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment name"
            echo "Usage: $0 create <environment_name>"
            exit 1
        fi
        
        ENV_PATH="$ENV_DIR/$ENVIRONMENT"
        
        if [ -d "$ENV_PATH" ]; then
            print_error "Environment '$ENVIRONMENT' already exists"
            exit 1
        fi
        
        print_info "Creating environment: $ENVIRONMENT"
        mkdir -p "$ENV_PATH"
        
        # Create environment-specific configs
        cp -r "$PREFS_DIR/configs" "$ENV_PATH/"
        cp "$PREFS_DIR/CLAUDE.md" "$ENV_PATH/"
        
        # Create environment manifest
        cat > "$ENV_PATH/environment.json" << EOF
{
  "name": "$ENVIRONMENT",
  "created": "$(date -Iseconds)",
  "created_by": "$(whoami)@$(hostname)",
  "description": "Environment configuration for $ENVIRONMENT",
  "base_version": "$(cd "$PREFS_DIR" && git rev-parse --short HEAD)",
  "active": false
}
EOF
        
        print_status "Environment '$ENVIRONMENT' created successfully"
        echo "  Location: $ENV_PATH"
        echo "  To activate: $0 switch $ENVIRONMENT"
        ;;
        
    "switch"|"s")
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment name"
            echo "Usage: $0 switch <environment_name>"
            exit 1
        fi
        
        ENV_PATH="$ENV_DIR/$ENVIRONMENT"
        
        if [ ! -d "$ENV_PATH" ]; then
            print_error "Environment '$ENVIRONMENT' does not exist"
            echo "Available environments:"
            ls "$ENV_DIR" 2>/dev/null | sed 's/^/  - /' || echo "  None"
            exit 1
        fi
        
        # Backup current state
        BACKUP_NAME="pre-switch-$(date +%Y%m%d_%H%M%S)"
        print_info "Creating backup: $BACKUP_NAME"
        "$SCRIPT_DIR/backup-preferences.sh" backup "$BACKUP_NAME" >/dev/null 2>&1 || print_warning "Could not create backup"
        
        # Deactivate current environment
        for env_file in "$ENV_DIR"/*/environment.json; do
            if [ -f "$env_file" ]; then
                node -e "
                    const fs = require('fs');
                    const config = JSON.parse(fs.readFileSync('$env_file', 'utf8'));
                    config.active = false;
                    fs.writeFileSync('$env_file', JSON.stringify(config, null, 2));
                " 2>/dev/null || true
            fi
        done
        
        print_info "Switching to environment: $ENVIRONMENT"
        
        # Copy environment configs
        cp -r "$ENV_PATH/configs/"* "$PREFS_DIR/configs/"
        cp "$ENV_PATH/CLAUDE.md" "$PREFS_DIR/"
        
        # Update symlink
        if [ -L "$HOME/.claude/CLAUDE.md" ]; then
            ln -sf "$PREFS_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
        fi
        
        # Mark environment as active
        node -e "
            const fs = require('fs');
            const config = JSON.parse(fs.readFileSync('$ENV_PATH/environment.json', 'utf8'));
            config.active = true;
            config.last_activated = new Date().toISOString();
            fs.writeFileSync('$ENV_PATH/environment.json', JSON.stringify(config, null, 2));
        " 2>/dev/null || true
        
        print_status "Switched to environment: $ENVIRONMENT"
        print_info "Backup created: $BACKUP_NAME"
        ;;
        
    "list"|"ls")
        print_info "Available environments:"
        echo ""
        
        if [ ! "$(ls -A "$ENV_DIR" 2>/dev/null)" ]; then
            echo "  No environments found"
            echo ""
            echo "Create one with: $0 create <name>"
            exit 0
        fi
        
        for env_path in "$ENV_DIR"/*; do
            if [ -d "$env_path" ]; then
                env_name=$(basename "$env_path")
                if [ -f "$env_path/environment.json" ]; then
                    # Read environment details
                    details=$(node -e "
                        try {
                            const config = JSON.parse(require('fs').readFileSync('$env_path/environment.json', 'utf8'));
                            const active = config.active ? ' (ACTIVE)' : '';
                            const created = new Date(config.created).toLocaleDateString();
                            console.log(\`  \${config.active ? '🟢' : '⚪'} \${config.name}\${active}\`);
                            console.log(\`     Created: \${created}\`);
                            console.log(\`     Description: \${config.description || 'No description'}\`);
                        } catch(e) {
                            console.log(\`  📁 \${env_name} (invalid config)\`);
                        }
                    " 2>/dev/null)
                    echo "$details"
                else
                    echo "  📁 $env_name (no config)"
                fi
                echo ""
            fi
        done
        ;;
        
    "current")
        print_info "Current environment status:"
        echo ""
        
        # Check for active environment
        ACTIVE_ENV=""
        for env_path in "$ENV_DIR"/*; do
            if [ -f "$env_path/environment.json" ]; then
                IS_ACTIVE=$(node -e "
                    try {
                        const config = JSON.parse(require('fs').readFileSync('$env_path/environment.json', 'utf8'));
                        console.log(config.active ? 'true' : 'false');
                    } catch(e) {
                        console.log('false');
                    }
                " 2>/dev/null)
                
                if [ "$IS_ACTIVE" = "true" ]; then
                    ACTIVE_ENV=$(basename "$env_path")
                    break
                fi
            fi
        done
        
        if [ -n "$ACTIVE_ENV" ]; then
            echo "🟢 Active environment: $ACTIVE_ENV"
        else
            echo "⚪ No active environment (using default)"
        fi
        
        echo "📁 Current config location: $PREFS_DIR"
        echo "🔗 CLAUDE.md symlink: $(readlink "$HOME/.claude/CLAUDE.md" 2>/dev/null || echo "not found")"
        ;;
        
    "save"|"save-current")
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment name to save to"
            echo "Usage: $0 save <environment_name>"
            exit 1
        fi
        
        ENV_PATH="$ENV_DIR/$ENVIRONMENT"
        
        if [ ! -d "$ENV_PATH" ]; then
            print_info "Creating new environment: $ENVIRONMENT"
            "$0" create "$ENVIRONMENT"
        else
            print_info "Updating existing environment: $ENVIRONMENT"
        fi
        
        # Save current state to environment
        cp -r "$PREFS_DIR/configs/"* "$ENV_PATH/configs/"
        cp "$PREFS_DIR/CLAUDE.md" "$ENV_PATH/"
        
        # Update manifest
        node -e "
            const fs = require('fs');
            const config = JSON.parse(fs.readFileSync('$ENV_PATH/environment.json', 'utf8'));
            config.last_updated = new Date().toISOString();
            config.base_version = '$(cd "$PREFS_DIR" && git rev-parse --short HEAD)';
            fs.writeFileSync('$ENV_PATH/environment.json', JSON.stringify(config, null, 2));
        " 2>/dev/null || true
        
        print_status "Current configuration saved to environment: $ENVIRONMENT"
        ;;
        
    "delete"|"rm")
        if [ -z "$ENVIRONMENT" ]; then
            print_error "Please specify environment name to delete"
            echo "Usage: $0 delete <environment_name>"
            exit 1
        fi
        
        ENV_PATH="$ENV_DIR/$ENVIRONMENT"
        
        if [ ! -d "$ENV_PATH" ]; then
            print_error "Environment '$ENVIRONMENT' does not exist"
            exit 1
        fi
        
        print_warning "This will permanently delete environment: $ENVIRONMENT"
        read -p "Are you sure? [y/N]: " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$ENV_PATH"
            print_status "Environment '$ENVIRONMENT' deleted"
        else
            print_info "Deletion cancelled"
        fi
        ;;
        
    *)
        echo ""
        echo "Usage: $0 <command> [environment_name]"
        echo ""
        echo "Commands:"
        echo "  create|c <name>      Create new environment"
        echo "  switch|s <name>      Switch to environment"
        echo "  list|ls             List all environments"
        echo "  current             Show current environment status"
        echo "  save <name>         Save current config to environment"
        echo "  delete|rm <name>    Delete environment"
        echo ""
        echo "Examples:"
        echo "  $0 create development"
        echo "  $0 switch production"
        echo "  $0 save my-custom-setup"
        echo "  $0 list"
        exit 1
        ;;
esac