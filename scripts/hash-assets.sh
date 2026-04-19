#!/usr/bin/env bash
# Content-hash static assets inside ./build/ and rewrite HTML references.
#
# Why: Neocities ignores _headers, so we cannot send Cache-Control. The only
# reliable cache-busting technique is filename hashing (e.g. tokens.css ->
# tokens.a1b2c3d4.css). This script operates only on ./build/; the working
# tree is untouched.
#
# macOS-compatible: uses BSD `sed -i ''` and `shasum -a 1` (not sha1sum).
#
# Caller contract: ./build/ must already exist as a fresh copy of the repo
# (deploy.sh rsyncs it in).

set -euo pipefail

BUILD_DIR="./build"

if [[ ! -d "$BUILD_DIR" ]]; then
  echo "ERROR: $BUILD_DIR does not exist; run deploy.sh, not this script directly" >&2
  exit 1
fi

# Directories to scan for hashable .css / .js files.
# Note: build/audio/soundfonts/ is excluded explicitly (80MB+ of SoundFont
# .js samples that never change; re-hashing them is wasteful and pointless).
TARGETS=(
  "$BUILD_DIR/styles"
  "$BUILD_DIR/audio"
  "$BUILD_DIR/effects"
  "$BUILD_DIR/interactive"
  "$BUILD_DIR/scripts"
)

MAP_FILE="$(mktemp -t dade-hashmap.XXXXXX)"
trap 'rm -f "$MAP_FILE"' EXIT

hashed=0

for dir in "${TARGETS[@]}"; do
  [[ -d "$dir" ]] || continue

  while IFS= read -r -d '' file; do
    case "$file" in
      */audio/soundfonts/*) continue ;;
      */sounds/soundfonts/*) continue ;;
    esac

    base="$(basename "$file")"
    ext="${base##*.}"
    name="${base%.*}"

    # Skip anything that already looks hashed (.<8 hex>.ext).
    if [[ "$name" =~ \.[0-9a-f]{8}$ ]]; then
      continue
    fi

    hash="$(shasum -a 1 "$file" | cut -c1-8)"
    newbase="${name}.${hash}.${ext}"
    newpath="$(dirname "$file")/$newbase"

    mv "$file" "$newpath"
    printf '%s\t%s\n' "$base" "$newbase" >> "$MAP_FILE"
    hashed=$((hashed + 1))
  done < <(find "$dir" -type f \( -name '*.css' -o -name '*.js' \) -print0)
done

rewrites=0

if [[ -s "$MAP_FILE" ]]; then
  while IFS= read -r -d '' html; do
    changed=0
    while IFS=$'\t' read -r old new; do
      [[ -n "$old" && -n "$new" ]] || continue
      if grep -q -F -- "$old" "$html"; then
        # Escape regex metacharacters in old basename. Filenames here only
        # contain alnum, `-`, `_`, `.` — so escaping `.` is sufficient.
        old_esc="${old//./\\.}"
        # New basename goes into the replacement half; only `&`, `\`, and
        # the delimiter `|` need escaping.
        new_esc="${new//\\/\\\\}"
        new_esc="${new_esc//&/\\&}"
        new_esc="${new_esc//|/\\|}"
        sed -i '' "s|${old_esc}|${new_esc}|g" "$html"
        changed=1
      fi
    done < "$MAP_FILE"
    if [[ $changed -eq 1 ]]; then
      rewrites=$((rewrites + 1))
    fi
  done < <(find "$BUILD_DIR" -type f -name '*.html' -print0)
fi

echo "[hash-assets] hashed  ${hashed} file(s)"
echo "[hash-assets] rewrote ${rewrites} HTML file(s)"
