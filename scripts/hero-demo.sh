#!/bin/bash
# Hero demo script — outputs each theme with a header, designed for VHS recording
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo '{"lastDate":"'"$(date +%Y-%m-%d)"'","count":7}' > /tmp/omc-streak.json

render() {
  local theme="$1"
  local fixture="showcase-${theme}.json"
  [ "$theme" = "default" ] && fixture="showcase-fresh.json"

  echo "{\"theme\": \"$theme\"}" > /tmp/omc-showcase-config.json
  printf "\033[1;32m❯\033[0m omc theme %s\n" "$theme"
  cat "$ROOT/tests/fixtures/$fixture" | OMC_CONFIG=/tmp/omc-showcase-config.json OMC_WIDTH=100 node "$ROOT/src/runner.js"
}

themes=(tamagotchi boss-battle rpg danger-zone narrator coworker)

for theme in "${themes[@]}"; do
  clear
  render "$theme"
  sleep 2.5
done
