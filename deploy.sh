#!/usr/bin/env bash
# Deploy dade-neocities to https://dadeog.neocities.org/
#
# Flow:
#   1. rsync the repo into a throwaway ./build/ dir (excluding local-only
#      files + the build dir itself).
#   2. Run scripts/hash-assets.sh to content-hash CSS/JS in build/ and
#      rewrite HTML references. Neocities ignores _headers, so filename
#      hashing is the only way to bust browser caches on redeploy.
#   3. neocities push --prune from inside build/.
#
# The working tree is never modified. `git status` stays clean.
#
# Requires: neocities CLI (Ruby gem), prior `neocities login` auth.

set -euo pipefail

cd "$(dirname "$0")"

if ! command -v neocities >/dev/null 2>&1; then
  echo "ERROR: neocities CLI not found on PATH" >&2
  exit 127
fi

if [[ ! -x scripts/hash-assets.sh ]]; then
  echo "ERROR: scripts/hash-assets.sh missing or not executable" >&2
  exit 1
fi

echo "[deploy] target: https://dadeog.neocities.org/"
echo "[deploy] pwd:    $(pwd)"
echo "[deploy] commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"

echo "[deploy] rebuilding ./build/"
rm -rf build
mkdir build

rsync -a \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='.env' \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='scripts' \
  --exclude='docs' \
  --exclude='deploy.sh' \
  --exclude='.DS_Store' \
  --exclude='README.md' \
  --exclude='EASTER_EGGS.md' \
  --exclude='package.json' \
  ./ build/

echo "[deploy] hashing assets"
./scripts/hash-assets.sh

echo "[deploy] running: neocities push --prune (from ./build/)"
( cd build && neocities push --prune . )

echo "[deploy] done. live: https://dadeog.neocities.org/"
