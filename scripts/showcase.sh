#!/bin/bash
# scripts/showcase.sh — Generate all showcase screenshots
#
# Each showcase runs in a fresh Node process so module-level segment state
# (achievements, emoji-story, etc.) resets between screenshots.
#
# Usage:
#   bash scripts/showcase.sh            # render all showcases
#   bash scripts/showcase.sh tamagotchi  # render just one

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FIXTURES="$ROOT/tests/fixtures"
TMP_CONFIG="/tmp/omc-showcase-config.json"

# Set up streak file so the streak segment shows "7d streak"
echo '{"lastDate":"'"$(date +%Y-%m-%d)"'","count":7}' > /tmp/omc-streak.json

run_showcase() {
  local theme="$1"
  local fixture="$2"
  local label="$3"

  # Write a temp config pointing to the theme
  echo "{\"theme\": \"$theme\"}" > "$TMP_CONFIG"

  echo ""
  echo "━━━ $label ━━━"
  echo "theme: $theme  |  config: {\"theme\": \"$theme\"}"
  echo ""
  cat "$FIXTURES/$fixture" | OMC_CONFIG="$TMP_CONFIG" OMC_WIDTH=100 node "$ROOT/src/runner.js"
  echo ""
  echo ""
}

# If a specific showcase name is given, run only that one
TARGET="${1:-all}"

if [ "$TARGET" = "all" ] || [ "$TARGET" = "tamagotchi" ]; then
  run_showcase "tamagotchi" "showcase-tamagotchi.json" "The Tamagotchi Terminal"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "boss-battle" ]; then
  run_showcase "boss-battle" "showcase-boss-battle.json" "Boss Battle Mode"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "rpg" ]; then
  run_showcase "rpg" "showcase-rpg.json" "The RPG Developer"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "coworker" ]; then
  run_showcase "coworker" "showcase-coworker.json" "The Coworker"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "danger-zone" ]; then
  run_showcase "danger-zone" "showcase-danger-zone.json" "The Danger Zone"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "fresh" ]; then
  run_showcase "default" "showcase-fresh.json" "Fresh Start"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "narrator" ]; then
  run_showcase "narrator" "showcase-narrator.json" "The Narrator"
fi

# Clean up
rm -f "$TMP_CONFIG"

echo "Done! Take screenshots of the output above."
echo "Tip: Use a dark terminal theme (Dracula, Tokyo Night, Catppuccin) with a Nerd Font for best results."
