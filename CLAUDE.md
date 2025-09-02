# Claude Code Global Preferences & Instructions

This file contains all global instructions and preferences for Claude Code usage across all projects and devices.

## 🧠 Response Style
- Always make ADHD-friendly responses
- Be concise and direct
- Use clear visual separators and formatting
- Break complex tasks into manageable chunks

## 💻 Development Practices

### TypeScript Best Practices
- Always use TypeScript best practices when dealing with TypeScript code
- Ensure code passes linters and type checks
- Follow existing project conventions and patterns
- Use proper type annotations and avoid `any` types

### Code Style Guidelines
- DO NOT ADD ***ANY*** COMMENTS unless explicitly asked
- Follow existing code conventions in the project
- Use existing libraries and utilities rather than introducing new ones
- Maintain consistent naming conventions
- Always follow security best practices
- Never expose or log secrets and keys
- Never commit secrets or keys to the repository

### File Management
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- Do what has been asked; nothing more, nothing less

## 🛡️ AI TEAM MONITORING PROTOCOL - MANDATORY

When checking on AI teams, ALWAYS use the MCP monitoring system for 100% accurate reports:

### Required Commands:
```bash
# For detailed status (ALWAYS use this first)
python3 /Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py

# For quick status
python3 /Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py --quick
```

### Never Again:
- ❌ Report "actively working" based on process status alone
- ❌ Assume progress without git commit verification
- ❌ Let AI teams waste tokens on approval prompts
- ❌ Give false progress reports

### Always Verify:
- ✅ Check actual git commits (the TRUTH of progress)
- ✅ Detect stuck approval prompts
- ✅ Verify token waste vs actual work
- ✅ Use MCP monitoring data for all status reports

### MCP Monitoring Features:
- Real-time git progress verification
- Automatic stuck prompt detection and fixing
- Token waste alerts via email
- Emergency intervention capabilities
- 100% accurate status reporting

This prevents the catastrophic 5-day token waste incident from EVER happening again.

## 📸 Web Screenshot & Scraping Tools

**IMPORTANT:** Whenever the user asks for screenshots, web scraping, or capturing websites, use these tools:

### Screenshot Tools Available:

1. **ShakTech Project Screenshot Tool** (if in shaktech-website directory):
```bash
npm run screenshot <url> <name>
npm run portfolio:screenshots
```

2. **Direct Puppeteer Execution** (works anywhere):
```bash
node /Users/shakeelbhamani/projects/personal/shaktech-website/scripts/capture-screenshot.js <url> <name>
```

### When User Asks For:
- "Take a screenshot of..." → Use the screenshot tool
- "Capture this website..." → Use the screenshot tool
- "Show me how X website looks..." → Take screenshot and show path
- "Get content from website..." → Use web scraper
- "Extract data from..." → Use web scraper with JSON output

### Output Locations:
- Screenshots: `/Users/shakeelbhamani/projects/personal/shaktech-website/public/portfolio-screenshots/`
- Creates: full page, viewport, and mobile versions
- Auto-generates metadata.json with details

## 📧 Email Tools

Always use the email tool when asked to send an email:
- Location: `/Users/shakeelbhamani/projects/personal/email-sender/`
- Can be used from any project location

## 🔧 Git Workflow

### Commit Guidelines:
- Only commit when explicitly asked by the user
- Never be too proactive with commits
- Always verify changes before committing
- Use clear, descriptive commit messages
- Include the Claude Code signature in commits when appropriate

### Testing & Verification:
- Always run lint and typecheck commands after implementing solutions
- Check README or search codebase to determine testing approach
- Never assume specific test frameworks
- Ask for test commands if not found and suggest writing to CLAUDE.md

## 📍 Project Paths & Locations

### Key Project Directories:
- Personal Projects: `/Users/shakeelbhamani/projects/personal/`
- Tmux Orchestrator: `/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/`
- ShakTech Website: `/Users/shakeelbhamani/projects/personal/shaktech-website/`
- Email Sender: `/Users/shakeelbhamani/projects/personal/email-sender/`
- Claude Preferences: `/Users/shakeelbhamani/projects/personal/claude-code-preferences/`

## 🚀 Tool Usage Policy

### Search & Discovery:
- When doing file search, prefer to use the Task tool to reduce context usage
- Proactively use the Task tool with specialized agents when tasks match agent descriptions
- Use TodoWrite tool frequently to track tasks and give visibility into progress

### Web Tools:
- When WebFetch returns a redirect, immediately make a new request with the redirect URL
- Batch multiple tool calls together for optimal performance
- Run multiple bash commands in parallel when possible

## ⚙️ Environment Information

- Platform: darwin (macOS)
- Working Directory: Variable (check with pwd)
- Today's Date: Check system date
- Model: Claude Opus 4.1

## 🎯 Important Reminders

1. **Focus on the task at hand** - Do what has been asked; nothing more, nothing less
2. **Verify before acting** - Always check existing code and conventions
3. **Be efficient** - Batch operations and minimize context usage
4. **Stay secure** - Never expose sensitive information
5. **Track progress** - Use TodoWrite tool for complex tasks
6. **Test thoroughly** - Run linters and tests after implementations