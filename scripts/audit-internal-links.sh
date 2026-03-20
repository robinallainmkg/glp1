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

  # Extract href values
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
    grep -v '^/admin' \
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
    target_file2="$DIST${normalized}"
    no_slash="${normalized%/}"
    target_file3="$DIST${no_slash}/index.html"
    target_file4="$DIST${no_slash}.html"

    if [ ! -f "$target_file" ] && [ ! -f "$target_file2" ] && [ ! -f "$target_file3" ] && [ ! -f "$target_file4" ]; then
      echo "$source_path	$normalized" >> "$BROKEN_LINKS"
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
  printf "%-55s  ->  %s\n" "SOURCE PAGE" "BROKEN HREF"
  printf "%-55s  ->  %s\n" "-------------------" "-------------------"
  while IFS=$'\t' read -r src tgt; do
    printf "%-55s  ->  %s\n" "$src" "$tgt"
  done < "$TMPDIR/broken_dedup.txt"
fi

# --- Step 4: Orphan pages ---
echo ""
echo "============================================"
echo "  ORPHAN PAGES (0 incoming internal links)"
echo "============================================"

orphan_count=0
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
  # Use fgrep for literal matching on the target column
  if grep -qF "	${with_slash}" "$ALL_LINKS" 2>/dev/null; then
    found=1
  elif grep -qF "	${no_slash}" "$ALL_LINKS" 2>/dev/null; then
    found=1
  fi

  if [ "$found" -eq 0 ]; then
    echo "  $url_path"
    orphan_count=$((orphan_count + 1))
  fi
done < "$ALL_PAGES"

echo ""
echo "Total orphan pages: $orphan_count"

# --- Step 5: Pages with fewest outgoing internal links ---
echo ""
echo "============================================"
echo "  PAGES WITH VERY FEW OUTGOING LINKS (<=2)"
echo "============================================"

sort -t$'\t' -k2 -n "$OUTGOING_COUNT" | while IFS=$'\t' read -r pg cnt; do
  if [ "$cnt" -le 2 ]; then
    printf "  %-65s  %s outgoing links\n" "$pg" "$cnt"
  fi
done

# --- Step 6: Pages with few incoming links (1-2) ---
echo ""
echo "============================================"
echo "  PAGES WITH FEW INCOMING LINKS (1-2)"
echo "============================================"

while IFS= read -r page; do
  rel="${page#$DIST}"
  url_path=$(echo "$rel" | sed 's|/index\.html$|/|' | sed 's|\.html$||')

  if [ "$url_path" = "/" ]; then
    continue
  fi

  no_slash="${url_path%/}"
  with_slash="${no_slash}/"

  # Count incoming links
  count1=$(grep -cF "	${with_slash}" "$ALL_LINKS" 2>/dev/null || echo 0)
  count2=$(grep -cF "	${no_slash}" "$ALL_LINKS" 2>/dev/null || echo 0)
  # Avoid double counting: if with_slash matches, no_slash also matches (substring)
  # Use exact tab+path+end matching
  count=$(grep -c "	${with_slash}$" "$ALL_LINKS" 2>/dev/null || echo 0)
  count_ns=$(grep -c "	${no_slash}$" "$ALL_LINKS" 2>/dev/null || echo 0)
  total=$((count + count_ns))

  if [ "$total" -ge 1 ] && [ "$total" -le 2 ]; then
    printf "  %-65s  %s incoming links\n" "$url_path" "$total"
  fi
done < "$ALL_PAGES"

# --- Step 7: Top linked pages ---
echo ""
echo "============================================"
echo "  TOP 15 MOST LINKED-TO PAGES"
echo "============================================"

cut -f2 "$ALL_LINKS" | sort | uniq -c | sort -rn | head -15 | while read -r cnt path; do
  printf "  %4s  %s\n" "$cnt" "$path"
done

# --- Step 8: Summary ---
echo ""
echo "============================================"
echo "  SUMMARY"
echo "============================================"
echo "  Total content pages:        $TOTAL_PAGES"
echo "  Total internal links:       $TOTAL_LINKS"
echo "  Broken links:               $BROKEN_COUNT"
echo "  Orphan pages:               $orphan_count"

avg_outgoing=$(awk -F'\t' '{sum+=$2} END {printf "%.1f", sum/NR}' "$OUTGOING_COUNT")
echo "  Avg outgoing links/page:    $avg_outgoing"

# Cleanup
rm -rf "$TMPDIR"

echo ""
echo "=== Audit Complete ==="
