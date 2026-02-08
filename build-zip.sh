#!/usr/bin/env bash
set -e
OUT="bluebird"
FILES=(
appearance
assets
core
ui  manifest.json logo.svg service-worker.js README.md package.json LICENSE )
SRC=( src )
rm -f "$OUT"
zip -r "$OUT" "${FILES[@]}" "${SRC[@]}"
echo "Created $OUT"