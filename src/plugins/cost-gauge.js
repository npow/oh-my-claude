// src/plugins/cost-gauge.js — Cost level as a bar character
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'cost-gauge',
  description: 'Shows session cost with a visual level gauge',
  requires: [],
  defaultConfig: {
    style: 'green',
    styleWarn: 'yellow',
    styleCritical: 'bold red',
    warnAt: 5,
    criticalAt: 15,
    maxScale: 20,
  },
};

const BARS = ['\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cost = data?.cost?.total_cost_usd;
  if (cost == null) return null;

  const level = Math.min(1, cost / cfg.maxScale);
  const idx = Math.min(BARS.length - 1, Math.floor(level * BARS.length));
  const bar = BARS[idx];

  let style = cfg.style;
  if (cost >= cfg.criticalAt) style = cfg.styleCritical;
  else if (cost >= cfg.warnAt) style = cfg.styleWarn;

  return { text: `$${cost.toFixed(2)} ${bar}`, style };
}
