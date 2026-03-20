#!/bin/bash
# Internal Link Audit Script for dist/ directory
# Finds broken links, orphan pages, and pages with few incoming links

DIST="/c/Users/robin/glp1/glp1/dist"
DOMAIN="glp1-france.fr"

# Temp files
TMPDIR=$(mktemp -d)
ALL_PAGES="$TMPDIR/all_pages.txt"
ALL_LINKS="$TMPDIR/all_links.txt"
OUTGOING_COUNT="$TMPDIR/outgoing_count.txt"
BROKEN_LINKS="$TMPDIR/broken_links.txt"

# --- Step 1: Collect all content pages (exclude admin, _astro, api, images) ---
echo "=== Internal Link Audit ==="
echo ""
echo "--- Step 1: Collecting all content pages in dist/ ---"

find "$DIST" -name "index.html" -o -name "404.html" | \
  grep -v '/admin/' | \
  grep -v '/admin-dashboard/' | \
  grep -v '/admin-stats' | \
  grep -v '/_astro/' | \
  grep -v '/api/' | \
  grep -v '/demo-' | \
  grep -v '/index-backup' | \
  sort > "$ALL_PAGES"

TOTAL_PAGES=$(wc -l < "$ALL_PAGES")
echo "Found $TOTAL_PAGES content pages"

# --- Step 2: Extract all internal links from each content page ---
echo ""
echo "--- Step 2: Extracting internal links ---"

> "$ALL_LINKS"
> "$BROKEN_LINKS"
> "$OUTGOING_COUNT"

while IFS= read -r page; do
  rel="${page#$DIST}"
  source_path=$(echo "$rel" | sed 's|/index\.html$|/|' | sed 's|\.html$||')

  # Extract href values - filter out JS template artifacts
  hrefs=$(grep -oE 'href="[^"]*"' "$page" 2>/dev/null | sed 's/href="//;s/"$//' | \
    grep -v '^$' | \
    grep -v '^#' | \
    grep -v '^mailto:' | \
    grep -v '^tel:' | \
    grep -v '^javascript:' | \
    grep -v '\.xml$' | \
    grep -v '\.json$' | \
    grep -v '\.svg$' | \
    grep -v '\.png$' | \
    grep -v '\.jpg$' | \
    grep -v '\.jpeg$' | \
    grep -v '\.webp$' | \
    grep -v '\.css$' | \
    grep -v '\.js$' | \
    grep -v '\.ico$' | \
    grep -v '\.woff' | \
    grep -v '/_astro/' | \
    grep -v '/api/' | \
    grep -v '^/admin' | \
    grep -v "'" | \
    grep -v '\$' | \
    grep -v '/+/' | \
    grep -v '\.collection' | \
    grep -v '\.slug' | \
    grep -v '\.url' | \
    grep -v 'article\.' | \
    grep -v '{' | \
    grep -v '}' | \
    grep -v '\.\.' \
  )

  link_count=0
  for href in $hrefs; do
    # Normalize: strip domain to get path
    normalized=$(echo "$href" | \
      sed "s|https\?://www\.$DOMAIN||" | \
      sed "s|https\?://$DOMAIN||")

    # Skip external links (still has http after stripping our domain)
    if echo "$normalized" | grep -qE '^https?://'; then
      continue
    fi

    # Skip anchors-only and empty
    if [ -z "$normalized" ] || [ "$normalized" = "#" ]; then
      continue
    fi

    # Strip anchor fragment
    normalized=$(echo "$normalized" | sed 's/#.*//')

    # Skip empty after stripping
    if [ -z "$normalized" ]; then
      continue
    fi

    # Ensure leading slash
    if ! echo "$normalized" | grep -q '^/'; then
      # Relative path - resolve from source dir
      source_dir=$(dirname "$source_path")
      normalized="$source_dir/$normalized"
    fi

    # Ensure trailing slash for directory-style URLs (no extension)
    if ! echo "$normalized" | grep -qE '\.\w+$' && ! echo "$normalized" | grep -q '/$'; then
      normalized="${normalized}/"
    fi

    # Record link: source -> target
    echo "$source_path	$normalized" >> "$ALL_LINKS"
    link_count=$((link_count + 1))

    # Check if target exists
    target_file="$DIST${normalized}index.html"
    no_slash="${normalized%/}"
    target_file2="$DIST${no_slash}/index.html"
    target_file3="$DIST${no_slash}.html"
    target_file4="$DIST${normalized}"

    if [ ! -f "$target_file" ] && [ ! -f "$target_file2" ] && [ ! -f "$target_file3" ] && [ ! -f "$target_file4" ]; then
      echo "$source_path	$href" >> "$BROKEN_LINKS"
    fi
  done

  echo "$source_path	$link_count" >> "$OUTGOING_COUNT"

done < "$ALL_PAGES"

TOTAL_LINKS=$(wc -l < "$ALL_LINKS")
echo "Found $TOTAL_LINKS internal links total"

# --- Step 3: Broken Links Report ---
echo ""
echo "============================================"
echo "  BROKEN INTERNAL LINKS"
echo "============================================"

# Deduplicate broken links
sort -u "$BROKEN_LINKS" > "$TMPDIR/broken_dedup.txt"
BROKEN_COUNT=$(wc -l < "$TMPDIR/broken_dedup.txt")
if [ "$BROKEN_COUNT" -eq 0 ]; then
  echo "No broken internal links found!"
else
  echo "Found $BROKEN_COUNT unique broken internal links:"
  echo ""

  # Group by broken href for cleaner output
  echo "--- Broken targets and pages linking to them ---"
  echo ""
  cut -f2 "$TMPDIR/broken_dedup.txt" | sort -u | while IFS= read -r target; do
    count=$(grep -cF "	$target" "$TMPDIR/broken_dedup.txt")
    echo "BROKEN: $target ($count pages link to this)"
    grep -F "	$target" "$TMPDIR/broken_dedup.txt" | cut -f1 | head -5 | while IFS= read -r src; do
      echo "    from: $src"
    done
    remaining=$((count - 5))
    if [ "$remaining" -gt 0 ]; then
      echo "    ... and $remaining more"
    fi
    echo ""
  done
fi

# --- Step 4: Orphan pages ---
echo ""
echo "============================================"
echo "  ORPHAN PAGES (0 incoming internal links)"
echo "============================================"
echo "(excluding test/backup/diagnostic pages)"
echo ""

orphan_count=0
orphan_real_count=0
while IFS= read -r page; do
  rel="${page#$DIST}"
  url_path=$(echo "$rel" | sed 's|/index\.html$|/|' | sed 's|\.html$||')

  # Skip homepage
  if [ "$url_path" = "/" ]; then
    continue
  fi

  # Check if this path appears as a target in ALL_LINKS
  no_slash="${url_path%/}"
  with_slash="${no_slash}/"

  found=0
  if grep -q "	${with_slash}$" "$ALL_LINKS" 2>/dev/null; then
    found=1
  elif [ -n "$no_slash" ] && grep -q "	${no_slash}$" "$ALL_LINKS" 2>/dev/null; then
    found=1
  fi

  if [ "$found" -eq 0 ]; then
    orphan_count=$((orphan_count + 1))
    # Classify
    is_test=0
    echo "$url_path" | grep -qE '(test-|backup|diagnostic|fixed)' && is_test=1

    if [ "$is_test" -eq 0 ]; then
      orphan_real_count=$((orphan_real_count + 1))
      echo "  $url_path"
    fi
  fi
done < "$ALL_PAGES"

echo ""
echo "Real orphan pages: $orphan_real_count (+ $(( orphan_count - orphan_real_count )) test/backup pages)"

# --- Step 5: Pages with fewest outgoing internal links ---
echo ""
echo "============================================"
echo "  PAGES WITH VERY FEW OUTGOING LINKS (<=2)"
echo "  (excluding /collections/ mirror pages)"
echo "============================================"

sort -t$'\t' -k2 -n "$OUTGOING_COUNT" | while IFS=$'\t' read -r pg cnt; do
  if [ "$cnt" -le 2 ]; then
    # Skip /collections/ pages (they seem to be raw content without nav)
    if echo "$pg" | grep -q '/collections/'; then
      continue
    fi
    printf "  %-65s  %s outgoing links\n" "$pg" "$cnt"
  fi
done

# --- Step 6: Pages with few incoming links (1-2) ---
echo ""
echo "============================================"
echo "  PAGES WITH FEW INCOMING LINKS (1-2)"
echo "  (excluding /collections/ and test pages)"
echo "============================================"

while IFS= read -r page; do
  rel="${page#$DIST}"
  url_path=$(echo "$rel" | sed 's|/index\.html$|/|' | sed 's|\.html$||')

  if [ "$url_path" = "/" ]; then
    continue
  fi

  # Skip collections and test pages
  if echo "$url_path" | grep -qE '(/collections/|test-|backup|diagnostic|fixed)'; then
    continue
  fi

  no_slash="${url_path%/}"
  with_slash="${no_slash}/"

  # Count incoming links using line-end matching
  count_ws=$(grep -c "	${with_slash}$" "$ALL_LINKS" 2>/dev/null || true)
  count_ns=0
  if [ -n "$no_slash" ]; then
    count_ns=$(grep -c "	${no_slash}$" "$ALL_LINKS" 2>/dev/null || true)
  fi
  # Ensure numeric
  count_ws=${count_ws:-0}
  count_ns=${count_ns:-0}
  total=$((count_ws + count_ns))

  if [ "$total" -ge 1 ] && [ "$total" -le 2 ]; then
    printf "  %-65s  %s incoming links\n" "$url_path" "$total"
  fi
done < "$ALL_PAGES"

# --- Step 7: Top linked pages ---
echo ""
echo "============================================"
echo "  TOP 20 MOST LINKED-TO PAGES"
echo "============================================"

cut -f2 "$ALL_LINKS" | sort | uniq -c | sort -rn | head -20 | while read -r cnt path; do
  printf "  %4s  %s\n" "$cnt" "$path"
done

# --- Step 8: Summary ---
echo ""
echo "============================================"
echo "  SUMMARY"
echo "============================================"
echo "  Total content pages:        $TOTAL_PAGES"
echo "  Total internal links:       $TOTAL_LINKS"
echo "  Broken links (unique):      $BROKEN_COUNT"
echo "  Orphan pages (real):        $orphan_real_count"
echo "  Orphan pages (test/backup): $((orphan_count - orphan_real_count))"

avg_outgoing=$(awk -F'\t' '{sum+=$2} END {printf "%.1f", sum/NR}' "$OUTGOING_COUNT")
echo "  Avg outgoing links/page:    $avg_outgoing"

# Cleanup
rm -rf "$TMPDIR"

echo ""
echo "=== Audit Complete ==="
