// src/plugins/pomodoro.js — Pomodoro-style countdown based on session time
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'pomodoro',
  description: 'Shows a pomodoro timer based on session duration',
  requires: [],
  defaultConfig: {
    style: 'green',
    styleBreak: 'bold cyan',
    workMins: 25,
    breakMins: 5,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms;
  if (durationMs == null) return null;

  const totalMins = durationMs / 60000;
  const cycleMins = cfg.workMins + cfg.breakMins;
  const inCycle = totalMins % cycleMins;

  if (inCycle < cfg.workMins) {
    const remaining = Math.ceil(cfg.workMins - inCycle);
    return { text: `\u{1F345} ${remaining}m`, style: cfg.style };
  } else {
    const remaining = Math.ceil(cycleMins - inCycle);
    return { text: `\u2615 break ${remaining}m`, style: cfg.styleBreak };
  }
}
