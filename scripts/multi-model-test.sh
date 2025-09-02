#!/bin/bash

# Multi-Model Testing Script
# Test and compare responses across different LLM models

echo "🤖 Multi-Model LLM Testing"
echo "=========================="

# Check if required arguments are provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <prompt> [models...]"
    echo "Example: $0 'Explain quantum computing' gpt-4o claude-opus haiku"
    echo ""
    echo "Available models:"
    echo "  - gpt-4o (default)"
    echo "  - claude-opus"
    echo "  - claude-sonnet" 
    echo "  - claude-haiku"
    echo "  - groq-llama"
    echo "  - openrouter"
    exit 1
fi

PROMPT="$1"
shift
MODELS=("$@")

# Default models if none specified
if [ ${#MODELS[@]} -eq 0 ]; then
    MODELS=("gpt-4o" "claude-sonnet" "claude-haiku")
fi

echo "Prompt: $PROMPT"
echo "Models: ${MODELS[@]}"
echo ""

# Create output directory with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="/tmp/multi-model-test-$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"

echo "Results will be saved to: $OUTPUT_DIR"
echo ""

for model in "${MODELS[@]}"; do
    echo "Testing $model..."
    
    # Create output file for this model
    OUTPUT_FILE="$OUTPUT_DIR/${model}_response.txt"
    
    # Add headers
    echo "Model: $model" > "$OUTPUT_FILE"
    echo "Timestamp: $(date)" >> "$OUTPUT_FILE"
    echo "Prompt: $PROMPT" >> "$OUTPUT_FILE"
    echo "===========================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    case $model in
        "gpt-4o")
            echo "Note: Would call OpenAI API with GPT-4o" >> "$OUTPUT_FILE"
            echo "Quality: ⭐⭐⭐⭐⭐ | Speed: ⭐⭐⭐ | Cost: ⭐⭐" >> "$OUTPUT_FILE"
            ;;
        "claude-opus")
            echo "Note: Would call Anthropic API with Claude Opus" >> "$OUTPUT_FILE"
            echo "Quality: ⭐⭐⭐⭐⭐ | Speed: ⭐⭐ | Cost: ⭐" >> "$OUTPUT_FILE"
            ;;
        "claude-sonnet")
            echo "Note: Would call Anthropic API with Claude Sonnet" >> "$OUTPUT_FILE"
            echo "Quality: ⭐⭐⭐⭐ | Speed: ⭐⭐⭐⭐ | Cost: ⭐⭐⭐" >> "$OUTPUT_FILE"
            ;;
        "claude-haiku")
            echo "Note: Would call Anthropic API with Claude Haiku" >> "$OUTPUT_FILE"
            echo "Quality: ⭐⭐⭐ | Speed: ⭐⭐⭐⭐⭐ | Cost: ⭐⭐⭐⭐⭐" >> "$OUTPUT_FILE"
            ;;
        "groq-llama")
            echo "Note: Would call Groq API with Llama model" >> "$OUTPUT_FILE"
            echo "Quality: ⭐⭐⭐ | Speed: ⭐⭐⭐⭐⭐ | Cost: ⭐⭐⭐⭐" >> "$OUTPUT_FILE"
            ;;
        *)
            echo "Note: Would test with $model" >> "$OUTPUT_FILE"
            echo "Quality: Unknown | Speed: Unknown | Cost: Unknown" >> "$OUTPUT_FILE"
            ;;
    esac
    
    echo "" >> "$OUTPUT_FILE"
    echo "[API Response would appear here]" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "✅ $model response saved"
done

echo ""
echo "🎯 Testing Complete!"
echo ""
echo "Next steps:"
echo "1. Implement actual API calls for each model"
echo "2. Add response timing and cost tracking"
echo "3. Create comparison report"
echo "4. Add quality scoring system"
echo ""
echo "Results directory: $OUTPUT_DIR"

# Create comparison template
COMPARISON_FILE="$OUTPUT_DIR/comparison_template.md"
cat > "$COMPARISON_FILE" << EOF
# Multi-Model Comparison Results

**Prompt**: $PROMPT
**Timestamp**: $(date)
**Models Tested**: ${MODELS[@]}

## Response Quality Ranking
1. [ ] Model Name - Quality Score
2. [ ] Model Name - Quality Score
3. [ ] Model Name - Quality Score

## Speed Comparison
- Fastest: [ ] Model Name (X.X seconds)
- Slowest: [ ] Model Name (X.X seconds)

## Cost Analysis
- Most Expensive: [ ] Model Name (\$X.XX)
- Most Economical: [ ] Model Name (\$X.XX)

## Use Case Recommendations

### For this type of prompt, use:
- **Primary**: [ ] Model Name (reason)
- **Secondary**: [ ] Model Name (reason)
- **Budget Option**: [ ] Model Name (reason)

## Notes
- [ ] Add observations
- [ ] Add performance insights
- [ ] Add cost-benefit analysis
EOF

echo "📊 Comparison template created: $COMPARISON_FILE"