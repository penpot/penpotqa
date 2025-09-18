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
    ROW_COUNT=$(grep -c '<tr>' /tmp/current-index.html | grep -v 'th>' || echo 0)
    echo "✅ Found index.html with $ROW_COUNT total rows"
    
    DATA_ROWS=$(sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html | grep -c '<tr>' || echo 0)
    echo "📊 Data rows in tbody: $DATA_ROWS"
    
    echo ""
    echo "=== Recent entries preview ==="
    sed -n '/<tbody>/,/<\/tbody>/p' /tmp/current-index.html | grep -A1 -B1 '<tr>' | head -20
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
    echo "⚠️  No data rows found. The history might be corrupted."
    echo "   Consider running a manual workflow to regenerate the first entry."
elif [ "$DATA_ROWS" -eq 1 ]; then
    echo "⚠️  Only one data row found. History might not be accumulating properly."
    echo "   Check the upload-reports action logic."
else
    echo "✅ History appears to be working correctly with $DATA_ROWS entries."
fi

# Cleanup
rm -f /tmp/current-index.html