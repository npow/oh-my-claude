// src/segments/separator-pipe.js — Pipe separator between segments
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'separator-pipe',
  description: 'Renders a vertical pipe separator character',
  requires: [],
  defaultConfig: {
    style: 'dim',
    char: '\u2502',
  },
};

/**
 * @param {object} _data - Parsed stdin JSON from Claude Code (unused)
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(_data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  return { text: cfg.char, style: cfg.style };
}
