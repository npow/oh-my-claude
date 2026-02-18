// src/segments/context-tokens.js — Token usage as "XXk/YYYk"
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-tokens',
  description: 'Shows token usage as used/total (e.g., "84k/200k")',
  requires: [],
  defaultConfig: {
    style: 'dim',
    format: 'short',
  },
};

/**
 * Format a number in short form (e.g., 84000 -> "84k").
 * @param {number} n
 * @returns {string}
 */
function shortFormat(n) {
  if (n >= 1000) {
    return `${Math.round(n / 1000)}k`;
  }
  return String(n);
}

/**
 * Format a number with commas (e.g., 84000 -> "84,000").
 * @param {number} n
 * @returns {string}
 */
function fullFormat(n) {
  return n.toLocaleString('en-US');
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const inputTokens = data?.cost?.total_input_tokens;
  const windowSize = data?.context_window?.context_window_size;

  if (!inputTokens || !windowSize) return null;

  const fmt = cfg.format === 'full' ? fullFormat : shortFormat;
  const text = `${fmt(inputTokens)}/${fmt(windowSize)}`;

  return { text, style: cfg.style };
}
