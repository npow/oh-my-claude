// src/plugins/context-eta.js — Estimated time until context window is full
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-eta',
  description: 'Estimates time until context window is full at current rate',
  requires: [],
  defaultConfig: {
    style: 'dim',
    hideBelow: 10,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  const durationMs = data?.cost?.total_duration_ms;
  if (pct == null || !durationMs || pct < cfg.hideBelow) return null;

  const remaining = 100 - pct;
  if (remaining <= 0) return { text: 'full', style: 'bold red' };

  const msPerPct = durationMs / pct;
  const etaMs = msPerPct * remaining;

  const mins = Math.round(etaMs / 60000);
  if (mins < 1) return { text: 'ETA <1m', style: cfg.style };
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return { text: `ETA ${hrs}h ${rem}m`, style: cfg.style };
  }

  return { text: `ETA ${mins}m`, style: cfg.style };
}
