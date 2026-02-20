// src/plugins/rpg-stats.js — Session stats as D&D character attributes
// Zero dependencies. Node 18+ ESM.
//
// Maps session metrics to RPG stats on a 1-20 scale:
//   STR (Strength)  = lines added (piecewise: 0->1, 10->5, 50->10, 200->15, 500+->20)
//   DEX (Dexterity) = coding speed (lines added per minute)
//   INT (Intelligence) = context efficiency (output tokens per % context used)
//   WIS (Wisdom)    = cost efficiency (lower cost per line = higher WIS)
//   CHA (Charisma)  = 0, always. Because we're coding.
//
// Level = floor(total_cost_usd * 2) + 1, capped at 20.

export const meta = {
  name: 'rpg-stats',
  description: 'Session stats displayed as D&D character attributes',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    showLevel: true,
  },
};

/**
 * Linearly map `value` from [min, max] to [1, 20], clamped.
 * If min === max, returns 1 to avoid division by zero.
 *
 * @param {number} value
 * @param {number} min - Input range lower bound (maps to 1)
 * @param {number} max - Input range upper bound (maps to 20)
 * @returns {number} Integer in [1, 20]
 */
function scale(value, min, max) {
  if (max === min) return 1;
  const t = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.round(1 + clamped * 19);
}

/**
 * Piecewise linear interpolation for STR.
 * Anchor points: 0->1, 10->5, 50->10, 200->15, 500->20
 *
 * @param {number} lines - Lines added
 * @returns {number} Integer in [1, 20]
 */
function strengthFromLines(lines) {
  const anchors = [
    [0, 1],
    [10, 5],
    [50, 10],
    [200, 15],
    [500, 20],
  ];

  if (lines <= 0) return 1;
  if (lines >= 500) return 20;

  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1];
    const [x1, y1] = anchors[i];
    if (lines <= x1) {
      const t = (lines - x0) / (x1 - x0);
      return Math.round(y0 + t * (y1 - y0));
    }
  }

  return 20;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Extract metrics with safe access
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const durationMs = data?.cost?.total_duration_ms ?? 0;
  const totalCost = data?.cost?.total_cost_usd ?? 0;
  const usedPct = data?.context_window?.used_percentage ?? 0;
  const outputTokens = data?.context_window?.total_output_tokens ?? 0;

  // STR — lines added, piecewise mapping
  const str = strengthFromLines(linesAdded);

  // DEX — lines per minute (speed/efficiency)
  const minutes = durationMs / 60000;
  const linesPerMin = minutes > 0 ? linesAdded / minutes : 0;
  // 0 lpm -> 1, 50 lpm -> 20
  const dex = scale(linesPerMin, 0, 50);

  // INT — context efficiency: more output per % context = smarter
  const efficiency = outputTokens / (usedPct || 1);
  // 0 -> 1, 500 -> 20 (output tokens per percent of context)
  const int = scale(efficiency, 0, 500);

  // WIS — cost management: lower cost per line = wiser
  let wis = 1;
  if (linesAdded > 0) {
    const costPerLine = totalCost / linesAdded;
    // Invert: low cost per line = high WIS
    // $0.10/line -> 1, $0.00/line -> 20
    wis = scale(costPerLine, 0.10, 0);
  }

  // CHA — always 0. Because we're coding.
  const cha = 0;

  // Level = floor(cost * 2) + 1, capped at 20
  const level = Math.min(20, Math.floor(totalCost * 2) + 1);

  // Build display text
  const stats = `STR:${str} DEX:${dex} INT:${int} WIS:${wis} CHA:${cha}`;
  const text = cfg.showLevel ? `Lv.${level} ${stats}` : stats;

  return { text, style: cfg.style };
}
