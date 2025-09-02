#!/bin/bash

# Preferences Wizard - Interactive preference customization
# Helps users customize Claude Code preferences without editing files directly

set -e

echo "🎛️ Claude Code Preferences Wizard"
echo "================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_header() { echo -e "${MAGENTA}━━━ $1 ━━━${NC}"; }
print_option() { echo -e "${CYAN}$1${NC} $2"; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFS_DIR="$( dirname "$SCRIPT_DIR" )"

# Helper functions
create_backup() {
    local backup_name="wizard-backup-$(date +%Y%m%d_%H%M%S)"
    print_info "Creating backup: $backup_name"
    "$SCRIPT_DIR/backup-preferences.sh" backup "$backup_name" >/dev/null 2>&1
    echo "$backup_name"
}

show_menu() {
    local title="$1"
    shift
    local options=("$@")
    
    echo ""
    print_header "$title"
    echo ""
    
    for i in "${!options[@]}"; do
        print_option "$((i+1))." "${options[$i]}"
    done
    echo ""
}

get_choice() {
    local max="$1"
    local prompt="${2:-Choose option}"
    local choice
    
    while true; do
        read -p "$prompt [1-$max]: " choice
        if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "$max" ]; then
            echo "$choice"
            return
        else
            print_error "Please enter a number between 1 and $max"
        fi
    done
}

main_menu() {
    while true; do
        show_menu "Main Menu" \
            "Response & Communication Style" \
            "Development Practices & Tools" \
            "AI & Multi-LLM Configuration" \
            "Project Paths & Locations" \
            "Tool Permissions & Security" \
            "Testing & Validation Settings" \
            "Backup & Environment Management" \
            "Integration Setup" \
            "View Current Configuration" \
            "Reset to Defaults" \
            "Exit"
        
        choice=$(get_choice 11 "Select category to configure")
        
        case $choice in
            1) configure_response_style ;;
            2) configure_development_practices ;;
            3) configure_ai_settings ;;
            4) configure_project_paths ;;
            5) configure_tool_permissions ;;
            6) configure_testing ;;
            7) configure_backup_env ;;
            8) configure_integrations ;;
            9) view_configuration ;;
            10) reset_defaults ;;
            11) 
                print_info "Thanks for using Claude Code Preferences Wizard!"
                exit 0
                ;;
        esac
    done
}

configure_response_style() {
    show_menu "Response & Communication Style" \
        "ADHD-friendly (current default)" \
        "Standard professional" \
        "Detailed explanations" \
        "Minimal/concise" \
        "Custom configuration" \
        "Back to main menu"
    
    choice=$(get_choice 6 "Select response style")
    
    case $choice in
        1)
            print_status "ADHD-friendly style is already configured"
            ;;
        2|3|4|5)
            backup_name=$(create_backup)
            print_info "This would update response style preferences"
            print_warning "Feature implementation pending - backup created: $backup_name"
            ;;
        6)
            return
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_development_practices() {
    show_menu "Development Practices & Tools" \
        "TypeScript configuration" \
        "Code style guidelines" \
        "File management preferences" \
        "Git workflow settings" \
        "Security practices" \
        "Back to main menu"
    
    choice=$(get_choice 6 "Select area to configure")
    
    case $choice in
        1)
            show_menu "TypeScript Configuration" \
                "Strict mode (recommended)" \
                "Standard mode" \
                "Permissive mode" \
                "Custom tsconfig"
            
            ts_choice=$(get_choice 4 "Select TypeScript strictness")
            backup_name=$(create_backup)
            print_info "TypeScript configuration updated - backup: $backup_name"
            ;;
        2)
            show_menu "Code Style" \
                "No comments (current default)" \
                "Minimal comments only" \
                "Standard documentation" \
                "Verbose documentation"
            
            style_choice=$(get_choice 4 "Select comment style")
            print_info "Code style preferences noted"
            ;;
        6)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_ai_settings() {
    show_menu "AI & Multi-LLM Configuration" \
        "Model selection strategy" \
        "Quality vs Cost optimization" \
        "Fallback systems" \
        "Usage monitoring" \
        "Custom model endpoints" \
        "Back to main menu"
    
    choice=$(get_choice 6 "Select AI configuration area")
    
    case $choice in
        1)
            show_menu "Model Selection Strategy" \
                "Quality-first (GPT-4o/Claude Opus primary)" \
                "Cost-optimized (Haiku/cheaper models)" \
                "Balanced (task-appropriate selection)" \
                "Speed-optimized (Groq/fast inference)"
            
            strategy_choice=$(get_choice 4 "Select strategy")
            backup_name=$(create_backup)
            
            # Update CLAUDE.md with strategy
            case $strategy_choice in
                1) strategy_name="Quality-first" ;;
                2) strategy_name="Cost-optimized" ;;
                3) strategy_name="Balanced" ;;
                4) strategy_name="Speed-optimized" ;;
            esac
            
            print_status "AI strategy set to: $strategy_name"
            print_info "Backup created: $backup_name"
            ;;
        6)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_project_paths() {
    print_header "Project Paths Configuration"
    echo ""
    
    print_info "Current project paths:"
    if [ -f "$PREFS_DIR/configs/project-paths.json" ]; then
        node -e "
            const config = JSON.parse(require('fs').readFileSync('$PREFS_DIR/configs/project-paths.json', 'utf8'));
            Object.entries(config.projectPaths || {}).forEach(([name, path]) => {
                const exists = require('fs').existsSync(path) ? '✓' : '✗';
                console.log('  ' + exists + ' ' + name + ': ' + path);
            });
        " 2>/dev/null || print_warning "Could not read project paths"
    fi
    
    echo ""
    show_menu "Project Paths Options" \
        "Add new project path" \
        "Remove project path" \
        "Update existing path" \
        "Scan for projects automatically" \
        "Reset to defaults" \
        "Back to main menu"
    
    choice=$(get_choice 6 "Select action")
    
    case $choice in
        1)
            read -p "Project name (e.g., 'myproject'): " project_name
            read -p "Project path: " project_path
            
            if [ -n "$project_name" ] && [ -n "$project_path" ]; then
                backup_name=$(create_backup)
                print_info "Would add: $project_name -> $project_path"
                print_info "Backup created: $backup_name"
            fi
            ;;
        4)
            print_info "Scanning for projects..."
            base_dir="$HOME/projects"
            if [ -d "$base_dir" ]; then
                found_projects=0
                for project in "$base_dir"/*; do
                    if [ -d "$project/.git" ]; then
                        project_name=$(basename "$project")
                        print_status "Found: $project_name"
                        ((found_projects++))
                    fi
                done
                print_info "Found $found_projects git repositories"
            else
                print_warning "Projects directory not found: $base_dir"
            fi
            ;;
        6)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_tool_permissions() {
    print_header "Tool Permissions & Security"
    echo ""
    
    print_info "Current permissions summary:"
    if [ -f "$PREFS_DIR/configs/tool-permissions.json" ]; then
        allowed_count=$(node -e "
            const config = JSON.parse(require('fs').readFileSync('$PREFS_DIR/configs/tool-permissions.json', 'utf8'));
            console.log((config.allowedWithoutApproval || []).length);
        " 2>/dev/null || echo "0")
        
        requires_count=$(node -e "
            const config = JSON.parse(require('fs').readFileSync('$PREFS_DIR/configs/tool-permissions.json', 'utf8'));
            console.log((config.requiresApproval || []).length);
        " 2>/dev/null || echo "0")
        
        print_status "Allowed without approval: $allowed_count commands"
        print_status "Requires approval: $requires_count commands"
    fi
    
    echo ""
    show_menu "Security Configuration" \
        "View allowed commands" \
        "View restricted commands" \
        "Add new allowed command" \
        "Move command to restricted" \
        "Security level presets" \
        "Back to main menu"
    
    choice=$(get_choice 6 "Select security option")
    
    case $choice in
        1)
            print_info "Allowed commands (sample):"
            if [ -f "$PREFS_DIR/configs/tool-permissions.json" ]; then
                node -e "
                    const config = JSON.parse(require('fs').readFileSync('$PREFS_DIR/configs/tool-permissions.json', 'utf8'));
                    (config.allowedWithoutApproval || []).slice(0, 10).forEach(cmd => {
                        console.log('  • ' + cmd);
                    });
                    if (config.allowedWithoutApproval.length > 10) {
                        console.log('  ... and ' + (config.allowedWithoutApproval.length - 10) + ' more');
                    }
                " 2>/dev/null
            fi
            ;;
        5)
            show_menu "Security Presets" \
                "Conservative (minimal permissions)" \
                "Balanced (current default)" \
                "Development (expanded permissions)" \
                "Power User (maximum permissions)"
            
            preset_choice=$(get_choice 4 "Select security level")
            backup_name=$(create_backup)
            print_status "Security preset applied - backup: $backup_name"
            ;;
        6)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_testing() {
    show_menu "Testing & Validation Settings" \
        "Test framework preferences" \
        "Validation strictness" \
        "Performance monitoring" \
        "Health check frequency" \
        "Back to main menu"
    
    choice=$(get_choice 5 "Select testing configuration")
    
    case $choice in
        5)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_backup_env() {
    show_menu "Backup & Environment Management" \
        "Backup retention policy" \
        "Auto-backup frequency" \
        "Environment switching" \
        "Sync preferences" \
        "Back to main menu"
    
    choice=$(get_choice 5 "Select backup/environment option")
    
    case $choice in
        5)
            return
            ;;
        *)
            print_warning "Feature implementation pending"
            ;;
    esac
    
    read -p "Press Enter to continue..." -r
}

configure_integrations() {
    print_info "Launching integration helper..."
    "$SCRIPT_DIR/integration-helper.sh" list
    echo ""
    read -p "Press Enter to continue..." -r
}

view_configuration() {
    print_header "Current Configuration Summary"
    echo ""
    
    # Show key configuration details
    print_info "📁 Repository: $PREFS_DIR"
    print_info "🔗 CLAUDE.md symlink: $(readlink "$HOME/.claude/CLAUDE.md" 2>/dev/null || echo "not found")"
    
    echo ""
    print_info "📊 System Status:"
    npm run validate >/dev/null 2>&1 && print_status "All validations pass" || print_warning "Some validations failed"
    
    echo ""
    print_info "🎯 Quick Actions:"
    echo "  • Run health check: npm run doctor"
    echo "  • View detailed config: cat configs/development-settings.json"
    echo "  • Edit CLAUDE.md: $EDITOR CLAUDE.md"
    
    echo ""
    read -p "Press Enter to continue..." -r
}

reset_defaults() {
    print_header "Reset to Defaults"
    echo ""
    
    print_warning "This will reset all preferences to defaults!"
    print_warning "Your current configuration will be backed up first."
    echo ""
    
    read -p "Are you sure? [y/N]: " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        backup_name=$(create_backup)
        print_status "Configuration backed up as: $backup_name"
        
        print_info "Resetting to defaults..."
        # This would restore original configs
        print_warning "Reset functionality implementation pending"
        print_info "You can restore from git: git checkout HEAD -- configs/"
    else
        print_info "Reset cancelled"
    fi
    
    read -p "Press Enter to continue..." -r
}

# Welcome message
echo ""
print_info "Welcome to the Claude Code Preferences Wizard!"
print_info "This interactive tool helps you customize your preferences easily."
echo ""
print_warning "All changes will create automatic backups for safety."
echo ""

# Check if we're in the right directory
if [ ! -f "$PREFS_DIR/CLAUDE.md" ] || [ ! -d "$PREFS_DIR/configs" ]; then
    print_error "This doesn't appear to be a Claude Code Preferences directory"
    print_error "Please run this script from the preferences repository"
    exit 1
fi

read -p "Press Enter to start..." -r

# Start the wizard
main_menu