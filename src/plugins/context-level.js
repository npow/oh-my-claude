// src/plugins/context-level.js — Arrow indicator for context usage level
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'context-level',
  description: 'Shows an arrow indicating context usage level (low/medium/high)',
  requires: [],
  defaultConfig: {
    style: 'dim',
    lowThreshold: 30,
    highThreshold: 70,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;

  let arrow, style;
  if (pct >= cfg.highThreshold) {
    arrow = '\u2191\u2191';
    style = 'bold red';
  } else if (pct >= cfg.lowThreshold) {
    arrow = '\u2191';
    style = 'yellow';
  } else {
    arrow = '\u2192';
    style = cfg.style;
  }

  return { text: arrow, style };
}
