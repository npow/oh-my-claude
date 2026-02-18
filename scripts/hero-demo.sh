#!/bin/bash
# Hero demo script — outputs each theme with a fake Claude Code input box
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo '{"lastDate":"'"$(date +%Y-%m-%d)"'","count":7}' > /tmp/omc-streak.json

input_box() {
  # 90-char wide box (fits safely in VHS at 1100px/font15 ≈ 95 cols)
  printf "\033[2m╭──────────────────────────────────────────────────────────────────────────────────────────╮\033[0m\n"
  printf "\033[2m│\033[0m \033[1;36m>\033[0m                                                                                        \033[2m│\033[0m\n"
  printf "\033[2m╰──────────────────────────────────────────────────────────────────────────────────────────╯\033[0m\n"
}

render() {
  local theme="$1"
  local fixture="showcase-${theme}.json"
  [ "$theme" = "default" ] && fixture="showcase-fresh.json"

  echo "{\"theme\": \"$theme\"}" > /tmp/omc-showcase-config.json
  input_box
  cat "$ROOT/tests/fixtures/$fixture" | OMC_CONFIG=/tmp/omc-showcase-config.json OMC_WIDTH=90 node "$ROOT/src/runner.js"
}

themes=(tamagotchi boss-battle rpg danger-zone narrator coworker)

for theme in "${themes[@]}"; do
  clear
  render "$theme"
  sleep 2.5
done
