// src/plugins/speedrun.js — Treat the session like a speedrun with timer and rating
// Zero dependencies. Node 18+ ESM.
//
// Display: ⏱️ MM:SS [rating]
//
// Rating based on "cost efficiency" = lines_added / cost_usd (lines per dollar):
//   >= 500: S (bold magenta)
//   >= 200: A (bold green)
//   >= 100: B (green)
//   >=  50: C (yellow)
//   >=  20: D (red)
//   <  20:  F (bold red)
//
// If cost is 0/null and lines > 0, rating is S (free code!).
// If both cost and lines are 0, return null.
// If duration is 0/null, return null.

/**
 * Rating tiers, checked in order (highest threshold first).
 * @type {Array<{min: number, grade: string, style: string}>}
 */
const TIERS = [
  { min: 500, grade: 'S', style: 'bold magenta' },
  { min: 200, grade: 'A', style: 'bold green' },
  { min: 100, grade: 'B', style: 'green' },
  { min: 50,  grade: 'C', style: 'yellow' },
  { min: 20,  grade: 'D', style: 'red' },
];

const TIER_F = { grade: 'F', style: 'bold red' };
const TIER_S = TIERS[0]; // S tier for free code

export const meta = {
  name: 'speedrun',
  description: 'Session speedrun timer with cost-efficiency rating',
  requires: [],
  defaultConfig: {
    style: '',
    showRating: true,
  },
};

/**
 * Format milliseconds as MM:SS.
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms ?? 0;
  if (!durationMs) return null;

  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;

  // Both zero — nothing to show
  if (linesAdded === 0 && cost === 0) return null;

  // Determine rating
  let rating;
  if (cost === 0 || cost == null) {
    // Free code is always S tier
    rating = TIER_S;
  } else if (linesAdded === 0) {
    // No lines but nonzero cost
    rating = TIER_F;
  } else {
    const efficiency = linesAdded / cost;
    rating = TIERS.find((t) => efficiency >= t.min) ?? TIER_F;
  }

  const time = formatTime(durationMs);
  const showRating = cfg.showRating ?? true;
  const text = showRating
    ? `\u23F1\uFE0F ${time} [${rating.grade}]`
    : `\u23F1\uFE0F ${time}`;

  const style = cfg.style || rating.style;

  return { text, style };
}
