# Claude Code Preferences

[![Validate](https://github.com/shaktech786/claude-code-preferences/actions/workflows/validate.yml/badge.svg)](https://github.com/shaktech786/claude-code-preferences/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)

A comprehensive, production-ready system for managing Claude Code preferences, settings, and tools across devices and projects.

## 🎯 Purpose

This repository serves as a single source of truth for:
- Global Claude Code instructions (CLAUDE.md)
- Utility scripts for common tasks
- Project paths and configurations
- Tool permissions and settings
- Development best practices

## ⚡ Features

### 🎯 **Comprehensive Preference Management**
- **Multi-LLM Strategy**: Quality-first approach with GPT-4o, Claude, Groq
- **Advanced Testing**: Vitest, Playwright, E2E testing configurations
- **AI Team Monitoring**: MCP integration with real-time progress tracking
- **Git Discipline**: 30-minute commit protocol with automated enforcement

### 🛠️ **Production-Ready Tools**
- **15+ NPM Scripts**: Convenient shortcuts for all operations
- **8 Utility Scripts**: AI monitoring, screenshots, email, templates
- **4 Project Templates**: Next.js, Python, Node.js, generic projects
- **50+ Tool Permissions**: Comprehensive command allowlists

### 🔐 **Quality Assurance**
- **Automated Validation**: JSON, paths, permissions, security checks
- **Health Diagnostics**: Comprehensive system health monitoring
- **CI/CD Pipeline**: GitHub Actions for automated testing
- **Pre-commit Hooks**: Prevent bad commits before they happen

### 🌐 **Cross-Platform Support**
- **macOS & Linux**: Full platform compatibility
- **Device Sync**: Git-based preference synchronization
- **Project Integration**: Works with 12+ existing projects
- **Tool Integration**: Tmux, Puppeteer, MCP, email systems

## 📁 Structure

```
claude-code-preferences/
├── 📋 CLAUDE.md                    # Main global instructions file
├── 📄 README.md                    # This documentation
├── 🚀 install.sh                   # One-command setup script
├── 📦 package.json                 # NPM scripts and metadata
├── 📜 CHANGELOG.md                 # Version history
├── ⚖️ LICENSE                      # MIT License
├── 🔧 .editorconfig                # Code formatting rules
├── 📂 scripts/                     # Utility scripts (8 scripts)
│   ├── check-ai-teams.sh          # Monitor AI team status
│   ├── claude-messenger.sh         # Send messages to Claude instances
│   ├── doctor.js                   # Comprehensive health check
│   ├── multi-model-test.sh         # Test multiple LLM models
│   ├── project-sync.sh             # Sync across all projects
│   ├── send-email.sh               # Email automation
│   ├── take-screenshot.sh          # Website screenshots
│   ├── template-generator.sh       # Generate new project templates
│   └── validate-config.js          # Configuration validation
├── 📂 configs/                     # Configuration files
│   ├── development-settings.json  # Development preferences
│   ├── project-paths.json         # Project directory mappings (12 projects)
│   └── tool-permissions.json      # Tool access permissions (50+ commands)
├── 📂 templates/                   # Reusable project templates
│   ├── nextjs-settings.template   # Next.js specific settings
│   ├── nodejs-settings.template   # Node.js specific settings
│   ├── project-claude-md.template # Generic project CLAUDE.md
│   └── python-settings.template   # Python specific settings
├── 📂 hooks/                       # Git automation
│   └── pre-commit                  # Validation and security checks
└── 📂 .github/workflows/           # CI/CD automation
    └── validate.yml                # Automated testing and validation
```

## 🚀 Quick Start

### Installation on New Device

1. Clone this repository:
```bash
git clone git@github.com:shaktech786/claude-code-preferences.git
cd claude-code-preferences
```

2. Run the install script:
```bash
./install.sh
```

This will:
- Create symlink for CLAUDE.md to `~/.claude/CLAUDE.md`
- Make all scripts executable
- Set up necessary configurations

### Manual Setup

If you prefer manual setup:

1. Copy or symlink CLAUDE.md:
```bash
mkdir -p ~/.claude
ln -sf $(pwd)/CLAUDE.md ~/.claude/CLAUDE.md
```

2. Make scripts executable:
```bash
chmod +x scripts/*.sh
```

## 📊 NPM Scripts Reference

```bash
# Setup & Installation
npm run install        # Run install.sh setup script
npm run setup-hooks    # Install git pre-commit hooks

# Health & Validation
npm run validate       # Validate all configurations
npm run doctor         # Comprehensive health check
npm run health         # Alias for doctor
npm test              # Run validation and linting

# Project Management
npm run sync          # Sync preferences across projects
npm run generate      # Generate new project templates
npm run update-all    # Sync, validate, and health check

# Utility Tools
npm run check-teams   # Monitor AI team status
npm run screenshot    # Capture website screenshots
npm run send-email    # Send emails via automation
npm run message-claude # Send messages to Claude instances
npm run test-models   # Test multiple LLM models

# Maintenance
npm run lint          # Lint shell scripts (requires shellcheck)
npm run fix-permissions # Fix script permissions
```

## 🏥 Health Monitoring

Run comprehensive health checks:

```bash
npm run doctor
```

This checks:
- ✅ System dependencies (Node.js, Git, Python, etc.)
- ✅ CLAUDE.md symlink configuration
- ✅ Project path validation (12 projects)
- ✅ Tool integration status
- ✅ Git repository health
- ✅ Script permissions
- 📊 Overall health score and recommendations

## 🎨 Creating New Projects

Generate configured projects instantly:

```bash
npm run generate
```

Supports:
- **Next.js** projects with TypeScript, Tailwind, testing
- **Python** projects with virtual environments, pytest
- **Node.js** projects with Express, testing frameworks
- **Generic** projects with customizable templates

Each generated project includes:
- Project-specific CLAUDE.md
- Claude Code settings.local.json
- Proper directory structure
- Development commands

## 📋 Key Features

### Global Instructions (CLAUDE.md)
- ADHD-friendly response formatting
- TypeScript best practices enforcement
- Security-first development approach
- Automated tool usage permissions
- Project-specific configurations

### Configuration Files
- **project-paths.json**: Maps all project locations
- **tool-permissions.json**: Defines which tools can be used without approval
- **development-settings.json**: Development preferences and code style

### Integration Points
- Works with Tmux-Orchestrator for AI team monitoring
- Integrates with shaktech-website for screenshots
- Uses email-sender project for email functionality
- Syncs across all Claude Code instances

## 🔗 Integration Examples

### AI Team Monitoring
```bash
# Check all AI team progress
npm run check-teams

# Send message to specific Claude instance
npm run message-claude "Check git status" 0 0
```

### Website Screenshots
```bash
# Capture website in all formats
npm run screenshot https://example.com example-site

# Results in:
# - example-site-full.png (full page)
# - example-site-viewport.png (viewport)
# - example-site-mobile.png (mobile view)
# - metadata.json (capture details)
```

### Multi-Model Testing
```bash
# Test prompt across multiple LLM models
npm run test-models "Explain quantum computing" gpt-4o claude-opus haiku

# Compare quality, speed, and cost across models
```

## 🔄 Keeping Settings in Sync

### Push Changes
After making local changes:
```bash
git add .
git commit -m "Update preferences"
git push origin main
```

### Pull Updates
To get latest settings on another device:
```bash
git pull origin main
```

### Auto-sync (Recommended)
The install script can add convenient aliases to your shell profile:
```bash
# Added automatically by install.sh
export CLAUDE_PREFS="/path/to/claude-code-preferences"
alias claude-sync='cd $CLAUDE_PREFS && git pull'
alias claude-check-teams='$CLAUDE_PREFS/scripts/check-ai-teams.sh'
alias claude-screenshot='$CLAUDE_PREFS/scripts/take-screenshot.sh'
alias claude-email='$CLAUDE_PREFS/scripts/send-email.sh'
alias claude-doctor='$CLAUDE_PREFS/scripts/doctor.js'
```

## 🔗 Dependencies

This preferences system integrates with:
- **Tmux-Orchestrator**: For AI team monitoring
- **shaktech-website**: For screenshot capabilities
- **email-sender**: For email functionality

Ensure these projects are installed in their expected locations or update the paths in `configs/project-paths.json`.

## 📝 Customization

### Adding New Scripts
1. Create script in `scripts/` directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Update this README with usage instructions

### Modifying Preferences
1. Edit relevant files (CLAUDE.md or configs/)
2. Test changes locally
3. Commit and push to repository
4. Pull on other devices

### Adding Tool Permissions
Edit `configs/tool-permissions.json` to add new tools that Claude can use without approval.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Run `npm test` to validate changes
4. Submit a pull request

For major changes, please open an issue first to discuss what you would like to change.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [Claude Code](https://claude.ai/code) by Anthropic
- Integrates with Tmux-Orchestrator for AI team management
- Uses ShakTech website tools for screenshot capabilities
- Leverages MCP (Model Context Protocol) for AI monitoring