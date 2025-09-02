#!/bin/bash

# Claude Code Preferences Installation Script
# Sets up Claude Code preferences on a new device

set -e

echo "🚀 Claude Code Preferences Installer"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Create Claude directory if it doesn't exist
echo "Step 1: Setting up Claude directory..."
CLAUDE_DIR="$HOME/.claude"
if [ ! -d "$CLAUDE_DIR" ]; then
    mkdir -p "$CLAUDE_DIR"
    print_status "Created ~/.claude directory"
else
    print_status "~/.claude directory already exists"
fi

# Step 2: Symlink or copy CLAUDE.md
echo ""
echo "Step 2: Setting up CLAUDE.md..."
CLAUDE_MD_SOURCE="$SCRIPT_DIR/CLAUDE.md"
CLAUDE_MD_DEST="$CLAUDE_DIR/CLAUDE.md"

if [ -f "$CLAUDE_MD_DEST" ]; then
    print_warning "CLAUDE.md already exists at $CLAUDE_MD_DEST"
    read -p "Do you want to (b)ackup and replace, (s)kip, or (m)erge? [b/s/m]: " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Bb]$ ]]; then
        mv "$CLAUDE_MD_DEST" "$CLAUDE_MD_DEST.backup.$(date +%Y%m%d_%H%M%S)"
        ln -sf "$CLAUDE_MD_SOURCE" "$CLAUDE_MD_DEST"
        print_status "Backed up existing CLAUDE.md and created symlink"
    elif [[ $REPLY =~ ^[Mm]$ ]]; then
        print_warning "Manual merge required. Please merge $CLAUDE_MD_SOURCE into $CLAUDE_MD_DEST"
    else
        print_status "Skipped CLAUDE.md setup"
    fi
else
    ln -sf "$CLAUDE_MD_SOURCE" "$CLAUDE_MD_DEST"
    print_status "Created symlink for CLAUDE.md"
fi

# Step 3: Make scripts executable
echo ""
echo "Step 3: Making scripts executable..."
chmod +x "$SCRIPT_DIR"/scripts/*.sh
print_status "All scripts in scripts/ are now executable"

# Step 4: Check for required dependencies
echo ""
echo "Step 4: Checking dependencies..."

# Check for Python3
if command -v python3 &> /dev/null; then
    print_status "Python3 is installed"
else
    print_error "Python3 is not installed. Please install Python3 for AI team monitoring"
fi

# Check for Node.js
if command -v node &> /dev/null; then
    print_status "Node.js is installed"
else
    print_error "Node.js is not installed. Please install Node.js for screenshot tools"
fi

# Check for Git
if command -v git &> /dev/null; then
    print_status "Git is installed"
else
    print_error "Git is not installed. Please install Git"
fi

# Step 5: Verify project dependencies
echo ""
echo "Step 5: Checking integrated projects..."

# Check Tmux-Orchestrator
TMUX_ORCH_DIR="/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator"
if [ -d "$TMUX_ORCH_DIR" ]; then
    print_status "Tmux-Orchestrator found"
else
    print_warning "Tmux-Orchestrator not found at $TMUX_ORCH_DIR"
    print_warning "AI team monitoring will not work until installed"
fi

# Check shaktech-website
SHAKTECH_DIR="/Users/shakeelbhamani/projects/personal/shaktech-website"
if [ -d "$SHAKTECH_DIR" ]; then
    print_status "ShakTech website found"
else
    print_warning "ShakTech website not found at $SHAKTECH_DIR"
    print_warning "Screenshot tools will not work until installed"
fi

# Check email-sender
EMAIL_DIR="/Users/shakeelbhamani/projects/personal/email-sender"
if [ -d "$EMAIL_DIR" ]; then
    print_status "Email sender found"
else
    print_warning "Email sender not found at $EMAIL_DIR"
    print_warning "Email functionality will not work until installed"
fi

# Step 6: Optional shell integration
echo ""
echo "Step 6: Shell integration (optional)..."
echo ""
echo "To add convenient aliases, add the following to your shell profile:"
echo ""
echo "  # Claude Code Preferences"
echo "  export CLAUDE_PREFS=\"$SCRIPT_DIR\""
echo "  alias claude-sync='cd \$CLAUDE_PREFS && git pull'"
echo "  alias claude-check-teams='\$CLAUDE_PREFS/scripts/check-ai-teams.sh'"
echo "  alias claude-screenshot='\$CLAUDE_PREFS/scripts/take-screenshot.sh'"
echo "  alias claude-email='\$CLAUDE_PREFS/scripts/send-email.sh'"
echo ""

read -p "Would you like to add these aliases to your shell profile? [y/N]: " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Detect shell
    if [ -n "$ZSH_VERSION" ]; then
        SHELL_PROFILE="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        SHELL_PROFILE="$HOME/.bashrc"
    else
        SHELL_PROFILE="$HOME/.profile"
    fi
    
    # Add aliases
    echo "" >> "$SHELL_PROFILE"
    echo "# Claude Code Preferences (added by install.sh)" >> "$SHELL_PROFILE"
    echo "export CLAUDE_PREFS=\"$SCRIPT_DIR\"" >> "$SHELL_PROFILE"
    echo "alias claude-sync='cd \$CLAUDE_PREFS && git pull'" >> "$SHELL_PROFILE"
    echo "alias claude-check-teams='\$CLAUDE_PREFS/scripts/check-ai-teams.sh'" >> "$SHELL_PROFILE"
    echo "alias claude-screenshot='\$CLAUDE_PREFS/scripts/take-screenshot.sh'" >> "$SHELL_PROFILE"
    echo "alias claude-email='\$CLAUDE_PREFS/scripts/send-email.sh'" >> "$SHELL_PROFILE"
    
    print_status "Added aliases to $SHELL_PROFILE"
    echo ""
    echo "Run 'source $SHELL_PROFILE' to load the aliases now"
else
    print_status "Skipped shell integration"
fi

# Step 7: Git setup
echo ""
echo "Step 7: Git repository setup..."

cd "$SCRIPT_DIR"

# Check if git repo is initialized
if [ ! -d .git ]; then
    git init
    print_status "Initialized git repository"
fi

# Add all files to git
git add .
print_status "Added all files to git"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and customize CLAUDE.md at ~/.claude/CLAUDE.md"
echo "2. Update project paths in configs/project-paths.json if needed"
echo "3. Commit your changes: git commit -m 'Initial setup'"
echo "4. Add remote repository: git remote add origin <your-repo-url>"
echo "5. Push to remote: git push -u origin main"
echo ""
echo "Use 'claude-sync' to pull latest preferences on other devices"
echo "(requires shell integration or manual git pull)"
echo ""