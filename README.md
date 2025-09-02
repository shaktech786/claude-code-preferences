# Claude Code Preferences

A centralized repository for all Claude Code preferences, settings, and tools that can be synced across devices and projects.

## 🎯 Purpose

This repository serves as a single source of truth for:
- Global Claude Code instructions (CLAUDE.md)
- Utility scripts for common tasks
- Project paths and configurations
- Tool permissions and settings
- Development best practices

## 📁 Structure

```
claude-code-preferences/
├── CLAUDE.md           # Main global instructions file
├── README.md           # This file
├── scripts/            # Utility scripts
│   ├── check-ai-teams.sh    # Monitor AI team status
│   ├── send-email.sh         # Send emails from anywhere
│   └── take-screenshot.sh    # Capture website screenshots
├── configs/            # Configuration files
│   ├── project-paths.json       # Project directory mappings
│   ├── tool-permissions.json    # Tool access permissions
│   └── development-settings.json # Development preferences
├── templates/          # Reusable templates
├── hooks/              # Git hooks and Claude hooks
└── install.sh          # Setup script for new devices
```

## 🚀 Quick Start

### Installation on New Device

1. Clone this repository:
```bash
git clone https://github.com/yourusername/claude-code-preferences.git
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

## 🛠️ Available Scripts

### AI Team Monitoring
```bash
./scripts/check-ai-teams.sh
```
Monitors AI team progress with git commit verification and token usage tracking.

### Email Sending
```bash
./scripts/send-email.sh <to> <subject> <body> [attachments...]
```
Send emails using the email-sender project from any location.

### Screenshot Capture
```bash
./scripts/take-screenshot.sh <url> <name>
```
Capture website screenshots in multiple formats (full, viewport, mobile).

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

### Auto-sync (Optional)
Add to your shell profile (.bashrc/.zshrc):
```bash
alias claude-sync="cd ~/projects/personal/claude-code-preferences && git pull"
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

Feel free to customize this repository for your personal use. If you discover useful patterns or tools, consider documenting them here.

## 📜 License

Personal use repository - customize as needed for your workflow.