// src/segments/lines-changed.js — Display lines added/removed summary
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'lines-changed',
  description: 'Shows "+N -M" summary of lines added and removed',
  requires: [],
  defaultConfig: {
    style: 'dim',
    hideIfZero: true,
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const added = data?.cost?.total_lines_added ?? 0;
  const removed = data?.cost?.total_lines_removed ?? 0;

  if (cfg.hideIfZero && added === 0 && removed === 0) return null;

  const text = `+${added} -${removed}`;
  return { text, style: cfg.style };
}
