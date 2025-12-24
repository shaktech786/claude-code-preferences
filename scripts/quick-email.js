#!/usr/bin/env node

const nodemailer = require('nodemailer');
const path = require('path');
const { marked } = require('marked');
require('dotenv').config({ path: path.join(__dirname, '.env'), silent: true });

// Configure marked for better formatting
marked.setOptions({
  breaks: true,
  gfm: true
});

async function quickEmail(content) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Missing Gmail credentials. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
  }

  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'America/Los_Angeles',
    dateStyle: 'full',
    timeStyle: 'short'
  });
  
  const firstLine = content.split('\n')[0].slice(0, 50);
  const subject = `Claude Code: ${firstLine}${firstLine.length >= 50 ? '...' : ''}`;
  
  // Convert markdown to HTML
  const htmlContent = marked(content);
  
  // Professional HTML email template
  const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 2px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .content {
      background: white;
      border-radius: 10px;
      padding: 30px;
    }
    .header {
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .header h2 {
      margin: 0;
      color: #667eea;
      font-size: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header .badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
    .message-content {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .message-content h1 { color: #2c3e50; font-size: 22px; margin-top: 0; }
    .message-content h2 { color: #34495e; font-size: 20px; margin-top: 20px; }
    .message-content h3 { color: #34495e; font-size: 18px; margin-top: 15px; }
    .message-content h4 { color: #34495e; font-size: 16px; margin-top: 15px; }
    .message-content p { margin: 10px 0; }
    .message-content code {
      background: #e8e8e8;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }
    .message-content pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.4;
    }
    .message-content pre code {
      background: transparent;
      padding: 0;
      color: #f8f8f2;
    }
    .message-content ul, .message-content ol {
      margin: 10px 0;
      padding-left: 25px;
    }
    .message-content li {
      margin: 5px 0;
    }
    .message-content blockquote {
      border-left: 4px solid #ddd;
      margin: 15px 0;
      padding-left: 15px;
      color: #666;
      font-style: italic;
    }
    .message-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 15px 0;
    }
    .message-content th, .message-content td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .message-content th {
      background: #f0f0f0;
      font-weight: 600;
    }
    .message-content a {
      color: #667eea;
      text-decoration: none;
    }
    .message-content a:hover {
      text-decoration: underline;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .footer .timestamp {
      color: #999;
      margin-top: 10px;
    }
    .emoji {
      font-size: 20px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="header">
        <h2>
          <span class="emoji">🤖</span>
          Claude Code Message
        </h2>
        <span class="badge">Automated Update</span>
      </div>
      
      <div class="message-content">
        ${htmlContent}
      </div>
      
      <div class="footer">
        <strong>Sent from Claude Code Email Tool</strong>
        <div class="timestamp">${timestamp}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  
  // Plain text fallback
  const plainText = `Message from Claude Code
========================

${content}

------------------------
Sent: ${timestamp}
From: Claude Code Email Tool`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const mailOptions = {
    from: `Claude Code <${process.env.GMAIL_USER}>`,
    to: 'shakeel.bhamani@gmail.com',
    subject: subject,
    text: plainText,
    html: htmlEmail
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to shakeel.bhamani@gmail.com`);
    console.log(`Subject: ${subject}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: emailme "Your message content"');
    console.log('\nSupports Markdown formatting:');
    console.log('  # Headers');
    console.log('  **bold** and *italic*');
    console.log('  - Lists');
    console.log('  `code` and ```code blocks```');
    console.log('  [links](http://example.com)');
    console.log('\nExamples:');
    console.log('  emailme "Task completed"');
    console.log('  emailme "# Build Status\\n\\n**Success!** All tests passing."');
    process.exit(1);
  }

  const content = args.join(' ');
  quickEmail(content)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { quickEmail };