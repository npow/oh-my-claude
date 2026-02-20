// src/plugins/context-remaining.js — Show tokens remaining in context window
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-remaining',
  description: 'Shows tokens remaining in context window',
  requires: [],
  defaultConfig: {
    style: 'white',
    warnAt: 40000,
    criticalAt: 20000,
    styleWarn: 'bold yellow',
    styleCritical: 'bold red',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const size = data?.context_window?.context_window_size;
  const pct = data?.context_window?.used_percentage;
  if (size == null || pct == null) return null;

  const used = Math.round(size * pct / 100);
  const remaining = size - used;

  const label = remaining >= 1000 ? `${Math.round(remaining / 1000)}k` : `${remaining}`;

  let style = cfg.style;
  if (remaining <= cfg.criticalAt) style = cfg.styleCritical;
  else if (remaining <= cfg.warnAt) style = cfg.styleWarn;

  return { text: `${label} left`, style };
}
