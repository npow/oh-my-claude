// src/segments/model-name.js — Display model name (e.g., "Opus", "Sonnet")
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'model-name',
  description: 'Shows the current model display name',
  requires: [],
  defaultConfig: {
    style: 'bold cyan',
    icon: false,
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const displayName = data?.model?.display_name;
  if (!displayName) return null;

  const text = cfg.icon ? `\u{F09E9} ${displayName}` : displayName;

  return { text, style: cfg.style };
}
