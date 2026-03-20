#!/bin/bash
# Audit heading structure of all HTML files in dist/
# Reports: zero h1, multiple h1, skipped heading levels

DIST_DIR="C:/Users/robin/glp1/glp1/dist"

zero_h1=()
multi_h1=()
hierarchy_issues=()

while IFS= read -r -d '' file; do
    rel="${file#$DIST_DIR/}"

    # Extract all heading tags (h1-h6) in order, lowercase
    headings=$(grep -oiE '<h[1-6][^>]*>' "$file" | grep -oiE 'h[1-6]' | tr '[:upper:]' '[:lower:]')

    # Count h1 tags
    h1_count=$(echo "$headings" | grep -c '^h1$')

    if [ "$h1_count" -eq 0 ]; then
        zero_h1+=("$rel")
    elif [ "$h1_count" -gt 1 ]; then
        multi_h1+=("$rel (${h1_count} h1 tags)")
    fi

    # Check hierarchy: no skipped levels
    prev_level=0
    issue=""
    while IFS= read -r tag; do
        [ -z "$tag" ] && continue
        level="${tag#h}"
        if [ "$prev_level" -gt 0 ] && [ "$level" -gt "$((prev_level + 1))" ]; then
            issue="${issue}  h${prev_level} -> h${level} (skipped level)\n"
        fi
        prev_level="$level"
    done <<< "$headings"

    if [ -n "$issue" ]; then
        hierarchy_issues+=("$rel:\n${issue}")
    fi

done < <(find "$DIST_DIR" -name '*.html' -print0)

echo "============================================"
echo "HEADING STRUCTURE AUDIT REPORT"
echo "============================================"
echo ""

total_html=$(find "$DIST_DIR" -name '*.html' | wc -l)
echo "Total HTML files scanned: $total_html"
echo ""

echo "--------------------------------------------"
echo "PAGES WITH ZERO <h1> (${#zero_h1[@]} pages)"
echo "--------------------------------------------"
if [ ${#zero_h1[@]} -eq 0 ]; then
    echo "  None - all pages have at least one h1"
else
    for p in "${zero_h1[@]}"; do
        echo "  - $p"
    done
fi
echo ""

echo "--------------------------------------------"
echo "PAGES WITH MULTIPLE <h1> (${#multi_h1[@]} pages)"
echo "--------------------------------------------"
if [ ${#multi_h1[@]} -eq 0 ]; then
    echo "  None - all pages have at most one h1"
else
    for p in "${multi_h1[@]}"; do
        echo "  - $p"
    done
fi
echo ""

echo "--------------------------------------------"
echo "PAGES WITH HEADING HIERARCHY ISSUES (${#hierarchy_issues[@]} pages)"
echo "--------------------------------------------"
if [ ${#hierarchy_issues[@]} -eq 0 ]; then
    echo "  None - all pages have correct heading hierarchy"
else
    for p in "${hierarchy_issues[@]}"; do
        echo -e "  - $p"
    done
fi
echo ""
echo "============================================"
echo "AUDIT COMPLETE"
echo "============================================"
