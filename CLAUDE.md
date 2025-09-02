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

# Send messages to running Claude instances
/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/send-claude-message.sh "message" [window] [pane]
```

### Never Again:
- ❌ Report "actively working" based on process status alone
- ❌ Assume progress without git commit verification
- ❌ Let AI teams waste tokens on approval prompts
- ❌ Give false progress reports
- ❌ Send tmux messages without proper timing (0.5s delay required)

### Always Verify:
- ✅ Check actual git commits (the TRUTH of progress)
- ✅ Detect stuck approval prompts
- ✅ Verify token waste vs actual work
- ✅ Use MCP monitoring data for all status reports
- ✅ Use send-claude-message.sh for reliable tmux communication

### MCP Monitoring Features:
- Real-time git progress verification
- Automatic stuck prompt detection and fixing
- Token waste alerts via email
- Emergency intervention capabilities
- 100% accurate status reporting
- 50+ stuck pattern detection and auto-recovery

### Git Discipline Protocol:
- **MANDATORY**: Commits every 30 minutes maximum
- Feature branch workflow with stable tags
- Meaningful commit messages with context
- Emergency recovery procedures for stuck agents

This prevents the catastrophic 5-day token waste incident from EVER happening again.

## 📸 Web Screenshot & Scraping Tools

**IMPORTANT:** Whenever the user asks for screenshots, web scraping, or capturing websites, use these tools:

### Screenshot Tools Available:

1. **ShakTech Project Screenshot Tool** (if in shaktech-website directory):
```bash
npm run screenshot <url> <name>
npm run portfolio:screenshots
npm run scrape <url>              # Extract content
npm run scrape:json <url>         # Extract as JSON
```

2. **Direct Puppeteer Execution** (works anywhere):
```bash
node /Users/shakeelbhamani/projects/personal/shaktech-website/scripts/capture-screenshot.js <url> <name>
node /Users/shakeelbhamani/projects/personal/shaktech-website/scripts/web-scraper.js <url> [json]
```

3. **Convenience Script** (from claude-code-preferences):
```bash
/Users/shakeelbhamani/projects/personal/claude-code-preferences/scripts/take-screenshot.sh <url> <name>
```

### Features:
- **Quality**: 2x device scale factor for retina quality
- **Multiple Formats**: Full-page, viewport, and mobile screenshots
- **Metadata**: Auto-generates metadata.json with capture details
- **Global Access**: Can be used from any project location

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
- **Personal Projects**: `/Users/shakeelbhamani/projects/personal/`
- **AI Stock Researcher**: `/Users/shakeelbhamani/projects/personal/ai-stock-researcher/`
- **Claude Preferences**: `/Users/shakeelbhamani/projects/personal/claude-code-preferences/`
- **Email Sender**: `/Users/shakeelbhamani/projects/personal/email-sender/`
- **FRS Image Generator**: `/Users/shakeelbhamani/projects/personal/frs-image-generator/`
- **Memory Bank**: `/Users/shakeelbhamani/projects/personal/memory-bank/`
- **Reels Editor**: `/Users/shakeelbhamani/projects/personal/reels-editor/`
- **ShakGPT**: `/Users/shakeelbhamani/projects/personal/shakgpt/`
- **ShakTech Website**: `/Users/shakeelbhamani/projects/personal/shaktech-website/`
- **Skystation Industries**: `/Users/shakeelbhamani/projects/personal/skystation-industries/`
- **Tmux Orchestrator**: `/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/`
- **Virtual AI Team Manager**: `/Users/shakeelbhamani/projects/personal/virtual-ai-team-manager/`

## 🤖 Multi-LLM Configuration Strategy

### Quality-First Approach:
- **GPT-4o**: Primary for complex analysis and reasoning
- **Claude Opus/Sonnet**: Deep reasoning, code review, architecture decisions
- **Claude Haiku**: Conversations, quick responses, cost optimization
- **Groq/Llama**: Fast inference for development tasks
- **OpenRouter**: Model comparison and fallback options

### Model Selection Guidelines:
- **Analysis & Research**: GPT-4o or Claude Opus
- **Code Generation**: Claude Sonnet or GPT-4o
- **Quick Responses**: Claude Haiku or Groq
- **Creative Writing**: GPT-4o or Claude Opus
- **Cost-Sensitive Tasks**: Claude Haiku or local models

### Fallback Systems:
- Always implement graceful degradation when AI fails
- Have backup models configured for critical operations
- Monitor usage costs and switch models based on budget
- Test different models for specific use cases

## 🧪 Advanced Testing Strategies

### Testing Framework Patterns:
```bash
# Vitest (Modern, fast)
npm run test                    # Run all tests
npm run test:ui                # Visual test interface
npm run test:coverage          # Coverage reports
npm run test:watch            # Watch mode

# Playwright (E2E)
npm run test:e2e              # End-to-end tests
npm run test:e2e:debug        # Debug mode
npm run test:e2e:headed       # Headed browser mode

# Specialized Tests
npm run test:midas-v2         # AI agent integration tests
npm run test:integration      # Integration test suite
npm run build:analyze         # Bundle analysis
```

### Testing Best Practices:
- **Integration Tests**: Test AI agent workflows end-to-end
- **Component Tests**: Individual component behavior
- **E2E Tests**: Full user journey testing
- **Performance Tests**: Load testing and benchmarking
- **AI Model Tests**: Compare outputs across different models

## 🚀 Tool Usage Policy

### Search & Discovery:
- When doing file search, prefer to use the Task tool to reduce context usage
- Proactively use the Task tool with specialized agents when tasks match agent descriptions
- Use TodoWrite tool frequently to track tasks and give visibility into progress

### Web Tools:
- When WebFetch returns a redirect, immediately make a new request with the redirect URL
- Batch multiple tool calls together for optimal performance
- Run multiple bash commands in parallel when possible

### Development Commands:
- **Standard Next.js**: `npm run dev --turbopack` (faster builds)
- **Build**: `npm run build` with timeout handling
- **Linting**: Always run before commits
- **Testing**: Run appropriate test suites after changes

## ⚙️ Environment Information

- Platform: darwin (macOS)
- Working Directory: Variable (check with pwd)
- Today's Date: Check system date
- Model: Claude Sonnet 4 (primary), with multi-LLM fallbacks available

## 🎯 Important Reminders

1. **Focus on the task at hand** - Do what has been asked; nothing more, nothing less
2. **Verify before acting** - Always check existing code and conventions
3. **Be efficient** - Batch operations and minimize context usage
4. **Stay secure** - Never expose sensitive information
5. **Track progress** - Use TodoWrite tool for complex tasks
6. **Test thoroughly** - Run linters and tests after implementations