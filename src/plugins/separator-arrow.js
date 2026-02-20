// src/plugins/separator-arrow.js — Powerline arrow separator
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'separator-arrow',
  description: 'Renders a powerline right-arrow separator',
  requires: [],
  defaultConfig: {
    style: 'dim',
    char: '\uE0B0',
  },
};

/**
 * @param {object} _data - Parsed stdin JSON from Claude Code (unused)
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(_data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  return { text: cfg.char, style: cfg.style };
}
