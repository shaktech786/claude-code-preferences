#!/usr/bin/env node

/**
 * Sub-Agents Validation Script
 * Validates sub-agent configurations, paths, and capabilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(level, message) {
    const color = colors[level] || colors.reset;
    console.log(`${color}${message}${colors.reset}`);
}

function exec(command, options = {}) {
    try {
        return execSync(command, { encoding: 'utf8', ...options }).trim();
    } catch (error) {
        return null;
    }
}

function validateSubAgentsConfig() {
    log('blue', '\n🤖 Validating Sub-Agents Configuration...');

    const configPath = path.join(__dirname, '..', 'configs', 'sub-agents.json');

    if (!fs.existsSync(configPath)) {
        log('red', '✗ sub-agents.json not found');
        return false;
    }

    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let allValid = true;
        let totalAgents = 0;
        let activeAgents = 0;

        if (config.subAgents) {
            for (const [name, agent] of Object.entries(config.subAgents)) {
                totalAgents++;
                log('cyan', `\n🔍 Validating ${name}:`);

                // Check if agent is active
                if (agent.active) {
                    activeAgents++;
                    log('green', '  ✓ Status: Active');
                } else {
                    log('yellow', '  ⚠ Status: Inactive');
                }

                // Validate project path if specified
                if (agent.projectPath) {
                    if (fs.existsSync(agent.projectPath)) {
                        log('green', `  ✓ Project path: ${agent.projectPath}`);

                        // Check for package.json
                        const packagePath = path.join(agent.projectPath, 'package.json');
                        if (fs.existsSync(packagePath)) {
                            log('green', '  ✓ Package.json found');
                        } else {
                            log('yellow', '  ⚠ Package.json not found (non-Node.js project)');
                        }
                    } else {
                        log('red', `  ✗ Project path not found: ${agent.projectPath}`);
                        allValid = false;
                    }
                }

                // Validate commands
                if (agent.commands) {
                    let commandsValid = true;
                    for (const [cmdName, cmdValue] of Object.entries(agent.commands)) {
                        // Check if command script exists (for file-based commands)
                        if (cmdValue.includes('/')) {
                            const scriptPath = cmdValue.split(' ')[1] || cmdValue.split(' ')[0];
                            if (scriptPath.startsWith('/') && !fs.existsSync(scriptPath)) {
                                log('red', `  ✗ Command script not found: ${scriptPath}`);
                                commandsValid = false;
                                allValid = false;
                            } else {
                                log('green', `  ✓ Command '${cmdName}': ${cmdValue}`);
                            }
                        } else {
                            log('green', `  ✓ Command '${cmdName}': ${cmdValue}`);
                        }
                    }
                } else {
                    log('yellow', '  ⚠ No commands defined');
                }

                // Validate capabilities
                if (agent.capabilities && Array.isArray(agent.capabilities)) {
                    log('green', `  ✓ Capabilities: ${agent.capabilities.length} defined`);
                } else {
                    log('yellow', '  ⚠ No capabilities defined');
                }

                // Check priority
                if (agent.priority) {
                    const priorityColor = agent.priority === 'critical' ? 'red' :
                                        agent.priority === 'high' ? 'yellow' : 'green';
                    log(priorityColor, `  ✓ Priority: ${agent.priority}`);
                } else {
                    log('yellow', '  ⚠ No priority set');
                }
            }
        }

        // Summary
        log('blue', `\n📊 Summary:`);
        log('blue', `  Total agents: ${totalAgents}`);
        log('blue', `  Active agents: ${activeAgents}`);
        log('blue', `  Inactive agents: ${totalAgents - activeAgents}`);

        // Validate integration config
        if (config.integrationConfig) {
            log('green', '  ✓ Integration config found');
            if (config.integrationConfig.communicationProtocols) {
                log('green', `  ✓ Communication protocols: ${config.integrationConfig.communicationProtocols.join(', ')}`);
            }
        } else {
            log('yellow', '  ⚠ No integration config found');
        }

        // Validate workflows
        if (config.workflows) {
            log('green', `  ✓ Workflows defined: ${Object.keys(config.workflows).length}`);
        } else {
            log('yellow', '  ⚠ No workflows defined');
        }

        return allValid;
    } catch (error) {
        log('red', `✗ Error reading sub-agents config: ${error.message}`);
        return false;
    }
}

function validateGlobalCommands() {
    log('blue', '\n🌍 Validating Global Command System...');

    const commandsDir = '/Users/shakeelbhamani/.claude/commands';

    if (!fs.existsSync(commandsDir)) {
        log('red', '✗ Global commands directory not found');
        return false;
    }

    const requiredFiles = ['learn.js', 'improve.js'];
    let allFound = true;

    for (const file of requiredFiles) {
        const filePath = path.join(commandsDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.mode & parseInt('0100', 8)) {
                log('green', `✓ ${file} (executable)`);
            } else {
                log('yellow', `⚠ ${file} (not executable)`);
            }
        } else {
            log('red', `✗ ${file} not found`);
            allFound = false;
        }
    }

    return allFound;
}

function testSubAgentConnectivity() {
    log('blue', '\n🔗 Testing Sub-Agent Connectivity...');

    const tests = [
        {
            name: 'Email Sender',
            test: () => {
                const projectPath = '/Users/shakeelbhamani/projects/personal/email-sender';
                return fs.existsSync(projectPath) && fs.existsSync(path.join(projectPath, 'package.json'));
            }
        },
        {
            name: 'AI Team Monitor (MCP)',
            test: () => {
                const scriptPath = '/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator/claude-monitoring-mcp-client.py';
                return fs.existsSync(scriptPath);
            }
        },
        {
            name: 'Screenshot/Scraper Tool',
            test: () => {
                const scriptPath = '/Users/shakeelbhamani/projects/personal/shaktech-website/scripts/capture-screenshot.js';
                return fs.existsSync(scriptPath);
            }
        },
        {
            name: 'Global Learn Command',
            test: () => {
                const scriptPath = '/Users/shakeelbhamani/.claude/commands/learn.js';
                return fs.existsSync(scriptPath);
            }
        },
        {
            name: 'Global Improve Command',
            test: () => {
                const scriptPath = '/Users/shakeelbhamani/.claude/commands/improve.js';
                return fs.existsSync(scriptPath);
            }
        }
    ];

    let allConnected = true;

    for (const test of tests) {
        if (test.test()) {
            log('green', `✓ ${test.name}: Connected`);
        } else {
            log('red', `✗ ${test.name}: Not available`);
            allConnected = false;
        }
    }

    return allConnected;
}

function generateSubAgentReport() {
    log('blue', '\n📋 Generating Sub-Agent Report...');

    const checks = [
        { name: 'Sub-Agents Config', fn: validateSubAgentsConfig },
        { name: 'Global Commands', fn: validateGlobalCommands },
        { name: 'Connectivity Tests', fn: testSubAgentConnectivity }
    ];

    const results = {};
    let overallScore = 0;

    for (const check of checks) {
        results[check.name] = check.fn();
        if (results[check.name]) overallScore++;
    }

    const percentage = Math.round((overallScore / checks.length) * 100);

    console.log('\n' + '='.repeat(60));
    log('magenta', '🤖 SUB-AGENTS VALIDATION REPORT');
    console.log('='.repeat(60));

    for (const [name, passed] of Object.entries(results)) {
        const icon = passed ? '✅' : '❌';
        log(passed ? 'green' : 'red', `${icon} ${name}`);
    }

    console.log('\n' + '-'.repeat(60));

    if (percentage === 100) {
        log('green', `🎉 Sub-Agent Health: ${percentage}% (EXCELLENT)`);
        log('green', '   All sub-agents are properly configured and accessible!');
    } else if (percentage >= 80) {
        log('green', `✅ Sub-Agent Health: ${percentage}% (GOOD)`);
        log('yellow', '   Minor issues detected, but sub-agents are functional');
    } else if (percentage >= 60) {
        log('yellow', `⚠️  Sub-Agent Health: ${percentage}% (FAIR)`);
        log('yellow', '   Several sub-agents need attention');
    } else {
        log('red', `❌ Sub-Agent Health: ${percentage}% (POOR)`);
        log('red', '   Sub-agent system needs significant repairs');
    }

    console.log('\n' + '='.repeat(60));

    // Quick reference
    log('blue', '📖 Quick Reference:');
    log('blue', '• npm run learn          # Run 1 learning cycle');
    log('blue', '• npm run learn:cycles 5 # Run 5 learning cycles');
    log('blue', '• npm run improve        # Run 1 improvement cycle');
    log('blue', '• npm run improve:cycles 3 # Run 3 improvement cycles');
    log('blue', '• npm run screenshot     # Take website screenshots');
    log('blue', '• npm run emailme        # Send formatted email');
    log('blue', '• npm run check-teams    # Monitor AI teams');

    return percentage;
}

function main() {
    console.log('🤖 Claude Code Sub-Agents Validator');
    console.log('Comprehensive validation for all sub-agent systems');

    const health = generateSubAgentReport();

    process.exit(health >= 80 ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = {
    validateSubAgentsConfig,
    validateGlobalCommands,
    testSubAgentConnectivity,
    generateSubAgentReport
};