#!/bin/bash

# AI Team Monitoring Script
# Uses MCP monitoring system for accurate status reports

echo "🛡️ AI Team Status Check"
echo "========================"

# Check if monitoring script exists
MONITOR_SCRIPT="/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py"

if [ ! -f "$MONITOR_SCRIPT" ]; then
    echo "❌ Error: Monitoring script not found at $MONITOR_SCRIPT"
    echo "Please ensure Tmux-Orchestrator is installed"
    exit 1
fi

# Run detailed status check
echo "Running detailed status check..."
python3 "$MONITOR_SCRIPT"

# Ask if user wants quick status
echo ""
read -p "Do you want to see quick status? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python3 "$MONITOR_SCRIPT" --quick
fi