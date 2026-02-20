// src/plugins/achievement.js — Unlockable achievement badges for session milestones
// Zero dependencies. Node 18+ ESM.

const ACHIEVEMENTS = [
  { id: 'first-blood', check: d => (d?.cost?.total_lines_added ?? 0) > 0, text: '\u{1F3C6} First Blood', desc: 'first edit' },
  { id: 'centurion', check: d => (d?.cost?.total_lines_added ?? 0) >= 100, text: '\u{1F4AF} Centurion', desc: '100+ lines' },
  { id: 'architect', check: d => (d?.cost?.total_lines_added ?? 0) >= 500, text: '\u{1F3D7}\uFE0F Architect', desc: '500+ lines' },
  { id: 'novelist', check: d => (d?.cost?.total_lines_added ?? 0) >= 1000, text: '\u{1F4D6} Novelist', desc: '1000+ lines' },
  { id: 'marie-kondo', check: d => (d?.cost?.total_lines_removed ?? 0) > (d?.cost?.total_lines_added ?? 0) && (d?.cost?.total_lines_removed ?? 0) > 10, text: '\u{1F9F9} Marie Kondo', desc: 'net negative' },
  { id: 'big-spender', check: d => (d?.cost?.total_cost_usd ?? 0) >= 5, text: '\u{1F4B0} Big Spender', desc: '$5+ session' },
  { id: 'whale', check: d => (d?.cost?.total_cost_usd ?? 0) >= 20, text: '\u{1F40B} Whale', desc: '$20+ session' },
  { id: 'marathon', check: d => (d?.cost?.total_duration_ms ?? 0) >= 3600000, text: '\u{1F3C3} Marathon', desc: '1hr+ session' },
  { id: 'ultramarathon', check: d => (d?.cost?.total_duration_ms ?? 0) >= 7200000, text: '\u{1F3C5} Ultramarathon', desc: '2hr+ session' },
  { id: 'half-full', check: d => (d?.context_window?.used_percentage ?? 0) >= 50, text: '\u23F3 Half Full', desc: '50% context' },
  { id: 'danger-zone', check: d => (d?.context_window?.used_percentage ?? 0) >= 80, text: '\u26A0\uFE0F Danger Zone', desc: '80% context' },
  { id: 'the-brink', check: d => (d?.context_window?.used_percentage ?? 0) >= 95, text: '\u{1F480} The Brink', desc: '95% context' },
];

// Module-level state: tracks which achievements have already been displayed
const shown = new Set();
let currentDisplay = null;
let displayCount = 0;

export const meta = {
  name: 'achievement',
  description: 'Shows achievement badges that unlock based on session milestones',
  requires: [],
  defaultConfig: {
    style: 'bold cyan',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Find the first achievement that is (a) passing its check and (b) not yet shown
  let newUnlock = null;
  for (const achievement of ACHIEVEMENTS) {
    if (!shown.has(achievement.id) && achievement.check(data)) {
      newUnlock = achievement;
      break;
    }
  }

  if (newUnlock) {
    shown.add(newUnlock.id);
    currentDisplay = newUnlock;
    displayCount = 0;
  }

  if (currentDisplay == null) return null;

  displayCount++;

  // After being displayed for 3+ renders, fade away
  if (displayCount > 3) {
    currentDisplay = null;
    displayCount = 0;
    return null;
  }

  return { text: currentDisplay.text, style: cfg.style };
}
