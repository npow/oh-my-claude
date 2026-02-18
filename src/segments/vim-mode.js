// src/segments/vim-mode.js — Display current vim mode
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'vim-mode',
  description: 'Shows the current vim mode (NORMAL/INSERT) when vim is active',
  requires: [],
  defaultConfig: {
    styleNormal: 'bold green',
    styleInsert: 'bold blue',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const mode = data?.vim?.mode;
  if (!mode) return null;

  const upper = mode.toUpperCase();
  const style = upper === 'INSERT' ? cfg.styleInsert : cfg.styleNormal;

  return { text: upper, style };
}
