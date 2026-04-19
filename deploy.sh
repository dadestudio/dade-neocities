#!/usr/bin/env bash
# Deploy dade-neocities to https://dadeog.neocities.org/
#
# Uses the `neocities` Ruby CLI. Requires prior auth via `neocities login`.
# `--prune` removes remote files that are not present locally so the live
# site mirrors the working tree exactly.
#
# Local-only files (docs, READMEs, package.json, dotfiles) are excluded
# explicitly so they never leak onto the public site.

set -euo pipefail

cd "$(dirname "$0")"

if ! command -v neocities >/dev/null 2>&1; then
  echo "ERROR: neocities CLI not found on PATH" >&2
  exit 127
fi

echo "[deploy] target: https://dadeog.neocities.org/"
echo "[deploy] pwd:    $(pwd)"
echo "[deploy] commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'n/a')"
echo "[deploy] running: neocities push --prune (with exclusions)"

neocities push --prune \
  -e .git \
  -e .gitignore \
  -e .DS_Store \
  -e .env \
  -e node_modules \
  -e docs \
  -e README.md \
  -e EASTER_EGGS.md \
  -e package.json \
  -e deploy.sh \
  .

echo "[deploy] done."
