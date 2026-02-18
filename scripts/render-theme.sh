#!/bin/bash
# Render a single theme's statusline output
# Usage: bash scripts/render-theme.sh <theme-name>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
THEME="$1"
FIXTURE="$ROOT/tests/fixtures/showcase-${THEME}.json"

# Default theme uses "default" name but "showcase-fresh.json" fixture
if [ "$THEME" = "default" ]; then
  FIXTURE="$ROOT/tests/fixtures/showcase-fresh.json"
fi

echo '{"lastDate":"'"$(date +%Y-%m-%d)"'","count":7}' > /tmp/omc-streak.json
echo "{\"theme\": \"$THEME\"}" > /tmp/omc-showcase-config.json

cat "$FIXTURE" | OMC_CONFIG=/tmp/omc-showcase-config.json OMC_WIDTH=100 node "$ROOT/src/runner.js"
