#!/bin/bash

# Integration Helper for Claude Code Preferences
# Assists with setting up integrations with external tools and projects

set -e

echo "🔗 Claude Code Integration Helper"
echo "================================"

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

COMMAND="${1:-list}"

case "$COMMAND" in
    "list"|"ls")
        print_header "Available Integrations"
        echo ""
        
        echo "🤖 AI & Automation:"
        echo "  tmux-orchestrator    # Multi-agent Claude orchestration"
        echo "  virtual-ai-teams     # Production AI development teams"
        echo ""
        
        echo "🌐 Web & Screenshots:"
        echo "  shaktech-website     # Screenshot and web scraping tools"
        echo "  puppeteer-server     # Headless browser automation"
        echo ""
        
        echo "📧 Communication:"
        echo "  email-sender         # MCP-based email automation"
        echo "  slack-integration    # Slack notifications and updates"
        echo ""
        
        echo "🔧 Development Tools:"
        echo "  vscode               # VS Code settings sync"
        echo "  github-actions       # CI/CD workflow templates"
        echo "  docker-compose       # Container development setup"
        echo ""
        
        echo "Usage: $0 setup <integration_name>"
        ;;
        
    "setup")
        INTEGRATION="${2:-}"
        
        if [ -z "$INTEGRATION" ]; then
            print_error "Please specify integration to set up"
            echo "Run: $0 list to see available integrations"
            exit 1
        fi
        
        case "$INTEGRATION" in
            "tmux-orchestrator")
                print_header "Tmux Orchestrator Integration Setup"
                echo ""
                
                ORCHESTRATOR_PATH="/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator"
                
                print_info "Checking Tmux-Orchestrator installation..."
                if [ -d "$ORCHESTRATOR_PATH" ]; then
                    print_status "Found at: $ORCHESTRATOR_PATH"
                    
                    # Check required files
                    REQUIRED_FILES=(
                        "claude-monitoring-mcp-client.py"
                        "send-claude-message.sh"
                    )
                    
                    ALL_FOUND=true
                    for file in "${REQUIRED_FILES[@]}"; do
                        if [ -f "$ORCHESTRATOR_PATH/$file" ]; then
                            print_status "  ✓ $file"
                        else
                            print_error "  ✗ $file (missing)"
                            ALL_FOUND=false
                        fi
                    done
                    
                    if [ "$ALL_FOUND" = "true" ]; then
                        print_status "Tmux-Orchestrator is ready for integration!"
                        
                        # Test the monitoring script
                        print_info "Testing monitoring integration..."
                        if python3 "$ORCHESTRATOR_PATH/claude-monitoring-mcp-client.py" --help >/dev/null 2>&1; then
                            print_status "Monitoring script works"
                        else
                            print_warning "Monitoring script test failed (may need dependencies)"
                        fi
                        
                        print_info "Integration ready! You can now use:"
                        echo "  • npm run check-teams"
                        echo "  • npm run message-claude"
                        echo "  • claude-teams (if shell aliases installed)"
                        
                    else
                        print_error "Some required files are missing"
                        print_info "Please ensure Tmux-Orchestrator is properly installed"
                    fi
                else
                    print_error "Tmux-Orchestrator not found at expected location"
                    print_info "Expected: $ORCHESTRATOR_PATH"
                    echo ""
                    print_info "To set up:"
                    echo "  1. Clone: git clone <repo_url> $ORCHESTRATOR_PATH"
                    echo "  2. Follow Tmux-Orchestrator setup instructions"
                    echo "  3. Run this integration setup again"
                fi
                ;;
                
            "shaktech-website")
                print_header "ShakTech Website Integration Setup"
                echo ""
                
                WEBSITE_PATH="/Users/shakeelbhamani/projects/personal/shaktech-website"
                
                print_info "Checking ShakTech Website installation..."
                if [ -d "$WEBSITE_PATH" ]; then
                    print_status "Found at: $WEBSITE_PATH"
                    
                    # Check screenshot tools
                    SCREENSHOT_SCRIPT="$WEBSITE_PATH/scripts/capture-screenshot.js"
                    if [ -f "$SCREENSHOT_SCRIPT" ]; then
                        print_status "  ✓ Screenshot tool available"
                        
                        # Test dependencies
                        print_info "Checking dependencies..."
                        cd "$WEBSITE_PATH"
                        if [ -f "package.json" ] && npm list puppeteer >/dev/null 2>&1; then
                            print_status "  ✓ Puppeteer installed"
                        else
                            print_warning "  ⚠ Puppeteer may need installation"
                            print_info "    Run: cd $WEBSITE_PATH && npm install"
                        fi
                        
                        print_status "Screenshot integration ready!"
                        print_info "You can now use:"
                        echo "  • npm run screenshot <url> <name>"
                        echo "  • ./scripts/take-screenshot.sh <url> <name>"
                        
                    else
                        print_error "Screenshot script not found"
                        print_info "Expected: $SCREENSHOT_SCRIPT"
                    fi
                else
                    print_error "ShakTech Website not found"
                    print_info "Expected: $WEBSITE_PATH"
                    print_info "Please clone and set up the shaktech-website project"
                fi
                ;;
                
            "email-sender")
                print_header "Email Sender Integration Setup"
                echo ""
                
                EMAIL_PATH="/Users/shakeelbhamani/projects/personal/email-sender"
                
                print_info "Checking Email Sender installation..."
                if [ -d "$EMAIL_PATH" ]; then
                    print_status "Found at: $EMAIL_PATH"
                    
                    # Check if it's an MCP server
                    if [ -f "$EMAIL_PATH/package.json" ]; then
                        print_info "Checking MCP configuration..."
                        if grep -q "mcp" "$EMAIL_PATH/package.json" 2>/dev/null; then
                            print_status "  ✓ MCP-based email sender"
                        else
                            print_info "  ℹ Standard email sender"
                        fi
                    fi
                    
                    print_status "Email integration ready!"
                    print_info "You can now use:"
                    echo "  • npm run send-email"
                    echo "  • ./scripts/send-email.sh"
                    
                else
                    print_error "Email Sender not found"
                    print_info "Expected: $EMAIL_PATH"
                    print_info "Please set up the email-sender project"
                fi
                ;;
                
            "vscode")
                print_header "VS Code Integration Setup"
                echo ""
                
                print_info "Setting up VS Code settings sync..."
                
                VSCODE_SETTINGS_DIR="$HOME/.vscode"
                if [ "$(uname)" = "Darwin" ]; then
                    VSCODE_SETTINGS_DIR="$HOME/Library/Application Support/Code/User"
                fi
                
                if [ -d "$VSCODE_SETTINGS_DIR" ]; then
                    print_status "VS Code settings directory found"
                    
                    # Create VS Code configuration for Claude Code
                    CLAUDE_VSCODE_DIR="$PREFS_DIR/integrations/vscode"
                    mkdir -p "$CLAUDE_VSCODE_DIR"
                    
                    # Create recommended extensions
                    cat > "$CLAUDE_VSCODE_DIR/extensions.json" << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "timonwong.shellcheck",
    "ms-python.python",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
EOF
                    
                    # Create workspace settings
                    cat > "$CLAUDE_VSCODE_DIR/settings.json" << 'EOF'
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "shellcheck.enable": true,
  "json.format.enable": true,
  "typescript.preferences.quoteStyle": "single",
  "javascript.preferences.quoteStyle": "single"
}
EOF
                    
                    print_status "VS Code configuration created"
                    print_info "Files created in: $CLAUDE_VSCODE_DIR"
                    echo "  • Copy settings.json to your VS Code User directory"
                    echo "  • Copy extensions.json to .vscode/ in your projects"
                    
                else
                    print_warning "VS Code not found or not configured"
                    print_info "Install VS Code and run this setup again"
                fi
                ;;
                
            "github-actions")
                print_header "GitHub Actions Integration Setup"
                echo ""
                
                print_info "Creating GitHub Actions workflow templates..."
                
                WORKFLOWS_DIR="$PREFS_DIR/templates/github-workflows"
                mkdir -p "$WORKFLOWS_DIR"
                
                # Create Next.js workflow template
                cat > "$WORKFLOWS_DIR/nextjs-ci.yml" << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build project
      run: npm run build
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      if: matrix.node-version == 18
EOF
                
                print_status "GitHub Actions templates created"
                print_info "Templates available in: $WORKFLOWS_DIR"
                echo "  • Copy to .github/workflows/ in your projects"
                echo "  • Customize as needed for your specific projects"
                ;;
                
            *)
                print_error "Unknown integration: $INTEGRATION"
                print_info "Run: $0 list to see available integrations"
                exit 1
                ;;
        esac
        ;;
        
    "check"|"status")
        print_header "Integration Status Check"
        echo ""
        
        # Check each integration
        INTEGRATIONS=(
            "Tmux-Orchestrator:/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator"
            "ShakTech Website:/Users/shakeelbhamani/projects/personal/shaktech-website" 
            "Email Sender:/Users/shakeelbhamani/projects/personal/email-sender"
            "AI Stock Researcher:/Users/shakeelbhamani/projects/personal/ai-stock-researcher"
            "Virtual AI Teams:/Users/shakeelbhamani/projects/personal/virtual-ai-team-manager"
        )
        
        for integration in "${INTEGRATIONS[@]}"; do
            name="${integration%:*}"
            path="${integration#*:}"
            
            if [ -d "$path" ]; then
                print_status "$name"
            else
                print_warning "$name (not installed)"
            fi
        done
        
        echo ""
        print_info "Run '$0 setup <integration>' to configure specific integrations"
        ;;
        
    *)
        echo ""
        echo "Usage: $0 <command> [integration]"
        echo ""
        echo "Commands:"
        echo "  list                List available integrations"
        echo "  setup <name>        Set up specific integration"
        echo "  check               Check status of all integrations"
        echo ""
        echo "Available integrations:"
        echo "  tmux-orchestrator   Multi-agent Claude orchestration"
        echo "  shaktech-website    Screenshot and web tools"
        echo "  email-sender        Email automation"
        echo "  vscode              VS Code settings sync"
        echo "  github-actions      CI/CD workflow templates"
        echo ""
        exit 1
        ;;
esac