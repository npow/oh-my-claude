// src/plugins/year-progress.js — Year progress percentage
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'year-progress',
  description: 'Shows how far through the year we are',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  const pct = ((now - start) / (end - start)) * 100;

  return { text: `${Math.round(pct)}% of ${now.getFullYear()}`, style: cfg.style };
}
