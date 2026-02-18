// src/segments/cost-budget.js — Cost vs budget display
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'cost-budget',
  description: 'Shows current cost vs budget (e.g., "$3.50/$10.00")',
  requires: [],
  defaultConfig: {
    style: 'white',
    budget: 10.0,
    precision: 2,
    warnAt: 0.8,
    styleWarn: 'yellow',
    styleCritical: 'red',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}|null}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cost = data?.cost?.total_cost_usd;
  if (cost == null) return null;

  const ratio = cost / cfg.budget;

  let style;
  if (ratio >= 1.0) {
    style = cfg.styleCritical;
  } else if (ratio >= cfg.warnAt) {
    style = cfg.styleWarn;
  } else {
    style = cfg.style;
  }

  const text = `$${cost.toFixed(cfg.precision)}/$${cfg.budget.toFixed(cfg.precision)}`;

  return { text, style };
}
