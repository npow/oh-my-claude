// src/plugins/smart-nudge.js — Context-aware suggestions that appear when relevant
// Zero dependencies. Node 18+ ESM.
//
// Shows ONE nudge at a time — the highest priority match.
// Anti-annoyance: if the same nudge fires 5+ times in a row, suppress it.
//
// Priority order (highest wins):
//   1. compact       — context >= 75%
//   2. commit        — lines_added >= 100
//   3. break         — total_duration_ms >= 5,400,000 (90 min)
//   4. switch-model  — cost >= $10 AND context < 40%
//   5. nothing       — return null

export const meta = {
  name: 'smart-nudge',
  description: 'Context-aware suggestions that appear when relevant',
  requires: [],
  defaultConfig: {
    style: '',
    enabled: true,
  },
};

// --- Anti-annoyance state ---------------------------------------------------
let lastNudge = null;
let sameCount = 0;

/**
 * Nudges in priority order (highest wins). Each entry:
 *   id    — unique key for anti-annoyance tracking
 *   test  — returns true when this nudge applies
 *   text  — display text
 *   style — ANSI style string
 */
const NUDGES = [
  {
    id: 'compact',
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 75,
    text: '\u{1F4A1} /compact',
    style: 'bold yellow',
  },
  {
    id: 'commit',
    test: (d) => (d?.cost?.total_lines_added ?? 0) >= 100,
    text: '\u{1F4A1} commit?',
    style: 'yellow',
  },
  {
    id: 'break',
    test: (d) => (d?.cost?.total_duration_ms ?? 0) >= 5_400_000,
    text: '\u{1F4A1} stretch break?',
    style: 'dim',
  },
  {
    id: 'switch-model',
    test: (d) =>
      (d?.cost?.total_cost_usd ?? 0) >= 10 &&
      (d?.context_window?.used_percentage ?? 0) < 40,
    text: '\u{1F4A1} try Sonnet?',
    style: 'dim',
  },
];

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  if (!cfg.enabled) return null;

  // Find the highest-priority matching nudge
  const nudge = NUDGES.find((n) => n.test(data)) ?? null;

  // Nothing to nudge about — reset state and hide
  if (!nudge) {
    lastNudge = null;
    sameCount = 0;
    return null;
  }

  // Anti-annoyance: track consecutive occurrences of the same nudge
  if (nudge.id === lastNudge) {
    sameCount++;
  } else {
    lastNudge = nudge.id;
    sameCount = 1;
  }

  // Suppress after 5+ consecutive showings — user has seen it
  if (sameCount >= 5) return null;

  const style = cfg.style || nudge.style;
  return { text: nudge.text, style };
}
