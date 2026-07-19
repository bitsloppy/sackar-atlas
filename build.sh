#!/usr/bin/env bash
# Queer Heritage — Cloudflare Pages build script
#
# Handles Font Awesome Pro npm auth before running the Astro build.
# Set FONTAWESOME_NPM_AUTH_TOKEN in Cloudflare Pages → Settings →
# Environment Variables (Production + Preview).
#
# Local: token is picked up from ~/.zshrc or passed inline.
#        FONTAWESOME_NPM_AUTH_TOKEN=xxx bash build.sh
#
set -euo pipefail

echo "=== Build env debug ==="
env | grep -i fontawesome || echo "No FONTAWESOME vars found"
env | grep -i npm || echo "No npm vars found"
echo "=== End debug ==="

cd site

# Write the FA Pro registry token to .npmrc if available.
# This is more reliable than ${VAR} expansion in .npmrc across CI environments.
if [ -n "${FONTAWESOME_NPM_AUTH_TOKEN:-}" ]; then
  echo "Configuring Font Awesome Pro registry..."
  # Append to existing .npmrc (which already has the @fortawesome registry line)
  echo "//npm.fontawesome.com/:_authToken=${FONTAWESOME_NPM_AUTH_TOKEN}" >> .npmrc
else
  echo "Warning: FONTAWESOME_NPM_AUTH_TOKEN not set — Pro icons will not be available"
fi

npm install
npm run build
