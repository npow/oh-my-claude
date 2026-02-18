// src/segments/stock-ticker.js — Session cost displayed as a stock ticker
// Zero dependencies. Node 18+ ESM.
//
// Treats the running session cost as a stock price and tracks the rate of
// change across renders. Cost only ever increases, so the interesting signal
// is whether spending is accelerating or decelerating.
//
//   Accelerating (delta > lastDelta):  $OMC ▲▲ $4.56   bold red
//   Steady/decelerating (delta > 0):   $OMC ▲  $4.56   yellow
//   No change (delta == 0):            $OMC ─  $4.56   dim
//   First render (no history):         $OMC $4.56       dim

/** @type {number|null} Cost from the previous render call. */
let lastCost = null;

/** @type {number|null} Delta from the previous render cycle (for acceleration detection). */
let lastDelta = null;

export const meta = {
  name: 'stock-ticker',
  description: 'Session cost displayed as a stock price with rate-of-change indicator',
  requires: [],
  defaultConfig: {
    style: '',
    symbol: 'OMC',
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

  const ticker = `$${cfg.symbol}`;
  const price = `$${cost.toFixed(2)}`;

  // First render — no history yet
  if (lastCost == null) {
    lastCost = cost;
    return { text: `${ticker} ${price}`, style: cfg.style || 'dim' };
  }

  const delta = cost - lastCost;
  const prevDelta = lastDelta;

  // Update module-level state for next render
  lastDelta = delta;
  lastCost = cost;

  // No change
  if (delta === 0) {
    return { text: `${ticker} \u2500 ${price}`, style: cfg.style || 'dim' };
  }

  // Cost increased — determine if accelerating or decelerating
  // Accelerating: current delta exceeds previous delta (and we have a previous delta to compare)
  const accelerating = prevDelta != null && delta > prevDelta;

  if (accelerating) {
    return { text: `${ticker} \u25B2\u25B2 ${price}`, style: cfg.style || 'bold red' };
  }

  // Steady or decelerating spend
  return { text: `${ticker} \u25B2 ${price}`, style: cfg.style || 'yellow' };
}
