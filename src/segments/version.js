// src/segments/version.js — Display Claude Code version
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'version',
  description: 'Shows the Claude Code version string',
  requires: [],
  defaultConfig: {
    style: 'dim',
    prefix: 'v',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const version = data?.version;
  if (!version) return null;

  const text = cfg.prefix ? `${cfg.prefix}${version}` : version;
  return { text, style: cfg.style };
}
