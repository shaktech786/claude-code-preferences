#!/bin/bash

# Email Sender Script Wrapper
# Uses the email-sender project to send emails from anywhere

EMAIL_SENDER_DIR="/Users/shakeelbhamani/projects/personal/email-sender"

if [ ! -d "$EMAIL_SENDER_DIR" ]; then
    echo "❌ Error: email-sender project not found at $EMAIL_SENDER_DIR"
    echo "Please ensure email-sender is installed"
    exit 1
fi

# Change to email-sender directory and run the email script
cd "$EMAIL_SENDER_DIR" || exit 1

# Check if required arguments are provided
if [ $# -lt 3 ]; then
    echo "Usage: $0 <to> <subject> <body> [attachments...]"
    echo "Example: $0 'user@example.com' 'Test Subject' 'Email body text' '/path/to/attachment.pdf'"
    exit 1
fi

TO="$1"
SUBJECT="$2"
BODY="$3"
shift 3
ATTACHMENTS="$@"

# Create temporary email config
TEMP_CONFIG=$(mktemp)
cat > "$TEMP_CONFIG" << EOF
{
    "to": "$TO",
    "subject": "$SUBJECT",
    "body": "$BODY",
    "attachments": [$ATTACHMENTS]
}
EOF

# Run the email sender (adjust command based on actual email-sender implementation)
echo "📧 Sending email..."
echo "To: $TO"
echo "Subject: $SUBJECT"

# Placeholder for actual email sending command
# This should be replaced with the actual command from email-sender project
# node send-email.js "$TEMP_CONFIG"

# Clean up
rm "$TEMP_CONFIG"

echo "✅ Email sent successfully!"