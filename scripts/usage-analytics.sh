#!/bin/bash

# Usage Analytics for Claude Code Preferences
# Tracks and analyzes usage patterns with privacy-first approach

set -e

echo "📈 Claude Code Usage Analytics"
echo "=============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_header() { echo -e "${MAGENTA}━━━ $1 ━━━${NC}"; }

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PREFS_DIR="$( dirname "$SCRIPT_DIR" )"
ANALYTICS_DIR="$HOME/.claude/analytics"
USAGE_LOG="$ANALYTICS_DIR/usage.log"
DAILY_LOG="$ANALYTICS_DIR/daily-$(date +%Y%m%d).log"

# Ensure analytics directory exists
mkdir -p "$ANALYTICS_DIR"

# Command
COMMAND="${1:-show}"

log_usage() {
    local event="$1"
    local details="$2"
    local timestamp=$(date -Iseconds)
    
    echo "$timestamp|$event|$details" >> "$USAGE_LOG"
    echo "$timestamp|$event|$details" >> "$DAILY_LOG"
}

show_analytics() {
    print_header "Usage Analytics Report"
    echo ""
    
    if [ ! -f "$USAGE_LOG" ]; then
        print_warning "No usage data found. Start using the system to collect analytics."
        return
    fi
    
    # Calculate date ranges
    local today=$(date +%Y-%m-%d)
    local week_ago=$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d 2>/dev/null || echo "2024-01-01")
    local month_ago=$(date -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d 2>/dev/null || echo "2024-01-01")
    
    print_info "📊 Activity Summary:"
    echo ""
    
    # Total events
    local total_events=$(wc -l < "$USAGE_LOG" 2>/dev/null || echo "0")
    print_status "Total events recorded: $total_events"
    
    # Today's activity
    local today_events=$(grep "^$(date +%Y-%m-%d)" "$USAGE_LOG" 2>/dev/null | wc -l || echo "0")
    print_status "Today's activity: $today_events events"
    
    # Most used commands
    echo ""
    print_info "🔝 Most Used Commands (Last 30 days):"
    if [ -f "$USAGE_LOG" ]; then
        grep "$month_ago\\|$(date +%Y-%m-%d)" "$USAGE_LOG" 2>/dev/null | \
        cut -d'|' -f2 | \
        sort | uniq -c | sort -nr | head -10 | \
        while read count command; do
            echo "  $count × $command"
        done
    fi
    
    # Daily activity pattern
    echo ""
    print_info "📅 Daily Activity (Last 7 days):"
    for i in {6..0}; do
        local check_date=$(date -d "$i days ago" +%Y-%m-%d 2>/dev/null || date -v-${i}d +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
        local day_name=$(date -d "$check_date" +%a 2>/dev/null || date -j -f %Y-%m-%d "$check_date" +%a 2>/dev/null || echo "Day")
        local day_events=$(grep "^$check_date" "$USAGE_LOG" 2>/dev/null | wc -l || echo "0")
        
        # Create simple bar chart
        local bar=""
        local bar_length=$((day_events / 5))
        if [ $bar_length -gt 20 ]; then bar_length=20; fi
        for ((j=1; j<=bar_length; j++)); do bar="${bar}█"; done
        
        printf "  %s %s: %2d %s\\n" "$check_date" "$day_name" "$day_events" "$bar"
    done
    
    # Feature usage
    echo ""
    print_info "🎯 Feature Usage:"
    if [ -f "$USAGE_LOG" ]; then
        # Extract feature categories from commands
        echo "  Backup/Restore:"
        grep -c "backup\|restore" "$USAGE_LOG" 2>/dev/null | head -1 | sed 's/^/    /' || echo "    0"
        
        echo "  Validation/Health:"
        grep -c "validate\|doctor\|health" "$USAGE_LOG" 2>/dev/null | head -1 | sed 's/^/    /' || echo "    0"
        
        echo "  Environment Management:"
        grep -c "env\|environment" "$USAGE_LOG" 2>/dev/null | head -1 | sed 's/^/    /' || echo "    0"
        
        echo "  Screenshot/Web Tools:"
        grep -c "screenshot\|scrape" "$USAGE_LOG" 2>/dev/null | head -1 | sed 's/^/    /' || echo "    0"
        
        echo "  AI Team Management:"
        grep -c "teams\|claude-message" "$USAGE_LOG" 2>/dev/null | head -1 | sed 's/^/    /' || echo "    0"
    fi
    
    # Performance insights
    echo ""
    print_info "⚡ Performance Insights:"
    
    # Check if performance monitor has data
    if [ -f "$HOME/.claude/metrics/performance.json" ]; then
        node -e "
            try {
                const metrics = JSON.parse(require('fs').readFileSync('$HOME/.claude/metrics/performance.json', 'utf8'));
                const scriptTimes = metrics.performance.scriptExecutionTimes;
                
                if (Object.keys(scriptTimes).length > 0) {
                    console.log('  Script performance data available');
                    console.log('  Run: npm run performance report');
                } else {
                    console.log('  No performance data collected yet');
                }
            } catch(e) {
                console.log('  Performance monitoring not initialized');
            }
        " 2>/dev/null || echo "  Performance monitoring not available"
    else
        echo "  Performance monitoring not initialized"
        echo "  Run: npm run performance benchmark"
    fi
    
    # System health trends
    echo ""
    print_info "🏥 Health Check Trends:"
    local health_checks=$(grep -c "doctor\|validate\|health" "$USAGE_LOG" 2>/dev/null || echo "0")
    if [ "$health_checks" -gt 0 ]; then
        print_status "Health checks performed: $health_checks"
        local avg_per_week=$(( health_checks * 7 / 30 ))
        echo "  Average per week: ~$avg_per_week"
        if [ "$avg_per_week" -lt 2 ]; then
            print_warning "  Recommendation: Run health checks more frequently"
        fi
    else
        print_warning "No health checks recorded"
        print_info "  Recommendation: Run 'npm run doctor' regularly"
    fi
}

export_analytics() {
    local format="${2:-json}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local output_file="claude-analytics-$timestamp.$format"
    
    print_info "Exporting analytics data to: $output_file"
    
    if [ "$format" = "json" ]; then
        {
            echo "{"
            echo "  \"export_date\": \"$(date -Iseconds)\","
            echo "  \"total_events\": $(wc -l < "$USAGE_LOG" 2>/dev/null || echo "0"),"
            echo "  \"data\": ["
            
            local first=true
            while IFS='|' read -r timestamp event details; do
                if [ "$first" = "true" ]; then
                    first=false
                else
                    echo ","
                fi
                echo -n "    {\"timestamp\": \"$timestamp\", \"event\": \"$event\", \"details\": \"$details\"}"
            done < "$USAGE_LOG" 2>/dev/null
            
            echo ""
            echo "  ]"
            echo "}"
        } > "$output_file"
    elif [ "$format" = "csv" ]; then
        {
            echo "timestamp,event,details"
            while IFS='|' read -r timestamp event details; do
                echo "\"$timestamp\",\"$event\",\"$details\""
            done < "$USAGE_LOG" 2>/dev/null
        } > "$output_file"
    fi
    
    print_status "Analytics exported to: $output_file"
}

track_command() {
    local command="$2"
    local details="${3:-}"
    
    if [ -n "$command" ]; then
        log_usage "$command" "$details"
        print_status "Tracked: $command"
    else
        print_error "Usage: $0 track <command> [details]"
    fi
}

show_privacy_info() {
    print_header "Privacy & Data Collection"
    echo ""
    
    print_info "🔒 Privacy-First Analytics:"
    echo "  • All data stored locally on your machine"
    echo "  • No data transmitted to external servers"
    echo "  • No personally identifiable information collected"
    echo "  • You control all data retention and deletion"
    echo ""
    
    print_info "📁 Data Storage Locations:"
    echo "  • Usage logs: $ANALYTICS_DIR"
    echo "  • Performance metrics: $HOME/.claude/metrics"
    echo "  • Backups: $HOME/.claude/backups"
    echo ""
    
    print_info "🗑️ Data Management:"
    echo "  • Clear usage data: $0 clear"
    echo "  • Export data: $0 export [json|csv]"
    echo "  • View raw logs: cat $USAGE_LOG"
    echo ""
    
    print_info "⚙️ What's Collected:"
    echo "  • Command execution frequency"
    echo "  • Feature usage patterns"
    echo "  • Performance timing data"
    echo "  • Error and success rates"
    echo ""
    
    print_info "❌ What's NOT Collected:"
    echo "  • File contents or code"
    echo "  • Personal information"
    echo "  • Network activity"
    echo "  • Sensitive configuration details"
}

clear_analytics() {
    print_warning "This will delete all usage analytics data."
    read -p "Are you sure? [y/N]: " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$ANALYTICS_DIR"
        mkdir -p "$ANALYTICS_DIR"
        print_status "Analytics data cleared"
    else
        print_info "Clear operation cancelled"
    fi
}

# Auto-track this script execution
log_usage "analytics" "$COMMAND"

case "$COMMAND" in
    "show"|"report")
        show_analytics
        ;;
    "export")
        export_analytics "$@"
        ;;
    "track")
        track_command "$@"
        ;;
    "privacy"|"info")
        show_privacy_info
        ;;
    "clear")
        clear_analytics
        ;;
    "init")
        print_info "Initializing analytics..."
        log_usage "init" "Analytics system initialized"
        print_status "Analytics initialized at: $ANALYTICS_DIR"
        ;;
    *)
        echo ""
        echo "Usage: $0 <command> [options]"
        echo ""
        echo "Commands:"
        echo "  show                 Display usage analytics report"
        echo "  export [json|csv]    Export analytics data"
        echo "  track <cmd> [info]   Track command usage manually"
        echo "  privacy              Show privacy and data collection info"
        echo "  clear                Clear all analytics data"
        echo "  init                 Initialize analytics system"
        echo ""
        echo "Examples:"
        echo "  $0 show"
        echo "  $0 export csv"
        echo "  $0 track backup 'automated backup'"
        echo ""
        exit 1
        ;;
esac