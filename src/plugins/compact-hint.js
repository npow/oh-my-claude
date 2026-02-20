// src/plugins/compact-hint.js — Suggests /compact when context is high
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'compact-hint',
  description: 'Shows /compact suggestion when context usage is high',
  requires: [],
  defaultConfig: {
    threshold: 70,
    style: 'bold yellow',
    message: '/compact',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null || pct < cfg.threshold) return null;

  return { text: cfg.message, style: cfg.style };
}
