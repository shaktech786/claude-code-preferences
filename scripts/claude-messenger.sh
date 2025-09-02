#!/bin/bash

# Claude Messenger - Enhanced Tmux Communication
# Uses the proven send-claude-message.sh with proper timing

SEND_MESSAGE_SCRIPT="/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/send-claude-message.sh"

if [ ! -f "$SEND_MESSAGE_SCRIPT" ]; then
    echo "❌ Error: send-claude-message.sh not found at $SEND_MESSAGE_SCRIPT"
    echo "Please ensure Tmux-Orchestrator is installed"
    exit 1
fi

# Check arguments
if [ $# -lt 1 ]; then
    echo "Usage: $0 <message> [window] [pane]"
    echo "Example: $0 'git status' 0 0"
    echo "Example: $0 'Check progress on feature-branch'"
    exit 1
fi

MESSAGE="$1"
WINDOW="${2:-}"
PANE="${3:-}"

echo "📨 Sending message to Claude instance..."
echo "Message: $MESSAGE"

if [ -n "$WINDOW" ] && [ -n "$PANE" ]; then
    echo "Target: Window $WINDOW, Pane $PANE"
    "$SEND_MESSAGE_SCRIPT" "$MESSAGE" "$WINDOW" "$PANE"
else
    echo "Target: Active session"
    "$SEND_MESSAGE_SCRIPT" "$MESSAGE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Message sent successfully!"
    echo "Note: Message includes proper 0.5s timing delay to prevent errors"
else
    echo "❌ Failed to send message"
    echo "Check that the target tmux session/window/pane exists"
    exit 1
fi