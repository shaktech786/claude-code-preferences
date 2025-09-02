#!/bin/bash

# Optimization Engine for Claude Code Preferences
# Automatically optimizes performance based on usage patterns and system analysis

set -e

echo "🚀 Claude Code Optimization Engine"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_header() { echo -e "${MAGENTA}━━━ $1 ━━━${NC}"; }
print_optimize() { echo -e "${CYAN}🔧${NC} $1"; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFS_DIR="$( dirname "$SCRIPT_DIR" )"
ANALYTICS_DIR="$HOME/.claude/analytics"
OPTIMIZATION_LOG="$HOME/.claude/optimizations.log"

COMMAND="${1:-analyze}"

log_optimization() {
    local optimization="$1"
    local impact="$2"
    echo "$(date -Iseconds)|$optimization|$impact" >> "$OPTIMIZATION_LOG"
}

analyze_system() {
    print_header "System Analysis"
    echo ""
    
    local issues_found=0
    local optimizations_available=0
    
    # Check disk usage
    print_info "🗄️  Storage Analysis:"
    local backup_size=$(du -sh "$HOME/.claude/backups" 2>/dev/null | cut -f1 || echo "0B")
    local metrics_size=$(du -sh "$HOME/.claude/metrics" 2>/dev/null | cut -f1 || echo "0B")
    local analytics_size=$(du -sh "$ANALYTICS_DIR" 2>/dev/null | cut -f1 || echo "0B")
    
    echo "  Backups: $backup_size"
    echo "  Metrics: $metrics_size"
    echo "  Analytics: $analytics_size"
    
    # Check for old backups
    local backup_count=$(find "$HOME/.claude/backups" -name "claude-preferences-*" 2>/dev/null | wc -l || echo "0")
    if [ "$backup_count" -gt 20 ]; then
        print_warning "  ⚠ $backup_count backups found (consider cleanup)"
        ((optimizations_available++))
    fi
    
    echo ""
    
    # Performance analysis
    print_info "⚡ Performance Analysis:"
    
    if [ -f "$HOME/.claude/metrics/performance.json" ]; then
        local slow_scripts=$(node -e "
            try {
                const metrics = JSON.parse(require('fs').readFileSync('$HOME/.claude/metrics/performance.json', 'utf8'));
                const scriptTimes = metrics.performance.scriptExecutionTimes;
                let slowCount = 0;
                Object.entries(scriptTimes).forEach(([script, times]) => {
                    if (times.length > 0) {
                        const avgTime = times.reduce((sum, t) => sum + t.duration, 0) / times.length;
                        if (avgTime > 3000) slowCount++;
                    }
                });
                console.log(slowCount);
            } catch(e) {
                console.log('0');
            }
        " 2>/dev/null || echo "0")
        
        if [ "$slow_scripts" -gt 0 ]; then
            print_warning "  ⚠ $slow_scripts scripts are running slowly"
            ((optimizations_available++))
        else
            print_status "  Scripts are performing well"
        fi
    else
        print_info "  Performance monitoring not initialized"
    fi
    
    # Git repository health
    echo ""
    print_info "📦 Repository Health:"
    
    cd "$PREFS_DIR"
    local unstaged_files=$(git diff --name-only | wc -l || echo "0")
    local untracked_files=$(git ls-files --others --exclude-standard | wc -l || echo "0")
    local ahead_commits=$(git rev-list --count HEAD..origin/$(git branch --show-current) 2>/dev/null || echo "0")
    
    if [ "$unstaged_files" -gt 0 ]; then
        print_warning "  ⚠ $unstaged_files unstaged files"
        ((issues_found++))
    fi
    
    if [ "$untracked_files" -gt 0 ]; then
        print_info "  ℹ $untracked_files untracked files"
    fi
    
    if [ "$ahead_commits" -gt 0 ]; then
        print_info "  ℹ $ahead_commits commits available upstream"
    fi
    
    # Usage pattern analysis
    echo ""
    print_info "📊 Usage Pattern Analysis:"
    
    if [ -f "$ANALYTICS_DIR/usage.log" ]; then
        local most_used=$(tail -100 "$ANALYTICS_DIR/usage.log" 2>/dev/null | cut -d'|' -f2 | sort | uniq -c | sort -nr | head -1 | awk '{print $2}' || echo "unknown")
        local usage_frequency=$(tail -100 "$ANALYTICS_DIR/usage.log" 2>/dev/null | wc -l || echo "0")
        
        print_status "  Most used command: $most_used"
        print_status "  Recent activity level: $usage_frequency events"
        
        # Check for optimization opportunities
        if echo "$most_used" | grep -q "backup\|restore"; then
            print_optimize "  Optimization available: Frequent backup usage detected"
            ((optimizations_available++))
        fi
        
        if [ "$usage_frequency" -gt 50 ]; then
            print_optimize "  Optimization available: High usage - consider shell aliases"
            ((optimizations_available++))
        fi
    else
        print_info "  No usage analytics available yet"
    fi
    
    echo ""
    print_header "Analysis Summary"
    echo "  Issues found: $issues_found"
    echo "  Optimizations available: $optimizations_available"
    
    return $optimizations_available
}

apply_optimizations() {
    print_header "Applying Optimizations"
    echo ""
    
    local applied=0
    
    # Cleanup old backups
    print_info "🧹 Backup Cleanup:"
    local backup_count=$(find "$HOME/.claude/backups" -name "claude-preferences-*" 2>/dev/null | wc -l || echo "0")
    
    if [ "$backup_count" -gt 15 ]; then
        print_optimize "Cleaning old backups (keeping latest 15)..."
        cd "$HOME/.claude/backups" 2>/dev/null && {
            ls -t claude-preferences-* 2>/dev/null | tail -n +16 | xargs rm -rf 2>/dev/null
            print_status "Old backups cleaned"
            log_optimization "backup_cleanup" "removed $(( backup_count - 15 )) old backups"
            ((applied++))
        } || print_warning "Could not clean backups"
    else
        print_status "Backup count is optimal"
    fi
    
    # Optimize git repository
    echo ""
    print_info "📦 Git Optimization:"
    cd "$PREFS_DIR"
    
    # Check if git gc would help
    local objects_count=$(find .git/objects -type f | wc -l 2>/dev/null || echo "0")
    if [ "$objects_count" -gt 100 ]; then
        print_optimize "Running git garbage collection..."
        if git gc --prune=now 2>/dev/null; then
            print_status "Git repository optimized"
            log_optimization "git_gc" "cleaned up git objects"
            ((applied++))
        fi
    else
        print_status "Git repository is already optimized"
    fi
    
    # Performance optimizations
    echo ""
    print_info "⚡ Performance Optimizations:"
    
    # Check for shell aliases
    local shell_rc=""
    if [ -n "$ZSH_VERSION" ]; then
        shell_rc="$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        shell_rc="$HOME/.bashrc"
    else
        shell_rc="$HOME/.profile"
    fi
    
    if [ -f "$shell_rc" ] && ! grep -q "CLAUDE_PREFS" "$shell_rc" 2>/dev/null; then
        print_optimize "Shell aliases not detected - consider running quick-setup"
        print_info "  Run: npm run quick-setup for shell integration"
    else
        print_status "Shell integration detected"
    fi
    
    # Check for npm cache optimization
    if command -v npm >/dev/null 2>&1; then
        local cache_size=$(npm cache verify 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "0")
        if [ "$cache_size" -gt 1000 ]; then
            print_optimize "Large npm cache detected, considering cleanup..."
            # Don't auto-clean npm cache as it might be needed
            print_info "  Run 'npm cache clean --force' if needed"
        fi
    fi
    
    # Configuration optimizations
    echo ""
    print_info "⚙️  Configuration Optimizations:"
    
    # Check if all tools are properly configured
    local missing_integrations=0
    
    # Check key integrations
    if [ ! -d "/Users/shakeelbhamani/projects/personal/Tmux-Orchestrator" ]; then
        ((missing_integrations++))
    fi
    if [ ! -d "/Users/shakeelbhamani/projects/personal/shaktech-website" ]; then
        ((missing_integrations++))
    fi
    
    if [ "$missing_integrations" -gt 0 ]; then
        print_optimize "$missing_integrations key integrations not found"
        print_info "  Run: npm run integrations check"
    else
        print_status "All key integrations are available"
    fi
    
    # Check for environment-specific optimizations
    echo ""
    print_info "🌍 Environment Optimizations:"
    
    local env_count=$(find "$HOME/.claude/environments" -maxdepth 1 -type d 2>/dev/null | wc -l || echo "1")
    if [ "$env_count" -eq 1 ]; then  # Only the parent directory
        print_optimize "No custom environments detected"
        print_info "  Consider creating environments for different use cases"
        print_info "  Run: npm run env-create development"
    else
        print_status "Custom environments configured: $((env_count - 1))"
    fi
    
    echo ""
    print_header "Optimization Summary"
    echo "  Optimizations applied: $applied"
    
    if [ "$applied" -gt 0 ]; then
        print_status "System optimized! Run 'npm run doctor' to verify improvements."
        log_optimization "optimization_complete" "applied $applied optimizations"
    else
        print_status "System is already well optimized!"
    fi
}

benchmark_performance() {
    print_header "Performance Benchmark"
    echo ""
    
    print_info "Running benchmark suite..."
    
    # Benchmark validation
    print_info "📊 Validation Performance:"
    local start_time=$(date +%s%3N)
    npm run validate >/dev/null 2>&1
    local end_time=$(date +%s%3N)
    local validation_time=$((end_time - start_time))
    
    echo "  Validation: ${validation_time}ms"
    
    # Benchmark doctor
    print_info "🏥 Health Check Performance:"
    start_time=$(date +%s%3N)
    node "$SCRIPT_DIR/doctor.js" >/dev/null 2>&1 || true
    end_time=$(date +%s%3N)
    local doctor_time=$((end_time - start_time))
    
    echo "  Health check: ${doctor_time}ms"
    
    # Benchmark git operations
    print_info "📦 Git Performance:"
    cd "$PREFS_DIR"
    start_time=$(date +%s%3N)
    git status >/dev/null 2>&1
    end_time=$(date +%s%3N)
    local git_time=$((end_time - start_time))
    
    echo "  Git status: ${git_time}ms"
    
    # Record benchmarks
    if command -v node >/dev/null 2>&1; then
        node "$SCRIPT_DIR/performance-monitor.js" record "validation" "$validation_time" >/dev/null 2>&1 || true
        node "$SCRIPT_DIR/performance-monitor.js" record "doctor" "$doctor_time" >/dev/null 2>&1 || true
        node "$SCRIPT_DIR/performance-monitor.js" record "git-status" "$git_time" >/dev/null 2>&1 || true
    fi
    
    echo ""
    print_status "Benchmark completed and recorded"
    log_optimization "benchmark" "validation:${validation_time}ms doctor:${doctor_time}ms git:${git_time}ms"
}

show_optimization_history() {
    print_header "Optimization History"
    echo ""
    
    if [ -f "$OPTIMIZATION_LOG" ]; then
        print_info "Recent optimizations:"
        tail -10 "$OPTIMIZATION_LOG" | while IFS='|' read -r timestamp optimization impact; do
            local date_part=$(echo "$timestamp" | cut -d'T' -f1)
            local time_part=$(echo "$timestamp" | cut -d'T' -f2 | cut -d'+' -f1 | cut -d'.' -f1)
            echo "  $date_part $time_part - $optimization ($impact)"
        done
    else
        print_info "No optimization history available"
    fi
}

case "$COMMAND" in
    "analyze")
        if analyze_system; then
            echo ""
            print_info "Run '$0 optimize' to apply available optimizations"
        fi
        ;;
    "optimize"|"apply")
        apply_optimizations
        ;;
    "benchmark"|"bench")
        benchmark_performance
        ;;
    "history")
        show_optimization_history
        ;;
    "full"|"complete")
        print_header "Complete Optimization Suite"
        echo ""
        
        analyze_system
        echo ""
        apply_optimizations
        echo ""
        benchmark_performance
        echo ""
        show_optimization_history
        
        print_header "Optimization Complete!"
        print_status "Your Claude Code Preferences system is now optimized!"
        ;;
    *)
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  analyze              Analyze system for optimization opportunities"
        echo "  optimize             Apply available optimizations"
        echo "  benchmark            Run performance benchmarks"
        echo "  history              Show optimization history"
        echo "  full                 Run complete optimization suite"
        echo ""
        echo "Examples:"
        echo "  $0 analyze           # Check what can be optimized"
        echo "  $0 optimize          # Apply optimizations"
        echo "  $0 full              # Full optimization run"
        echo ""
        exit 1
        ;;
esac