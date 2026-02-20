// src/plugins/cost-per-line.js — Cost per line of code written
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'cost-per-line',
  description: 'Shows cost per line of code added',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cost = data?.cost?.total_cost_usd;
  const lines = data?.cost?.total_lines_added;
  if (cost == null || !lines) return null;

  const perLine = cost / lines;

  if (perLine < 0.01) return { text: `<1¢/line`, style: cfg.style };
  if (perLine < 1) return { text: `${Math.round(perLine * 100)}¢/line`, style: cfg.style };
  return { text: `$${perLine.toFixed(2)}/line`, style: cfg.style };
}
