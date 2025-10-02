#!/bin/bash

# Debug script to check the history status in gh-pages branch
# This can be run manually to troubleshoot history issues

echo "=== GitHub Pages History Debug ==="
echo "Date: $(date -u)"
echo "Current branch: $(git branch --show-current)"
echo ""

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
    echo "✅ gh-pages branch exists"
else
    echo "❌ gh-pages branch does not exist"
    echo "Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    echo "# GitHub Pages for Playwright Reports" > README.md
    git add README.md
    git commit -m "Initial gh-pages commit"
    git push origin gh-pages
    git checkout main
    exit 0
fi

# Check current index.html in gh-pages
echo ""
echo "=== Checking current index.html in gh-pages ==="
git show origin/gh-pages:index.html > /tmp/current-index.html 2>/dev/null || echo "❌ No index.html found in gh-pages"

if [ -f /tmp/current-index.html ]; then
    TOTAL_ROWS=$(grep -c '<tr>' /tmp/current-index.html || echo 0)
    echo "✅ Found index.html with $TOTAL_ROWS total <tr> tags"
    
    # More detailed analysis
    HEADER_ROWS=$(sed -n '/<thead>/,/<\/thead>/p' /tmp/current-index.html | grep -c '<tr>' || echo 0)
    DATA_ROWS=$(sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html | grep -c '<tr>' || echo 0)
    
    echo "📊 Header rows: $HEADER_ROWS"
    echo "📊 Data rows in tbody: $DATA_ROWS"
    
    echo ""
    echo "=== HTML Structure Analysis ==="
    echo "Looking for tbody section:"
    grep -n "tbody" /tmp/current-index.html || echo "❌ No tbody tags found"
    
    echo ""
    echo "=== Data rows preview ==="
    if [ "$DATA_ROWS" -gt 0 ]; then
        echo "First few data rows:"
        sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html | grep '<tr>' | head -3
        echo ""
        echo "Last few data rows:"
        sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html | grep '<tr>' | tail -3
    else
        echo "❌ No data rows found in tbody"
        echo "Full tbody content:"
        sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html
    fi
    
    echo ""
    echo "=== Placeholder check ==="
    if grep -q "ROWS_PLACEHOLDER" /tmp/current-index.html; then
        echo "⚠️ ROWS_PLACEHOLDER still present - replacement might have failed"
    else
        echo "✅ ROWS_PLACEHOLDER was replaced"
    fi
fi

# Check reports directory
echo ""
echo "=== Checking reports directory ==="
REPORT_DIRS=$(git ls-tree -d origin/gh-pages:reports 2>/dev/null | wc -l || echo 0)
echo "📁 Report directories: $REPORT_DIRS"

if [ "$REPORT_DIRS" -gt 0 ]; then
    echo "Recent report directories:"
    git ls-tree origin/gh-pages:reports 2>/dev/null | tail -5
fi

echo ""
echo "=== Recommendations ==="
if [ "$DATA_ROWS" -eq 0 ]; then
    echo "⚠️  No data rows found. Possible issues:"
    echo "   1. History extraction is failing"
    echo "   2. HTML template replacement is not working"
    echo "   3. This might be the very first run"
elif [ "$DATA_ROWS" -eq 1 ]; then
    echo "⚠️  Only one data row found. Possible issues:"
    echo "   1. History extraction is not finding existing rows"
    echo "   2. Previous rows are being overwritten instead of preserved"
elif [ "$DATA_ROWS" -eq 2 ]; then
    echo "⚠️  Only two data rows found. History accumulation might be working but limited"
    echo "   Check if this is expected or if older entries are being lost"
else
    echo "✅ History appears to be working correctly with $DATA_ROWS entries."
fi

# Cleanup
rm -f /tmp/current-index.html