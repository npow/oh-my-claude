#!/bin/bash
# Hero demo script — outputs each theme with a fake Claude Code input box
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIDTH=108

echo '{"lastDate":"'"$(date +%Y-%m-%d)"'","count":7}' > /tmp/omc-streak.json

input_box() {
  local w=$((WIDTH - 2))
  local inner=$((w - 4))
  # top border
  printf "\033[2m╭"
  printf '─%.0s' $(seq 1 $w)
  printf "╮\033[0m\n"
  # input line with cursor
  printf "\033[2m│\033[0m \033[1;36m>\033[0m "
  printf ' %.0s' $(seq 1 $inner)
  printf "\033[2m│\033[0m\n"
  # bottom border
  printf "\033[2m╰"
  printf '─%.0s' $(seq 1 $w)
  printf "╯\033[0m\n"
}

render() {
  local theme="$1"
  local fixture="showcase-${theme}.json"
  [ "$theme" = "default" ] && fixture="showcase-fresh.json"

  echo "{\"theme\": \"$theme\"}" > /tmp/omc-showcase-config.json
  input_box
  cat "$ROOT/tests/fixtures/$fixture" | OMC_CONFIG=/tmp/omc-showcase-config.json OMC_WIDTH=100 node "$ROOT/src/runner.js"
}

themes=(tamagotchi boss-battle rpg danger-zone narrator coworker)

for theme in "${themes[@]}"; do
  clear
  render "$theme"
  sleep 2.5
done
