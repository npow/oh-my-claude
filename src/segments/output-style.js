// src/segments/output-style.js — Display current output style
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'output-style',
  description: 'Shows the active output style name (hidden when "default")',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const name = data?.output_style?.name;
  if (!name || name === 'default') return null;

  return { text: name, style: cfg.style };
}
