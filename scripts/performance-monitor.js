#!/usr/bin/env node

/**
 * Performance Monitor for Claude Code Preferences
 * Tracks usage patterns, performance metrics, and system analytics
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

class PerformanceMonitor {
    constructor() {
        this.prefsDir = path.resolve(__dirname, '..');
        this.metricsDir = path.join(process.env.HOME, '.claude', 'metrics');
        this.metricsFile = path.join(this.metricsDir, 'performance.json');
        this.usageFile = path.join(this.metricsDir, 'usage.json');
        
        this.ensureMetricsDir();
        this.loadMetrics();
    }
    
    ensureMetricsDir() {
        if (!fs.existsSync(this.metricsDir)) {
            fs.mkdirSync(this.metricsDir, { recursive: true });
        }
    }
    
    loadMetrics() {
        try {
            if (fs.existsSync(this.metricsFile)) {
                this.metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
            } else {
                this.metrics = this.createDefaultMetrics();
            }
            
            if (fs.existsSync(this.usageFile)) {
                this.usage = JSON.parse(fs.readFileSync(this.usageFile, 'utf8'));
            } else {
                this.usage = this.createDefaultUsage();
            }
        } catch (error) {
            log('yellow', `⚠ Could not load metrics: ${error.message}`);
            this.metrics = this.createDefaultMetrics();
            this.usage = this.createDefaultUsage();
        }
    }
    
    createDefaultMetrics() {
        return {
            version: '1.0.0',
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            performance: {
                scriptExecutionTimes: {},
                validationTimes: [],
                backupTimes: [],
                syncTimes: []
            },
            system: {
                nodeVersion: null,
                gitVersion: null,
                platform: process.platform,
                arch: process.arch
            }
        };
    }
    
    createDefaultUsage() {
        return {
            version: '1.0.0',
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            commands: {},
            scripts: {},
            features: {},
            sessions: []
        };
    }
    
    saveMetrics() {
        try {
            this.metrics.lastUpdated = new Date().toISOString();
            this.usage.lastUpdated = new Date().toISOString();
            
            fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2));
            fs.writeFileSync(this.usageFile, JSON.stringify(this.usage, null, 2));
        } catch (error) {
            log('red', `✗ Could not save metrics: ${error.message}`);
        }
    }
    
    recordScriptExecution(scriptName, duration) {
        if (!this.metrics.performance.scriptExecutionTimes[scriptName]) {
            this.metrics.performance.scriptExecutionTimes[scriptName] = [];
        }
        
        this.metrics.performance.scriptExecutionTimes[scriptName].push({
            duration,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 records per script
        if (this.metrics.performance.scriptExecutionTimes[scriptName].length > 100) {
            this.metrics.performance.scriptExecutionTimes[scriptName] = 
                this.metrics.performance.scriptExecutionTimes[scriptName].slice(-100);
        }
    }
    
    recordCommand(command) {
        if (!this.usage.commands[command]) {
            this.usage.commands[command] = {
                count: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: null
            };
        }
        
        this.usage.commands[command].count++;
        this.usage.commands[command].lastUsed = new Date().toISOString();
    }
    
    startSession() {
        const sessionId = Date.now().toString();
        const session = {
            id: sessionId,
            startTime: new Date().toISOString(),
            endTime: null,
            commands: [],
            errors: []
        };
        
        this.usage.sessions.push(session);
        
        // Keep only last 50 sessions
        if (this.usage.sessions.length > 50) {
            this.usage.sessions = this.usage.sessions.slice(-50);
        }
        
        return sessionId;
    }
    
    endSession(sessionId) {
        const session = this.usage.sessions.find(s => s.id === sessionId);
        if (session) {
            session.endTime = new Date().toISOString();
        }
    }
    
    collectSystemInfo() {
        try {
            this.metrics.system.nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        } catch (e) {
            this.metrics.system.nodeVersion = 'unknown';
        }
        
        try {
            this.metrics.system.gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
        } catch (e) {
            this.metrics.system.gitVersion = 'unknown';
        }
        
        // Collect repo stats
        try {
            const repoStats = {
                totalFiles: this.countFiles(),
                totalScripts: this.countScripts(),
                lastCommit: this.getLastCommit(),
                branch: this.getCurrentBranch()
            };
            this.metrics.repository = repoStats;
        } catch (e) {
            log('yellow', `⚠ Could not collect repo stats: ${e.message}`);
        }
    }
    
    countFiles() {
        const extensions = ['.js', '.sh', '.json', '.md', '.yml', '.yaml'];
        let count = 0;
        
        const countInDir = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                        countInDir(fullPath);
                    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                        count++;
                    }
                }
            } catch (e) {
                // Skip directories we can't read
            }
        };
        
        countInDir(this.prefsDir);
        return count;
    }
    
    countScripts() {
        const scriptsDir = path.join(this.prefsDir, 'scripts');
        try {
            return fs.readdirSync(scriptsDir).filter(f => f.endsWith('.sh') || f.endsWith('.js')).length;
        } catch (e) {
            return 0;
        }
    }
    
    getLastCommit() {
        try {
            return execSync('git log -1 --format="%h %s"', { 
                cwd: this.prefsDir, 
                encoding: 'utf8' 
            }).trim();
        } catch (e) {
            return 'unknown';
        }
    }
    
    getCurrentBranch() {
        try {
            return execSync('git branch --show-current', { 
                cwd: this.prefsDir, 
                encoding: 'utf8' 
            }).trim();
        } catch (e) {
            return 'unknown';
        }
    }
    
    benchmark(name, fn) {
        const start = process.hrtime.bigint();
        const result = fn();
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        
        this.recordScriptExecution(name, duration);
        return { result, duration };
    }
    
    generateReport() {
        console.log('📊 Claude Code Preferences Performance Report');
        console.log('============================================');
        console.log('');
        
        // System Info
        log('cyan', '🖥️  System Information:');
        console.log(`   Platform: ${this.metrics.system.platform} (${this.metrics.system.arch})`);
        console.log(`   Node.js: ${this.metrics.system.nodeVersion}`);
        console.log(`   Git: ${this.metrics.system.gitVersion}`);
        console.log('');
        
        // Repository Stats
        if (this.metrics.repository) {
            log('cyan', '📁 Repository Statistics:');
            console.log(`   Total files: ${this.metrics.repository.totalFiles}`);
            console.log(`   Scripts: ${this.metrics.repository.totalScripts}`);
            console.log(`   Current branch: ${this.metrics.repository.branch}`);
            console.log(`   Last commit: ${this.metrics.repository.lastCommit}`);
            console.log('');
        }
        
        // Performance Metrics
        log('cyan', '⚡ Performance Metrics:');
        const scriptTimes = this.metrics.performance.scriptExecutionTimes;
        
        if (Object.keys(scriptTimes).length > 0) {
            Object.entries(scriptTimes).forEach(([script, times]) => {
                if (times.length > 0) {
                    const avgTime = times.reduce((sum, t) => sum + t.duration, 0) / times.length;
                    const lastTime = times[times.length - 1];
                    console.log(`   ${script}: ${avgTime.toFixed(2)}ms avg (${times.length} runs)`);
                }
            });
        } else {
            console.log('   No performance data collected yet');
        }
        console.log('');
        
        // Usage Statistics
        log('cyan', '📈 Usage Statistics:');
        const commands = Object.entries(this.usage.commands)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10);
        
        if (commands.length > 0) {
            commands.forEach(([cmd, data]) => {
                console.log(`   ${cmd}: ${data.count} times`);
            });
        } else {
            console.log('   No usage data collected yet');
        }
        console.log('');
        
        // Sessions
        const recentSessions = this.usage.sessions.slice(-5);
        if (recentSessions.length > 0) {
            log('cyan', '🕒 Recent Sessions:');
            recentSessions.forEach(session => {
                const start = new Date(session.startTime);
                const duration = session.endTime ? 
                    (new Date(session.endTime) - start) / 1000 : 'ongoing';
                console.log(`   ${start.toLocaleString()} (${duration}s)`);
            });
        }
        console.log('');
        
        // Recommendations
        this.generateRecommendations();
    }
    
    generateRecommendations() {
        log('cyan', '💡 Performance Recommendations:');
        
        const recommendations = [];
        
        // Check for slow scripts
        const scriptTimes = this.metrics.performance.scriptExecutionTimes;
        Object.entries(scriptTimes).forEach(([script, times]) => {
            if (times.length > 0) {
                const avgTime = times.reduce((sum, t) => sum + t.duration, 0) / times.length;
                if (avgTime > 5000) { // More than 5 seconds
                    recommendations.push(`• ${script} is slow (${avgTime.toFixed(0)}ms avg) - consider optimization`);
                }
            }
        });
        
        // Check usage patterns
        const totalCommands = Object.values(this.usage.commands).reduce((sum, cmd) => sum + cmd.count, 0);
        if (totalCommands > 100) {
            recommendations.push('• High usage detected - consider setting up shell aliases for frequent commands');
        }
        
        // Check file count
        if (this.metrics.repository && this.metrics.repository.totalFiles > 50) {
            recommendations.push('• Large number of files - consider periodic cleanup of old backups');
        }
        
        if (recommendations.length > 0) {
            recommendations.forEach(rec => console.log(`   ${rec}`));
        } else {
            console.log('   ✓ Performance looks good! No recommendations at this time.');
        }
        console.log('');
    }
    
    exportMetrics(format = 'json') {
        const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        const filename = `claude-preferences-metrics-${timestamp}.${format}`;
        const filepath = path.join(process.cwd(), filename);
        
        const exportData = {
            exportedAt: new Date().toISOString(),
            version: this.metrics.version,
            metrics: this.metrics,
            usage: this.usage
        };
        
        if (format === 'json') {
            fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
        } else if (format === 'csv') {
            // Basic CSV export for usage data
            const csv = ['Command,Count,First Used,Last Used'];
            Object.entries(this.usage.commands).forEach(([cmd, data]) => {
                csv.push(`"${cmd}",${data.count},"${data.firstUsed}","${data.lastUsed}"`);
            });
            fs.writeFileSync(filepath, csv.join('\\n'));
        }
        
        log('green', `✓ Metrics exported to: ${filename}`);
        return filepath;
    }
    
    clearMetrics() {
        this.metrics = this.createDefaultMetrics();
        this.usage = this.createDefaultUsage();
        this.saveMetrics();
        log('green', '✓ Metrics cleared');
    }
}

// CLI Interface
function main() {
    const monitor = new PerformanceMonitor();
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'report':
        case 'show':
            monitor.collectSystemInfo();
            monitor.generateReport();
            break;
            
        case 'record':
            const scriptName = args[1];
            const duration = parseFloat(args[2]);
            if (scriptName && duration) {
                monitor.recordScriptExecution(scriptName, duration);
                monitor.saveMetrics();
                log('green', `✓ Recorded ${scriptName}: ${duration}ms`);
            } else {
                log('red', '✗ Usage: record <script_name> <duration_ms>');
            }
            break;
            
        case 'track':
            const cmdName = args[1];
            if (cmdName) {
                monitor.recordCommand(cmdName);
                monitor.saveMetrics();
                log('green', `✓ Tracked command: ${cmdName}`);
            } else {
                log('red', '✗ Usage: track <command_name>');
            }
            break;
            
        case 'export':
            const format = args[1] || 'json';
            monitor.exportMetrics(format);
            break;
            
        case 'clear':
            monitor.clearMetrics();
            break;
            
        case 'benchmark':
            const benchName = args[1] || 'test';
            const benchResult = monitor.benchmark(benchName, () => {
                // Simple benchmark test
                let sum = 0;
                for (let i = 0; i < 1000000; i++) {
                    sum += i;
                }
                return sum;
            });
            monitor.saveMetrics();
            log('green', `✓ Benchmark ${benchName}: ${benchResult.duration.toFixed(2)}ms`);
            break;
            
        default:
            console.log('📊 Claude Code Performance Monitor');
            console.log('Usage: node performance-monitor.js <command> [args]');
            console.log('');
            console.log('Commands:');
            console.log('  report                Show performance report');
            console.log('  record <script> <ms>  Record script execution time');
            console.log('  track <command>       Track command usage');
            console.log('  export [json|csv]     Export metrics data');
            console.log('  benchmark [name]      Run performance benchmark');
            console.log('  clear                 Clear all metrics');
            console.log('');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = PerformanceMonitor;