#!/usr/bin/env node

/**
 * Claude Code Preferences Doctor
 * Comprehensive health check for the preferences system
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
    magenta: '\x1b[35m'
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

function checkSystemDependencies() {
    log('blue', '\n🔧 Checking System Dependencies...');
    
    const dependencies = [
        { name: 'Node.js', cmd: 'node --version', required: true },
        { name: 'npm', cmd: 'npm --version', required: true },
        { name: 'Git', cmd: 'git --version', required: true },
        { name: 'Python3', cmd: 'python3 --version', required: false },
        { name: 'Shell Check', cmd: 'shellcheck --version', required: false },
        { name: 'tmux', cmd: 'tmux -V', required: false }
    ];
    
    let allRequired = true;
    
    for (const dep of dependencies) {
        const version = exec(dep.cmd);
        if (version) {
            log('green', `✓ ${dep.name}: ${version.split('\\n')[0]}`);
        } else {
            if (dep.required) {
                log('red', `✗ ${dep.name}: Not found (REQUIRED)`);
                allRequired = false;
            } else {
                log('yellow', `⚠ ${dep.name}: Not found (optional)`);
            }
        }
    }
    
    return allRequired;
}

function checkCLAUDEmdSymlink() {
    log('blue', '\n🔗 Checking CLAUDE.md Symlink...');
    
    const symlinkPath = path.join(process.env.HOME, '.claude', 'CLAUDE.md');
    const sourcePath = path.join(__dirname, '..', 'CLAUDE.md');
    
    if (fs.existsSync(symlinkPath)) {
        try {
            const realPath = fs.realpathSync(symlinkPath);
            if (realPath === fs.realpathSync(sourcePath)) {
                log('green', '✓ CLAUDE.md symlink is correct');
                return true;
            } else {
                log('red', `✗ CLAUDE.md symlink points to wrong location: ${realPath}`);
                log('yellow', `  Expected: ${sourcePath}`);
                return false;
            }
        } catch (error) {
            log('red', `✗ Error checking symlink: ${error.message}`);
            return false;
        }
    } else {
        log('red', '✗ CLAUDE.md symlink not found');
        log('yellow', '  Run: ./install.sh to create the symlink');
        return false;
    }
}

function checkProjectPaths() {
    log('blue', '\n📁 Checking Project Paths...');
    
    const configPath = path.join(__dirname, '..', 'configs', 'project-paths.json');
    
    if (!fs.existsSync(configPath)) {
        log('red', '✗ project-paths.json not found');
        return false;
    }
    
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let allExist = true;
        let totalPaths = 0;
        let existingPaths = 0;
        
        if (config.projectPaths) {
            for (const [name, projectPath] of Object.entries(config.projectPaths)) {
                totalPaths++;
                if (fs.existsSync(projectPath)) {
                    log('green', `✓ ${name}`);
                    existingPaths++;
                } else {
                    log('yellow', `⚠ ${name}: ${projectPath} (not found)`);
                    allExist = false;
                }
            }
        }
        
        log('blue', `  Summary: ${existingPaths}/${totalPaths} project paths exist`);
        return allExist;
    } catch (error) {
        log('red', `✗ Error reading project paths: ${error.message}`);
        return false;
    }
}

function checkToolIntegrations() {
    log('blue', '\n🛠️ Checking Tool Integrations...');
    
    const tools = [
        {
            name: 'Tmux Orchestrator',
            path: '/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator',
            critical: ['claude-monitoring-mcp-client.py', 'send-claude-message.sh']
        },
        {
            name: 'ShakTech Website',
            path: '/Users/shakeelbhamani/projects/personal/shaktech-website',
            critical: ['scripts/capture-screenshot.js']
        },
        {
            name: 'Email Sender',
            path: '/Users/shakeelbhamani/projects/personal/email-sender',
            critical: []
        }
    ];
    
    let allWorking = true;
    
    for (const tool of tools) {
        if (fs.existsSync(tool.path)) {
            log('green', `✓ ${tool.name}: Found`);
            
            for (const criticalFile of tool.critical) {
                const filePath = path.join(tool.path, criticalFile);
                if (fs.existsSync(filePath)) {
                    log('green', `  ✓ ${criticalFile}`);
                } else {
                    log('red', `  ✗ ${criticalFile} (missing)`);
                    allWorking = false;
                }
            }
        } else {
            log('red', `✗ ${tool.name}: Not found at ${tool.path}`);
            allWorking = false;
        }
    }
    
    return allWorking;
}

function checkGitRepository() {
    log('blue', '\n📦 Checking Git Repository...');
    
    const gitDir = path.join(__dirname, '..', '.git');
    if (!fs.existsSync(gitDir)) {
        log('red', '✗ Not a git repository');
        return false;
    }
    
    // Check remote
    const remote = exec('git remote get-url origin');
    if (remote) {
        log('green', `✓ Git remote: ${remote}`);
    } else {
        log('yellow', '⚠ No git remote configured');
    }
    
    // Check status
    const status = exec('git status --porcelain');
    if (status) {
        const lines = status.split('\\n').length;
        log('yellow', `⚠ ${lines} uncommitted changes`);
    } else {
        log('green', '✓ Working directory clean');
    }
    
    // Check if up to date
    const behind = exec('git rev-list --count HEAD..origin/master 2>/dev/null');
    if (behind && parseInt(behind) > 0) {
        log('yellow', `⚠ ${behind} commits behind origin/master`);
    } else if (behind !== null) {
        log('green', '✓ Up to date with remote');
    }
    
    return true;
}

function checkScriptPermissions() {
    log('blue', '\n🔐 Checking Script Permissions...');
    
    const scriptsDir = path.join(__dirname);
    const hooksDir = path.join(__dirname, '..', 'hooks');
    
    let allExecutable = true;
    
    // Check scripts
    try {
        const files = fs.readdirSync(scriptsDir);
        const shellScripts = files.filter(file => file.endsWith('.sh'));
        
        for (const script of shellScripts) {
            const scriptPath = path.join(scriptsDir, script);
            const stats = fs.statSync(scriptPath);
            
            if (stats.mode & parseInt('0100', 8)) {
                log('green', `✓ scripts/${script}`);
            } else {
                log('red', `✗ scripts/${script} (not executable)`);
                allExecutable = false;
            }
        }
    } catch (error) {
        log('red', `✗ Error checking scripts: ${error.message}`);
        allExecutable = false;
    }
    
    // Check hooks
    try {
        const files = fs.readdirSync(hooksDir);
        for (const hook of files) {
            const hookPath = path.join(hooksDir, hook);
            const stats = fs.statSync(hookPath);
            
            if (stats.mode & parseInt('0100', 8)) {
                log('green', `✓ hooks/${hook}`);
            } else {
                log('red', `✗ hooks/${hook} (not executable)`);
                allExecutable = false;
            }
        }
    } catch (error) {
        log('red', `✗ Error checking hooks: ${error.message}`);
        allExecutable = false;
    }
    
    return allExecutable;
}

function generateReport() {
    log('blue', '\n📊 Generating Health Report...');
    
    const checks = [
        { name: 'System Dependencies', fn: checkSystemDependencies },
        { name: 'CLAUDE.md Symlink', fn: checkCLAUDEmdSymlink },
        { name: 'Project Paths', fn: checkProjectPaths },
        { name: 'Tool Integrations', fn: checkToolIntegrations },
        { name: 'Git Repository', fn: checkGitRepository },
        { name: 'Script Permissions', fn: checkScriptPermissions }
    ];
    
    const results = {};
    let overallScore = 0;
    
    for (const check of checks) {
        results[check.name] = check.fn();
        if (results[check.name]) overallScore++;
    }
    
    const percentage = Math.round((overallScore / checks.length) * 100);
    
    console.log('\n' + '='.repeat(60));
    log('magenta', '🩺 CLAUDE CODE PREFERENCES HEALTH REPORT');
    console.log('='.repeat(60));
    
    for (const [name, passed] of Object.entries(results)) {
        const icon = passed ? '✅' : '❌';
        log(passed ? 'green' : 'red', `${icon} ${name}`);
    }
    
    console.log('\\n' + '-'.repeat(60));
    
    if (percentage === 100) {
        log('green', `🎉 Overall Health: ${percentage}% (EXCELLENT)`);
        log('green', '   Everything is working perfectly!');
    } else if (percentage >= 80) {
        log('green', `✅ Overall Health: ${percentage}% (GOOD)`);
        log('yellow', '   Minor issues detected, but system is functional');
    } else if (percentage >= 60) {
        log('yellow', `⚠️  Overall Health: ${percentage}% (FAIR)`);
        log('yellow', '   Several issues need attention');
    } else {
        log('red', `❌ Overall Health: ${percentage}% (POOR)`);
        log('red', '   System needs significant repairs');
    }
    
    console.log('\\n' + '='.repeat(60));
    
    // Recommendations
    log('blue', '📋 Recommendations:');
    if (!results['CLAUDE.md Symlink']) {
        log('yellow', '• Run ./install.sh to set up symlinks');
    }
    if (!results['Script Permissions']) {
        log('yellow', '• Run npm run setup-hooks to fix permissions');
    }
    if (!results['System Dependencies']) {
        log('yellow', '• Install missing system dependencies');
    }
    
    log('blue', '\\n🔧 Quick fixes:');
    log('blue', '• npm run setup-hooks    # Fix git hooks');
    log('blue', '• npm run validate       # Validate configurations');
    log('blue', '• ./install.sh           # Reinstall/repair setup');
    
    return percentage;
}

function main() {
    console.log('🩺 Claude Code Preferences Doctor');
    console.log('Comprehensive health check for your preferences system');
    
    const health = generateReport();
    
    process.exit(health === 100 ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = {
    checkSystemDependencies,
    checkCLAUDEmdSymlink,
    checkProjectPaths,
    checkToolIntegrations,
    checkGitRepository,
    checkScriptPermissions,
    generateReport
};