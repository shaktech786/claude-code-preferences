#!/usr/bin/env node

/**
 * Configuration Validator for Claude Code Preferences
 * Validates JSON files, checks paths, and ensures consistency
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function log(level, message) {
    const color = colors[level] || colors.reset;
    console.log(`${color}${message}${colors.reset}`);
}

function validateJSON(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        log('green', `✓ Valid JSON: ${filePath}`);
        return true;
    } catch (error) {
        log('red', `✗ Invalid JSON: ${filePath}`);
        log('red', `  Error: ${error.message}`);
        return false;
    }
}

function validatePaths(configFile) {
    try {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        let allValid = true;
        
        if (config.projectPaths) {
            log('blue', 'Validating project paths...');
            for (const [name, projectPath] of Object.entries(config.projectPaths)) {
                if (fs.existsSync(projectPath)) {
                    log('green', `✓ Path exists: ${name} -> ${projectPath}`);
                } else {
                    log('yellow', `⚠ Path missing: ${name} -> ${projectPath}`);
                }
            }
        }
        
        if (config.tools) {
            log('blue', 'Validating tool paths...');
            for (const [toolName, toolConfig] of Object.entries(config.tools)) {
                if (toolConfig.script && !fs.existsSync(toolConfig.script)) {
                    log('yellow', `⚠ Tool script missing: ${toolName} -> ${toolConfig.script}`);
                }
                if (toolConfig.projectDir && !fs.existsSync(toolConfig.projectDir)) {
                    log('yellow', `⚠ Tool directory missing: ${toolName} -> ${toolConfig.projectDir}`);
                }
            }
        }
        
        return allValid;
    } catch (error) {
        log('red', `✗ Error validating paths in ${configFile}: ${error.message}`);
        return false;
    }
}

function validatePermissions(permissionsFile) {
    try {
        const permissions = JSON.parse(fs.readFileSync(permissionsFile, 'utf8'));
        let issues = 0;
        
        log('blue', 'Validating tool permissions...');
        
        // Check for duplicates between allowed and requires approval
        const allowed = new Set(permissions.allowedWithoutApproval || []);
        const requiresApproval = new Set(permissions.requiresApproval || []);
        
        const duplicates = [...allowed].filter(cmd => requiresApproval.has(cmd));
        if (duplicates.length > 0) {
            log('red', `✗ Commands in both allowed and requires approval: ${duplicates.join(', ')}`);
            issues++;
        }
        
        // Check for common security risks in allowed commands
        const riskyPatterns = ['rm -rf', 'sudo', 'chmod 777', 'curl.*|.*sh'];
        const allowedCommands = permissions.allowedWithoutApproval || [];
        
        for (const cmd of allowedCommands) {
            for (const pattern of riskyPatterns) {
                if (cmd.includes('rm -rf') || cmd.includes('sudo') || cmd.includes('chmod 777')) {
                    log('yellow', `⚠ Potentially risky command in allowed list: ${cmd}`);
                }
            }
        }
        
        log('green', `✓ Permissions validation complete (${issues} issues found)`);
        return issues === 0;
    } catch (error) {
        log('red', `✗ Error validating permissions: ${error.message}`);
        return false;
    }
}

function validateScripts() {
    const scriptsDir = path.join(__dirname);
    let allValid = true;
    
    log('blue', 'Validating script permissions...');
    
    try {
        const files = fs.readdirSync(scriptsDir);
        const shellScripts = files.filter(file => file.endsWith('.sh'));
        
        for (const script of shellScripts) {
            const scriptPath = path.join(scriptsDir, script);
            const stats = fs.statSync(scriptPath);
            
            if (stats.mode & parseInt('0100', 8)) {
                log('green', `✓ Executable: ${script}`);
            } else {
                log('yellow', `⚠ Not executable: ${script}`);
                // Auto-fix: make executable
                fs.chmodSync(scriptPath, '755');
                log('green', `✓ Fixed permissions: ${script}`);
            }
        }
    } catch (error) {
        log('red', `✗ Error checking script permissions: ${error.message}`);
        allValid = false;
    }
    
    return allValid;
}

function validateCLAUDEmd() {
    const claudeFile = path.join(__dirname, '..', 'CLAUDE.md');
    
    if (!fs.existsSync(claudeFile)) {
        log('red', '✗ CLAUDE.md not found');
        return false;
    }
    
    const content = fs.readFileSync(claudeFile, 'utf8');
    const requiredSections = [
        '## 🧠 Response Style',
        '## 💻 Development Practices',
        '## 🛡️ AI TEAM MONITORING PROTOCOL',
        '## 📸 Web Screenshot & Scraping Tools',
        '## 📧 Email Tools',
        '## 🔧 Git Workflow',
        '## 📍 Project Paths & Locations',
        '## 🚀 Tool Usage Policy'
    ];
    
    let allFound = true;
    log('blue', 'Validating CLAUDE.md structure...');
    
    for (const section of requiredSections) {
        if (content.includes(section)) {
            log('green', `✓ Found: ${section}`);
        } else {
            log('red', `✗ Missing: ${section}`);
            allFound = false;
        }
    }
    
    return allFound;
}

function main() {
    console.log('🔍 Claude Code Preferences Configuration Validator');
    console.log('================================================');
    
    let overallValid = true;
    
    // Validate JSON files
    const configFiles = [
        path.join(__dirname, '..', 'configs', 'project-paths.json'),
        path.join(__dirname, '..', 'configs', 'tool-permissions.json'),
        path.join(__dirname, '..', 'configs', 'development-settings.json'),
        path.join(__dirname, '..', 'package.json')
    ];
    
    console.log('\n📄 Validating JSON files...');
    for (const file of configFiles) {
        if (fs.existsSync(file)) {
            if (!validateJSON(file)) {
                overallValid = false;
            }
        } else {
            log('yellow', `⚠ File not found: ${file}`);
        }
    }
    
    // Validate paths
    console.log('\n📁 Validating paths...');
    const pathsFile = path.join(__dirname, '..', 'configs', 'project-paths.json');
    if (fs.existsSync(pathsFile)) {
        validatePaths(pathsFile);
    }
    
    // Validate permissions
    console.log('\n🔒 Validating permissions...');
    const permissionsFile = path.join(__dirname, '..', 'configs', 'tool-permissions.json');
    if (fs.existsSync(permissionsFile)) {
        if (!validatePermissions(permissionsFile)) {
            overallValid = false;
        }
    }
    
    // Validate scripts
    console.log('\n📜 Validating scripts...');
    if (!validateScripts()) {
        overallValid = false;
    }
    
    // Validate CLAUDE.md
    console.log('\n📋 Validating CLAUDE.md...');
    if (!validateCLAUDEmd()) {
        overallValid = false;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (overallValid) {
        log('green', '✅ All validations passed!');
        process.exit(0);
    } else {
        log('red', '❌ Some validations failed. Please fix the issues above.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    validateJSON,
    validatePaths,
    validatePermissions,
    validateScripts,
    validateCLAUDEmd
};