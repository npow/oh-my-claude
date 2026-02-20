// src/plugins/cost-rate.js — Dollars per minute burn rate
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'cost-rate',
  description: 'Shows cost burn rate in dollars per minute',
  requires: [],
  defaultConfig: {
    style: 'dim',
    warnAt: 0.50,
    styleWarn: 'bold yellow',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cost = data?.cost?.total_cost_usd;
  const durationMs = data?.cost?.total_duration_ms;
  if (cost == null || !durationMs) return null;

  const mins = durationMs / 60000;
  if (mins < 0.5) return null;

  const rate = cost / mins;
  const style = rate >= cfg.warnAt ? cfg.styleWarn : cfg.style;

  return { text: `$${rate.toFixed(2)}/m`, style };
}
