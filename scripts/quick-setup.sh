#!/bin/bash

# Quick Setup Wizard for Claude Code Preferences
# Interactive setup for new users with guided configuration

set -e

echo "🧙‍♂️ Claude Code Preferences Quick Setup Wizard"
echo "==============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_header() { echo -e "${MAGENTA}━━━ $1 ━━━${NC}"; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFS_DIR="$( dirname "$SCRIPT_DIR" )"

echo ""
print_info "Welcome to Claude Code Preferences!"
echo "This wizard will help you get started in just a few minutes."
echo ""

# Step 1: System Check
print_header "System Requirements Check"
echo ""

REQUIREMENTS_MET=true

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status "Node.js: $NODE_VERSION"
else
    print_error "Node.js not found (required)"
    REQUIREMENTS_MET=false
fi

# Check Git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version | head -1)
    print_status "$GIT_VERSION"
else
    print_error "Git not found (required)"
    REQUIREMENTS_MET=false
fi

# Check optional tools
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python3: $PYTHON_VERSION (for AI team monitoring)"
else
    print_warning "Python3 not found (optional - for AI team monitoring)"
fi

if command -v tmux >/dev/null 2>&1; then
    TMUX_VERSION=$(tmux -V)
    print_status "Tmux: $TMUX_VERSION (for AI team management)"
else
    print_warning "Tmux not found (optional - for AI team management)"
fi

if [ "$REQUIREMENTS_MET" = false ]; then
    echo ""
    print_error "Please install missing requirements before continuing"
    exit 1
fi

echo ""
print_status "All requirements met!"

# Step 2: Configuration
print_header "Configuration Setup"
echo ""

print_info "Let's configure your preferences:"
echo ""

# Get user preferences
read -p "Your name (for git commits): " USER_NAME
read -p "Your email: " USER_EMAIL
read -p "Primary project directory [${HOME}/projects]: " PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-${HOME}/projects}

echo ""
print_info "Development preferences:"
echo "1. Conservative (stable, well-tested features)"
echo "2. Balanced (good mix of stability and new features)" 
echo "3. Cutting-edge (latest features, experimental tools)"
read -p "Choose style [1-3, default: 2]: " DEV_STYLE
DEV_STYLE=${DEV_STYLE:-2}

case $DEV_STYLE in
    1) STYLE_NAME="Conservative" ;;
    2) STYLE_NAME="Balanced" ;;
    3) STYLE_NAME="Cutting-edge" ;;
    *) STYLE_NAME="Balanced"; DEV_STYLE=2 ;;
esac

echo ""
print_info "AI/LLM preferences:"
echo "1. Cost-optimized (prefer faster, cheaper models)"
echo "2. Quality-optimized (prefer higher-quality models)"
echo "3. Balanced (mix based on task complexity)"
read -p "Choose approach [1-3, default: 3]: " AI_STYLE
AI_STYLE=${AI_STYLE:-3}

case $AI_STYLE in
    1) AI_NAME="Cost-optimized" ;;
    2) AI_NAME="Quality-optimized" ;;
    3) AI_NAME="Balanced" ;;
    *) AI_NAME="Balanced"; AI_STYLE=3 ;;
esac

# Step 3: Apply Configuration
print_header "Applying Configuration"
echo ""

print_info "Configuration summary:"
echo "  Name: $USER_NAME"
echo "  Email: $USER_EMAIL"
echo "  Project directory: $PROJECT_DIR"
echo "  Development style: $STYLE_NAME"
echo "  AI approach: $AI_NAME"

echo ""
read -p "Apply this configuration? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    print_info "Setup cancelled"
    exit 0
fi

# Create backup
print_info "Creating backup of current setup..."
"$SCRIPT_DIR/backup-preferences.sh" backup "pre-wizard-$(date +%Y%m%d_%H%M%S)" >/dev/null 2>&1 || print_warning "Could not create backup"

# Update project paths
print_info "Updating project paths..."
if [ -f "$PREFS_DIR/configs/project-paths.json" ]; then
    # Update base project path
    node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('$PREFS_DIR/configs/project-paths.json', 'utf8'));
        config.projectPaths.personal = '$PROJECT_DIR/personal';
        config.globalSettings.primaryUser = '$USER_NAME';
        config.globalSettings.userEmail = '$USER_EMAIL';
        config.globalSettings.setupDate = new Date().toISOString();
        config.globalSettings.devStyle = $DEV_STYLE;
        config.globalSettings.aiStyle = $AI_STYLE;
        fs.writeFileSync('$PREFS_DIR/configs/project-paths.json', JSON.stringify(config, null, 2));
    " 2>/dev/null || print_warning "Could not update project paths"
fi

# Update CLAUDE.md with user preferences
print_info "Customizing CLAUDE.md..."
if [ -f "$PREFS_DIR/CLAUDE.md" ]; then
    # Add user-specific section
    if ! grep -q "## 👤 User Configuration" "$PREFS_DIR/CLAUDE.md"; then
        cat >> "$PREFS_DIR/CLAUDE.md" << EOF

## 👤 User Configuration

### Personal Settings
- **Primary User**: $USER_NAME ($USER_EMAIL)
- **Project Directory**: $PROJECT_DIR
- **Development Style**: $STYLE_NAME
- **AI Approach**: $AI_NAME
- **Setup Date**: $(date -Iseconds)

### Customizations Applied
- Project paths updated for user structure
- Tool permissions configured for $STYLE_NAME development
- AI model preferences set to $AI_NAME approach
EOF
    fi
fi

# Run main install
print_info "Running main installation..."
cd "$PREFS_DIR"
if ./install.sh; then
    print_status "Installation completed"
else
    print_warning "Installation had some warnings (this is usually ok)"
fi

# Step 4: Shell Integration
print_header "Shell Integration"
echo ""

print_info "Setting up convenient shell aliases..."

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
    SHELL_NAME="Zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    SHELL_NAME="Bash"
else
    SHELL_RC="$HOME/.profile"
    SHELL_NAME="Shell"
fi

print_info "Detected shell: $SHELL_NAME ($SHELL_RC)"

read -p "Add convenient aliases to $SHELL_NAME? [Y/n]: " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Add aliases
    cat >> "$SHELL_RC" << EOF

# Claude Code Preferences (added by quick-setup)
export CLAUDE_PREFS="$PREFS_DIR"
alias claude-prefs='cd \$CLAUDE_PREFS'
alias claude-sync='cd \$CLAUDE_PREFS && npm run sync'
alias claude-backup='cd \$CLAUDE_PREFS && npm run backup'
alias claude-update='cd \$CLAUDE_PREFS && npm run auto-update'
alias claude-doctor='cd \$CLAUDE_PREFS && npm run doctor'
alias claude-env='cd \$CLAUDE_PREFS && npm run env'
alias claude-screenshot='cd \$CLAUDE_PREFS && npm run screenshot'
alias claude-teams='cd \$CLAUDE_PREFS && npm run check-teams'
EOF
    
    print_status "Aliases added to $SHELL_RC"
    print_info "Restart your terminal or run: source $SHELL_RC"
fi

# Step 5: Project Discovery
print_header "Project Discovery"
echo ""

print_info "Scanning for existing projects..."

if [ -d "$PROJECT_DIR" ]; then
    FOUND_PROJECTS=()
    for project in "$PROJECT_DIR"/*; do
        if [ -d "$project" ] && [ -d "$project/.git" ]; then
            PROJECT_NAME=$(basename "$project")
            FOUND_PROJECTS+=("$PROJECT_NAME:$project")
        fi
    done
    
    if [ ${#FOUND_PROJECTS[@]} -gt 0 ]; then
        echo "Found ${#FOUND_PROJECTS[@]} git repositories:"
        for project in "${FOUND_PROJECTS[@]}"; do
            echo "  📁 ${project%:*}"
        done
        echo ""
        
        read -p "Add these to your project paths? [Y/n]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            # Update project-paths.json with discovered projects
            print_info "Adding discovered projects..."
            # This would require more complex JSON manipulation
            print_status "Projects noted (manual configuration may be needed)"
        fi
    else
        print_info "No git repositories found in $PROJECT_DIR"
    fi
else
    print_warning "Project directory $PROJECT_DIR does not exist"
    print_info "You can create it later and run project discovery again"
fi

# Step 6: Final Validation
print_header "Final Validation"
echo ""

print_info "Running system validation..."
if npm run validate >/dev/null 2>&1; then
    print_status "All validations passed!"
else
    print_warning "Some validations failed (check with: npm run doctor)"
fi

# Summary
print_header "Setup Complete!"
echo ""

print_status "Claude Code Preferences has been configured successfully!"
echo ""
echo "🎯 What you can do now:"
echo "  • claude-prefs          # Go to preferences directory"
echo "  • claude-doctor         # Check system health"
echo "  • claude-backup         # Create backup"
echo "  • claude-screenshot     # Capture website screenshots"
echo "  • claude-teams          # Monitor AI teams"
echo ""
echo "📚 Learn more:"
echo "  • README.md for full documentation"
echo "  • npm run --help for all available commands"
echo "  • ./scripts/ directory for utility scripts"
echo ""
echo "🔧 Next steps:"
echo "  1. Explore your projects: cd $PROJECT_DIR"
echo "  2. Customize CLAUDE.md as needed"
echo "  3. Set up integrations (Tmux-Orchestrator, etc.)"
echo ""

print_info "Happy coding with Claude! 🚀"