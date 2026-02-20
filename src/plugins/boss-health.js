// src/plugins/boss-health.js — Context window as boss HP bar
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'boss-health',
  description: 'Shows context window as a boss HP bar',
  requires: [],
  defaultConfig: {
    width: 12,
    charFilled: '\u2588',
    charEmpty: '\u2591',
    bossName: 'CONTEXT',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const pct = data?.context_window?.used_percentage;
  if (pct == null) return null;

  const remaining = 100 - pct;
  const filled = Math.round((remaining / 100) * cfg.width);
  const bar = cfg.charFilled.repeat(filled) + cfg.charEmpty.repeat(cfg.width - filled);

  let style;
  if (remaining > 60) style = 'green';
  else if (remaining > 30) style = 'yellow';
  else style = 'bold red';

  return { text: `${cfg.bossName} [${bar}] ${Math.round(remaining)}%`, style };
}
