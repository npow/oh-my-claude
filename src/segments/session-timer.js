// src/segments/session-timer.js — Session duration display
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'session-timer',
  description: 'Shows session duration in human-readable format',
  requires: [],
  defaultConfig: {
    style: 'dim',
    icon: false,
  },
};

/**
 * Format milliseconds into a human-readable duration.
 *   >= 1 hour:  "Xh Ym"
 *   >= 1 minute: "Xm Ys"
 *   < 1 minute:  "Xs"
 *
 * @param {number} ms - Duration in milliseconds
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms;
  if (!durationMs) return null;

  const display = formatDuration(durationMs);
  const text = cfg.icon ? `\uF017 ${display}` : display;

  return { text, style: cfg.style };
}
