// src/plugins/day-progress.js — Workday progress bar
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'day-progress',
  description: 'Shows workday progress as a bar (9am-5pm)',
  requires: [],
  defaultConfig: {
    style: 'dim',
    startHour: 9,
    endHour: 17,
    width: 10,
    charFilled: '\u2593',
    charEmpty: '\u2591',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;

  if (hour < cfg.startHour || hour >= cfg.endHour) return null;

  const totalHours = cfg.endHour - cfg.startHour;
  const elapsed = hour - cfg.startHour;
  const pct = Math.min(1, elapsed / totalHours);

  const filled = Math.round(pct * cfg.width);
  const empty = cfg.width - filled;
  const bar = cfg.charFilled.repeat(filled) + cfg.charEmpty.repeat(empty);

  return { text: bar, style: cfg.style };
}
