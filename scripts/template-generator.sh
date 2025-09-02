#!/bin/bash

# Template Generator for Claude Code Projects
# Creates customized CLAUDE.md and settings files for new projects

echo "🎨 Claude Code Template Generator"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMPLATES_DIR="$( dirname "$SCRIPT_DIR" )/templates"

# Check if templates directory exists
if [ ! -d "$TEMPLATES_DIR" ]; then
    print_error "Templates directory not found: $TEMPLATES_DIR"
    exit 1
fi

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        if [ -z "$input" ]; then
            declare -g "$var_name"="$default"
        else
            declare -g "$var_name"="$input"
        fi
    else
        read -p "$prompt: " input
        declare -g "$var_name"="$input"
    fi
}

# Get project information
echo ""
print_info "Please provide information about your project:"
echo ""

prompt_with_default "Project name" "" PROJECT_NAME
if [ -z "$PROJECT_NAME" ]; then
    print_error "Project name is required"
    exit 1
fi

prompt_with_default "Project path" "$(pwd)/$PROJECT_NAME" PROJECT_PATH
prompt_with_default "Project type" "Next.js" PROJECT_TYPE
prompt_with_default "Project description" "A new Claude Code project" PROJECT_DESCRIPTION

# Determine template based on project type
case "$PROJECT_TYPE" in
    "Next.js"|"nextjs"|"next")
        TEMPLATE_TYPE="nextjs"
        DEV_COMMAND="npm run dev --turbopack"
        BUILD_COMMAND="npm run build"
        START_COMMAND="npm run start"
        TEST_COMMAND="npm run test"
        LINT_COMMAND="npm run lint"
        FRAMEWORK="Next.js"
        LANGUAGE="TypeScript"
        ;;
    "Python"|"python"|"py")
        TEMPLATE_TYPE="python"
        DEV_COMMAND="python main.py"
        BUILD_COMMAND="python -m build"
        START_COMMAND="python main.py"
        TEST_COMMAND="python -m pytest"
        LINT_COMMAND="python -m black . && python -m flake8"
        FRAMEWORK="Python"
        LANGUAGE="Python"
        ;;
    "Node.js"|"nodejs"|"node")
        TEMPLATE_TYPE="nodejs"
        DEV_COMMAND="npm run dev"
        BUILD_COMMAND="npm run build"
        START_COMMAND="npm start"
        TEST_COMMAND="npm test"
        LINT_COMMAND="npm run lint"
        FRAMEWORK="Node.js"
        LANGUAGE="JavaScript/TypeScript"
        ;;
    *)
        TEMPLATE_TYPE="generic"
        DEV_COMMAND="npm run dev"
        BUILD_COMMAND="npm run build"
        START_COMMAND="npm start"
        TEST_COMMAND="npm test"
        LINT_COMMAND="npm run lint"
        FRAMEWORK="$PROJECT_TYPE"
        LANGUAGE="JavaScript"
        ;;
esac

# Additional prompts for customization
echo ""
print_info "Additional configuration:"
prompt_with_default "Development command" "$DEV_COMMAND" DEV_COMMAND
prompt_with_default "Build command" "$BUILD_COMMAND" BUILD_COMMAND
prompt_with_default "Test command" "$TEST_COMMAND" TEST_COMMAND
prompt_with_default "Lint command" "$LINT_COMMAND" LINT_COMMAND

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_PATH" ]; then
    print_info "Creating project directory: $PROJECT_PATH"
    mkdir -p "$PROJECT_PATH"
fi

# Generate CLAUDE.md from template
print_info "Generating CLAUDE.md..."
CLAUDE_MD_TEMPLATE="$TEMPLATES_DIR/project-claude-md.template"
CLAUDE_MD_OUTPUT="$PROJECT_PATH/CLAUDE.md"

if [ ! -f "$CLAUDE_MD_TEMPLATE" ]; then
    print_error "CLAUDE.md template not found: $CLAUDE_MD_TEMPLATE"
    exit 1
fi

# Simple template substitution
cp "$CLAUDE_MD_TEMPLATE" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{PROJECT_TYPE}}/$PROJECT_TYPE/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{PROJECT_DESCRIPTION}}/$PROJECT_DESCRIPTION/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{DEV_COMMAND}}/$DEV_COMMAND/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{BUILD_COMMAND}}/$BUILD_COMMAND/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{START_COMMAND}}/$START_COMMAND/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{TEST_COMMAND}}/$TEST_COMMAND/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{TEST_WATCH_COMMAND}}/$TEST_COMMAND --watch/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{TEST_E2E_COMMAND}}/$TEST_COMMAND:e2e/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{LINT_COMMAND}}/$LINT_COMMAND/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{FORMAT_COMMAND}}/npm run format/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{TYPECHECK_COMMAND}}/npm run type-check/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{FRAMEWORK}}/$FRAMEWORK/g" "$CLAUDE_MD_OUTPUT"
sed -i '' "s/{{LANGUAGE}}/$LANGUAGE/g" "$CLAUDE_MD_OUTPUT"

print_status "CLAUDE.md created: $CLAUDE_MD_OUTPUT"

# Generate .claude settings if template exists
SETTINGS_TEMPLATE="$TEMPLATES_DIR/${TEMPLATE_TYPE}-settings.template"
if [ -f "$SETTINGS_TEMPLATE" ]; then
    print_info "Generating Claude settings..."
    CLAUDE_DIR="$PROJECT_PATH/.claude"
    mkdir -p "$CLAUDE_DIR"
    
    SETTINGS_OUTPUT="$CLAUDE_DIR/settings.local.json"
    cp "$SETTINGS_TEMPLATE" "$SETTINGS_OUTPUT"
    sed -i '' "s|{{PROJECT_PATH}}|$PROJECT_PATH|g" "$SETTINGS_OUTPUT"
    
    print_status "Settings created: $SETTINGS_OUTPUT"
else
    print_warning "No settings template found for $TEMPLATE_TYPE"
fi

# Create basic project structure
print_info "Setting up basic project structure..."

case "$TEMPLATE_TYPE" in
    "nextjs")
        mkdir -p "$PROJECT_PATH"/{src,public,components,lib,utils,styles,types,__tests__}
        ;;
    "python")
        mkdir -p "$PROJECT_PATH"/{src,tests,scripts,data,config}
        echo "# $PROJECT_NAME" > "$PROJECT_PATH/README.md"
        touch "$PROJECT_PATH/requirements.txt"
        ;;
    *)
        mkdir -p "$PROJECT_PATH"/{src,tests,docs}
        echo "# $PROJECT_NAME" > "$PROJECT_PATH/README.md"
        ;;
esac

# Summary
echo ""
echo "=================================="
print_status "Template generation complete!"
echo ""
echo "Project: $PROJECT_NAME"
echo "Path: $PROJECT_PATH"
echo "Type: $PROJECT_TYPE"
echo ""
echo "Files created:"
echo "- CLAUDE.md (project-specific configuration)"
if [ -f "$PROJECT_PATH/.claude/settings.local.json" ]; then
    echo "- .claude/settings.local.json (Claude Code settings)"
fi
echo "- Basic project structure"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_PATH"
echo "2. Review and customize CLAUDE.md"
if [ -f "$PROJECT_PATH/.claude/settings.local.json" ]; then
    echo "3. Review .claude/settings.local.json"
fi
echo "4. Initialize your project (git init, npm init, etc.)"
echo ""
print_info "Happy coding with Claude! 🚀"