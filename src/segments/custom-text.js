// src/segments/custom-text.js — User-configurable static text segment
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'custom-text',
  description: 'Shows a user-configurable static text string',
  requires: [],
  defaultConfig: {
    style: 'dim',
    text: '',
  },
};

/**
 * @param {object} _data - Parsed stdin JSON from Claude Code (unused)
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(_data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  if (!cfg.text) return null;

  return { text: cfg.text, style: cfg.style };
}
