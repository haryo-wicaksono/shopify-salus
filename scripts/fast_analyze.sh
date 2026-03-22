#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

OUTPUT="scripts/analysis_results.md"
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S%z")

echo "# Codebase Analysis Report" > "$OUTPUT"
echo "Generated: $TIMESTAMP" >> "$OUTPUT"
echo "" >> "$OUTPUT"

###############################################################################
# 1. SNIPPETS
###############################################################################
echo "Analyzing snippets..."
unused_snippets=()

for f in snippets/*.liquid; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .liquid)
  
  # Check for exact render/include calls
  # This avoids substring false positives (e.g. quick-add-btn vs card__quick-add-btn)
  if ! git grep -qE "(render|include)\s+['\"]${name}['\"]" -- '*.liquid'; then
    unused_snippets+=("$f")
  fi
done

echo "## Unused Snippets (${#unused_snippets[@]})" >> "$OUTPUT"
for f in "${unused_snippets[@]}"; do
  echo "- \`$f\`" >> "$OUTPUT"
done
echo "" >> "$OUTPUT"

###############################################################################
# 2. SECTIONS
###############################################################################
echo "Analyzing sections..."
unused_sections=()

for f in sections/*.liquid; do
  [ -e "$f" ] || continue
  name=$(basename "$f" .liquid)
  # name_underscore allows matching things like featured_product
  name_underscore=$(echo "$name" | tr '-' '_')
  is_used=false

  # Broad search across JSON files: check if either the hyphen or underscore 
  # version of the name appears anywhere in JSON templates, groups, or settings_data
  if git grep -qE "[\"'](${name}|${name_underscore})[\"']" -- 'templates/*.json' 'sections/*-group.json' 'config/settings_data.json' 2>/dev/null; then
    is_used=true
  fi

  # Static section tag in layout
  if [ "$is_used" = false ] && git grep -qE "section\s+['\"]${name}['\"]" -- 'layout/*.liquid' 2>/dev/null; then
    is_used=true
  fi

  # Render/include as snippet (section-as-snippet pattern)
  if [ "$is_used" = false ] && git grep -qE "(render|include)\s+['\"]${name}['\"]" -- '*.liquid'; then
    is_used=true
  fi
  
  # Check for Dynamic / JS component references (quoted name)
  if [ "$is_used" = false ] && git grep -qE "['\"]${name}['\"]" -- '*.liquid' '*.js' 2>/dev/null; then
      is_used=true
  fi

  if [ "$is_used" = false ]; then
    unused_sections+=("$f")
  fi
done

echo "## Unused Sections (${#unused_sections[@]})" >> "$OUTPUT"
for f in "${unused_sections[@]}"; do
  echo "- \`$f\`" >> "$OUTPUT"
done
echo "" >> "$OUTPUT"

###############################################################################
# 3. ASSETS
###############################################################################
echo "Analyzing assets..."
unused_assets=()

for f in assets/*; do
  [ -e "$f" ] || continue
  name=$(basename "$f")
  
  # Use exact string match, across liquid, js, and css files
  # Exclude self-references!
  if ! git grep -qF "$name" -- '*.liquid' '*.js' '*.css' ":(exclude)assets/${name}"; then
    unused_assets+=("$f")
  fi
done

echo "## Unused Assets (${#unused_assets[@]})" >> "$OUTPUT"
for f in "${unused_assets[@]}"; do
  echo "- \`$f\`" >> "$OUTPUT"
done

echo "Done! Report generated at $OUTPUT"
