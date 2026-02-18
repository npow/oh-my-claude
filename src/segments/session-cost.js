// src/segments/session-cost.js — Session cost in USD
// Zero dependencies. Node 18+ ESM.
//
// Plan detection: auto-detected from context_window_size when plan is not set.
//   context_window_size >= 1,000,000 → Max plan (1M context = Max only)
//   context_window_size < 1,000,000  → Pro plan
//
// Override via config.json:
//   "plan": "pro"    → warn $3, critical $8   (Pro: ~$20/mo)
//   "plan": "max5"   → warn $10, critical $25  (Max 5x: ~$100/mo)
//   "plan": "max20"  → warn $25, critical $60  (Max 20x: ~$200/mo)
//   "plan": "api"    → warn $5, critical $15   (pay-per-token)
// Or set warnAt/criticalAt directly to override everything.

const PLAN_THRESHOLDS = {
  pro:   { warnAt: 3, criticalAt: 8 },
  max5:  { warnAt: 10, criticalAt: 25 },
  max20: { warnAt: 25, criticalAt: 60 },
  api:   { warnAt: 5, criticalAt: 15 },
};

export const meta = {
  name: 'session-cost',
  description: 'Shows the current session cost in USD',
  requires: [],
  defaultConfig: {
    style: 'dim',
    format: '$',
    precision: 2,
    plan: null,
    warnAt: null,
    criticalAt: null,
    styleWarn: 'bold yellow',
    styleCritical: 'bold red',
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

  // Resolve plan: explicit config > auto-detect from context window size
  let plan = cfg.plan;
  if (!plan) {
    const ctxSize = data?.context_window?.context_window_size;
    plan = (ctxSize && ctxSize >= 1_000_000) ? 'max5' : 'pro';
  }

  // Resolve thresholds: explicit config > plan-based
  const planDefaults = PLAN_THRESHOLDS[plan] || PLAN_THRESHOLDS.pro;
  const warnAt = cfg.warnAt ?? planDefaults.warnAt;
  const criticalAt = cfg.criticalAt ?? planDefaults.criticalAt;

  let style;
  if (cost >= criticalAt) {
    style = cfg.styleCritical;
  } else if (cost >= warnAt) {
    style = cfg.styleWarn;
  } else {
    style = cfg.style;
  }

  const text = `$${cost.toFixed(cfg.precision)}`;
  return { text, style };
}
