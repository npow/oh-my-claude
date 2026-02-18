// src/segments/flex-space.js — Flex-space marker for right-alignment
// Zero dependencies. Node 18+ ESM.
//
// The compositor recognises the magic "__FLEX__" token and replaces it
// with the necessary padding to push subsequent segments to the right.
// For now, the segment simply emits the marker.

export const meta = {
  name: 'flex-space',
  description: 'Emits a marker the compositor uses for right-alignment',
  requires: [],
  defaultConfig: {
    style: '',
  },
};

/**
 * @param {object} _data - Parsed stdin JSON from Claude Code (unused)
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(_data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  return { text: '__FLEX__', style: cfg.style };
}
