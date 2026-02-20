// src/plugins/week-progress.js — Day of workweek progress
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'week-progress',
  description: 'Shows workweek progress (Mon-Fri)',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DOTS = ['\u2591', '\u2593'];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();
  const dow = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  if (dow === 0 || dow === 6) return null; // weekend

  const idx = dow - 1; // 0=Mon .. 4=Fri
  const bar = DAYS.map((d, i) => i <= idx ? DOTS[1] : DOTS[0]).join('');

  return { text: `${DAYS[idx]} ${bar}`, style: cfg.style };
}
