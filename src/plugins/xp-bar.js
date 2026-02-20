// src/plugins/xp-bar.js — Experience points progress bar
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'xp-bar',
  description: 'Shows an XP progress bar based on lines and cost',
  requires: [],
  defaultConfig: {
    style: 'magenta',
    width: 8,
    charFilled: '\u2588',
    charEmpty: '\u2591',
    xpPerLine: 10,
    xpPerDollar: 50,
    xpPerLevel: 500,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lines = data?.cost?.total_lines_added || 0;
  const cost = data?.cost?.total_cost_usd || 0;
  if (lines === 0 && cost === 0) return null;

  const xp = Math.round(lines * cfg.xpPerLine + cost * cfg.xpPerDollar);
  const level = Math.floor(xp / cfg.xpPerLevel) + 1;
  const xpInLevel = xp % cfg.xpPerLevel;
  const pct = xpInLevel / cfg.xpPerLevel;

  const filled = Math.round(pct * cfg.width);
  const bar = cfg.charFilled.repeat(filled) + cfg.charEmpty.repeat(cfg.width - filled);

  return { text: `Lv${level} ${bar} ${xpInLevel}xp`, style: cfg.style };
}
