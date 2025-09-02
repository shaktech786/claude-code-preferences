#!/bin/bash

# Screenshot Capture Script
# Uses ShakTech website tools to capture screenshots

SCREENSHOT_SCRIPT="/Users/shakeelbhamani/projects/personal/shaktech-website/scripts/capture-screenshot.js"
OUTPUT_DIR="/Users/shakeelbhamani/projects/personal/shaktech-website/public/portfolio-screenshots"

if [ ! -f "$SCREENSHOT_SCRIPT" ]; then
    echo "❌ Error: Screenshot script not found at $SCREENSHOT_SCRIPT"
    echo "Please ensure shaktech-website is installed"
    exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <url> <name>"
    echo "Example: $0 'https://example.com' 'example-site'"
    exit 1
fi

URL="$1"
NAME="$2"

echo "📸 Taking screenshot..."
echo "URL: $URL"
echo "Name: $NAME"

# Run the screenshot script
node "$SCREENSHOT_SCRIPT" "$URL" "$NAME"

if [ $? -eq 0 ]; then
    echo "✅ Screenshot saved successfully!"
    echo "📁 Output location: $OUTPUT_DIR/$NAME/"
    echo ""
    echo "Files created:"
    echo "  - ${NAME}-full.png (full page)"
    echo "  - ${NAME}-viewport.png (viewport)"
    echo "  - ${NAME}-mobile.png (mobile view)"
    echo "  - metadata.json (screenshot details)"
else
    echo "❌ Failed to capture screenshot"
    exit 1
fi