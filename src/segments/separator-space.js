// src/segments/separator-space.js — Space separator for visual breathing room
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'separator-space',
  description: 'Renders whitespace for visual separation between segments',
  requires: [],
  defaultConfig: {
    style: '',
    width: 1,
  },
};

/**
 * @param {object} _data - Parsed stdin JSON from Claude Code (unused)
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(_data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  return { text: ' '.repeat(cfg.width), style: '' };
}
