// src/plugins/lines-sparkline.js — Lines changed as sparkline bar
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'lines-sparkline',
  description: 'Shows lines changed as a sparkline-style bar',
  requires: [],
  defaultConfig: {
    style: 'green',
    maxScale: 500,
  },
};

const BARS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const added = data?.cost?.total_lines_added;
  const removed = data?.cost?.total_lines_removed;
  if (added == null && removed == null) return null;

  const total = (added || 0) + (removed || 0);
  if (total === 0) return null;

  const level = Math.min(1, total / cfg.maxScale);
  const idx = Math.min(BARS.length - 1, Math.floor(level * BARS.length));

  return { text: `${BARS[idx]} ${total}L`, style: cfg.style };
}
