// src/plugins/api-timer.js — Display cumulative API wait time
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'api-timer',
  description: 'Shows cumulative API duration (total_api_duration_ms)',
  requires: [],
  defaultConfig: {
    style: 'dim',
    label: 'api',
    icon: false,
  },
};

/**
 * Format milliseconds into a human-friendly duration string.
 * Examples: "3s", "1m 24s", "2h 5m"
 *
 * @param {number} ms
 * @returns {string}
 */
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 1) return '0s';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const ms = data?.cost?.total_api_duration_ms;
  if (!ms) return null;

  const duration = formatDuration(ms);
  let text = cfg.label ? `${cfg.label} ${duration}` : duration;
  if (cfg.icon) text = `\u{F0527} ${text}`;

  return { text, style: cfg.style };
}
