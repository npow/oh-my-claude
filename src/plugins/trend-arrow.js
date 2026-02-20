// src/plugins/trend-arrow.js — Up/down/flat arrow for context usage
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'trend-arrow',
  description: 'Shows an arrow indicating context usage trend direction',
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
