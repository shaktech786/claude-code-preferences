#!/usr/bin/env node

/**
 * Enhanced MCP Monitoring Integration
 * Advanced monitoring capabilities with real-time tracking and intervention
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bright: '\x1b[1m'
};

function log(level, message) {
    const color = colors[level] || colors.reset;
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

function exec(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf8', ...options }).trim();
    } catch (error) {
        return null;
    }
}

async function runMCPMonitoring(mode = 'detailed') {
    log('blue', `🔍 Running MCP Monitoring (${mode} mode)...`);

    const mcpScript = '/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py';

    if (!fs.existsSync(mcpScript)) {
        log('red', '❌ MCP monitoring script not found');
        return { success: false, error: 'MCP script not found' };
    }

    try {
        const command = mode === 'quick' ?
            `python3 ${mcpScript} --quick` :
            `python3 ${mcpScript}`;

        const result = exec(command, { timeout: 30000 });

        if (result) {
            log('green', '✅ MCP monitoring completed');
            return { success: true, data: result };
        } else {
            log('yellow', '⚠️ MCP monitoring returned no data');
            return { success: false, error: 'No data returned' };
        }
    } catch (error) {
        log('red', `❌ MCP monitoring failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function checkGitProgress() {
    log('blue', '📊 Checking Git Progress Across Projects...');

    const projectPaths = require('../configs/project-paths.json').projectPaths;
    const progressData = {};

    for (const [name, projectPath] of Object.entries(projectPaths)) {
        if (fs.existsSync(projectPath)) {
            try {
                process.chdir(projectPath);

                // Get latest commit info
                const latestCommit = exec('git log -1 --format="%H|%an|%ar|%s"');
                const uncommittedChanges = exec('git status --porcelain');
                const branchInfo = exec('git branch --show-current');

                progressData[name] = {
                    path: projectPath,
                    latestCommit: latestCommit ? latestCommit.split('|') : null,
                    uncommittedChanges: uncommittedChanges ? uncommittedChanges.split('\n').length : 0,
                    currentBranch: branchInfo || 'unknown',
                    lastActivity: latestCommit ? latestCommit.split('|')[2] : 'unknown'
                };

                if (latestCommit) {
                    const [hash, author, time, message] = latestCommit.split('|');
                    log('green', `✓ ${name}: ${message.substring(0, 50)}... (${time})`);
                } else {
                    log('yellow', `⚠ ${name}: No git history`);
                }

            } catch (error) {
                log('red', `❌ ${name}: Error checking git status`);
                progressData[name] = { error: error.message };
            }
        } else {
            log('yellow', `⚠ ${name}: Project path not found`);
        }
    }

    return progressData;
}

async function detectStuckPrompts() {
    log('blue', '🚨 Detecting Stuck Prompts...');

    const stuckPatterns = [
        'Do you want to proceed?',
        'Press any key to continue',
        'Waiting for user input',
        'Type "y" to confirm',
        'Continue? (y/n)',
        'Approval required',
        'Enter to continue',
        'Would you like to',
        'Please confirm',
        'Proceed with'
    ];

    try {
        // Check tmux sessions for stuck patterns
        const tmuxSessions = exec('tmux list-sessions 2>/dev/null');

        if (tmuxSessions) {
            const sessions = tmuxSessions.split('\n');
            const stuckSessions = [];

            for (const session of sessions) {
                const sessionName = session.split(':')[0];

                try {
                    // Capture the current screen content
                    const screenContent = exec(`tmux capture-pane -t ${sessionName} -p`);

                    for (const pattern of stuckPatterns) {
                        if (screenContent && screenContent.includes(pattern)) {
                            stuckSessions.push({
                                session: sessionName,
                                pattern: pattern,
                                content: screenContent.split('\n').slice(-5).join('\n')
                            });
                            break;
                        }
                    }
                } catch (error) {
                    // Session might not exist or be accessible
                }
            }

            if (stuckSessions.length > 0) {
                log('red', `🚨 Found ${stuckSessions.length} potentially stuck sessions:`);
                for (const stuck of stuckSessions) {
                    log('yellow', `  Session: ${stuck.session}`);
                    log('yellow', `  Pattern: ${stuck.pattern}`);
                    log('cyan', `  Context: ${stuck.content.substring(0, 100)}...`);
                }
                return stuckSessions;
            } else {
                log('green', '✅ No stuck prompts detected');
                return [];
            }
        } else {
            log('yellow', '⚠️ No tmux sessions found');
            return [];
        }
    } catch (error) {
        log('red', `❌ Error detecting stuck prompts: ${error.message}`);
        return [];
    }
}

async function autoFixStuckPrompts(stuckSessions) {
    if (stuckSessions.length === 0) return;

    log('blue', '🔧 Attempting to auto-fix stuck prompts...');

    for (const stuck of stuckSessions) {
        try {
            log('yellow', `Attempting to fix session: ${stuck.session}`);

            // Try common fix responses
            const fixes = ['y', 'yes', '', 'q', 'exit'];

            for (const fix of fixes) {
                exec(`tmux send-keys -t ${stuck.session} "${fix}" Enter`);
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if still stuck
                const newContent = exec(`tmux capture-pane -t ${stuck.session} -p`);
                if (!newContent || !newContent.includes(stuck.pattern)) {
                    log('green', `✅ Fixed session ${stuck.session} with: "${fix}"`);
                    break;
                }
            }
        } catch (error) {
            log('red', `❌ Failed to fix session ${stuck.session}: ${error.message}`);
        }
    }
}

async function sendTokenWasteAlert(stuckSessions) {
    if (stuckSessions.length === 0) return;

    log('blue', '📧 Sending token waste alert...');

    const alertMessage = `
# 🚨 AI Team Token Waste Alert

**Detected ${stuckSessions.length} stuck AI session(s)**

## Stuck Sessions:
${stuckSessions.map(s => `- **${s.session}**: ${s.pattern}`).join('\n')}

## Actions Taken:
- Automatic fix attempts executed
- Sessions monitored for response
- Manual intervention may be required

## Next Steps:
1. Check tmux sessions manually if auto-fix failed
2. Review AI team prompts for approval requirements
3. Consider updating approval patterns

*Alert sent from Enhanced MCP Monitoring System*
`;

    try {
        const emailScript = path.join(__dirname, 'quick-email.js');
        if (fs.existsSync(emailScript)) {
            exec(`node "${emailScript}" "${alertMessage}"`);
            log('green', '✅ Token waste alert sent via email');
        } else {
            log('yellow', '⚠️ Email script not found, alert not sent');
        }
    } catch (error) {
        log('red', `❌ Failed to send alert: ${error.message}`);
    }
}

async function generateMonitoringReport() {
    log('bright', '📊 Generating Comprehensive Monitoring Report...');

    const startTime = Date.now();

    // Run all monitoring checks
    const mcpResult = await runMCPMonitoring('detailed');
    const gitProgress = await checkGitProgress();
    const stuckSessions = await detectStuckPrompts();

    // Auto-fix if needed
    if (stuckSessions.length > 0) {
        await autoFixStuckPrompts(stuckSessions);
        await sendTokenWasteAlert(stuckSessions);
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Generate report
    const report = {
        timestamp: new Date().toISOString(),
        duration: `${duration}s`,
        mcp: mcpResult,
        gitProgress: gitProgress,
        stuckSessions: stuckSessions,
        summary: {
            projectsChecked: Object.keys(gitProgress).length,
            stuckPrompts: stuckSessions.length,
            mcpStatus: mcpResult.success ? 'operational' : 'error',
            overallHealth: stuckSessions.length === 0 && mcpResult.success ? 'excellent' : 'needs-attention'
        }
    };

    // Save report
    const reportsDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportFile = path.join(reportsDir, `monitoring-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // Display summary
    console.log('\n' + '='.repeat(60));
    log('magenta', '🔍 ENHANCED MONITORING REPORT');
    console.log('='.repeat(60));

    log('blue', `📊 Summary:`);
    log('blue', `  Duration: ${duration}s`);
    log('blue', `  Projects checked: ${report.summary.projectsChecked}`);
    log('blue', `  MCP status: ${report.summary.mcpStatus}`);
    log('blue', `  Stuck prompts: ${report.summary.stuckPrompts}`);
    log('blue', `  Overall health: ${report.summary.overallHealth}`);

    const healthColor = report.summary.overallHealth === 'excellent' ? 'green' : 'yellow';
    log(healthColor, `\n🎯 Status: ${report.summary.overallHealth.toUpperCase()}`);

    log('blue', `\n💾 Report saved: ${reportFile}`);

    return report;
}

function main() {
    const args = process.argv.slice(2);
    const mode = args[0] || 'full';

    console.log('🔍 Enhanced MCP Monitoring System');
    console.log('Real-time AI team monitoring with intervention capabilities\n');

    switch (mode) {
        case 'quick':
            runMCPMonitoring('quick').then(result => {
                console.log(JSON.stringify(result, null, 2));
                process.exit(result.success ? 0 : 1);
            });
            break;

        case 'git':
            checkGitProgress().then(result => {
                console.log(JSON.stringify(result, null, 2));
                process.exit(0);
            });
            break;

        case 'stuck':
            detectStuckPrompts().then(stuckSessions => {
                if (stuckSessions.length > 0) {
                    autoFixStuckPrompts(stuckSessions);
                }
                process.exit(stuckSessions.length);
            });
            break;

        case 'full':
        default:
            generateMonitoringReport().then(report => {
                const exitCode = report.summary.overallHealth === 'excellent' ? 0 : 1;
                process.exit(exitCode);
            });
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    runMCPMonitoring,
    checkGitProgress,
    detectStuckPrompts,
    autoFixStuckPrompts,
    sendTokenWasteAlert,
    generateMonitoringReport
};