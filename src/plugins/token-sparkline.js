// src/plugins/token-sparkline.js — Tiny ASCII sparkline of context usage over time
// Zero dependencies. Node 18+ ESM.

const BARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/** Module-level history of context usage percentages (persists across renders). */
const history = [];

export const meta = {
  name: 'token-sparkline',
  description: 'ASCII sparkline chart showing context consumption over time',
  requires: [],
  defaultConfig: {
    style: 'green',
    width: 8,
    warnAt: 60,
    criticalAt: 80,
    styleWarn: 'yellow',
    styleCritical: 'red',
  },
};

/**
 * Map a percentage (0–100) to one of the 8 bar characters.
 * Clamps to valid range so out-of-bounds values don't crash.
 *
 * @param {number} pct - A percentage value (0–100)
 * @returns {string} A single sparkline bar character
 */
function barChar(pct) {
  const clamped = Math.max(0, Math.min(100, pct));
  // Each bar covers 12.5% (100 / 8). Index 0–7.
  const index = Math.min(Math.floor(clamped / 12.5), BARS.length - 1);
  return BARS[index];
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;

  // Only record valid numeric percentages
  if (pct != null) {
    history.push(pct);
    // Trim to configured width
    while (history.length > cfg.width) {
      history.shift();
    }
  }

  // Nothing to display if we've never seen data
  if (history.length === 0) return null;

  const text = history.map(barChar).join('');

  // Style is based on the current (latest) percentage
  const latest = history[history.length - 1];
  let style;
  if (latest >= cfg.criticalAt) {
    style = cfg.styleCritical;
  } else if (latest >= cfg.warnAt) {
    style = cfg.styleWarn;
  } else {
    style = cfg.style;
  }

  return { text, style };
}
