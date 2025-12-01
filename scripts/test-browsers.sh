#!/bin/bash

# Browser Testing Script
# Opens the application in multiple browsers for manual testing

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
URL="${1:-http://localhost:3000}"
DELAY=2

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Browser Testing Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Testing URL: ${URL}${NC}"
echo ""

# Check if development server is running
if ! curl -s "${URL}" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Development server not running at ${URL}${NC}"
    echo -e "${YELLOW}💡 Start the server with: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Development server is running${NC}"
echo ""

# Function to open browser
open_browser() {
    local browser_name=$1
    local browser_app=$2
    
    if [ -d "/Applications/${browser_app}.app" ]; then
        echo -e "${BLUE}🌐 Opening ${browser_name}...${NC}"
        open -a "${browser_app}" "${URL}"
        sleep $DELAY
        echo -e "${GREEN}✅ ${browser_name} opened${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  ${browser_name} not found${NC}"
        return 1
    fi
}

# Counter for opened browsers
opened=0

# Open browsers
echo -e "${BLUE}Opening browsers...${NC}"
echo ""

# Chrome
if open_browser "Google Chrome" "Google Chrome"; then
    ((opened++))
fi

# Firefox
if open_browser "Firefox" "Firefox"; then
    ((opened++))
fi

# Safari
if open_browser "Safari" "Safari"; then
    ((opened++))
fi

# Edge
if open_browser "Microsoft Edge" "Microsoft Edge"; then
    ((opened++))
fi

# Opera (optional)
if open_browser "Opera" "Opera"; then
    ((opened++))
fi

# Brave (optional)
if open_browser "Brave" "Brave Browser"; then
    ((opened++))
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Opened ${opened} browser(s)${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Testing instructions
echo -e "${YELLOW}📋 Testing Instructions:${NC}"
echo ""
echo "1. Test authentication (login/register)"
echo "2. Test dashboard (student/lecturer views)"
echo "3. Test complaint submission"
echo "4. Test complaint list and filters"
echo "5. Test complaint detail view"
echo "6. Test search functionality"
echo "7. Test notifications"
echo "8. Test voting system"
echo "9. Test analytics (lecturer)"
echo "10. Test responsive design (resize windows)"
echo ""
echo -e "${YELLOW}📝 Document any issues found in:${NC}"
echo "   docs/BROWSER_TESTING_RESULTS.md"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Happy Testing! 🚀${NC}"
echo -e "${BLUE}========================================${NC}"
