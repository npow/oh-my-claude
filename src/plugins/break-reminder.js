// src/plugins/break-reminder.js — Reminder to take a break
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'break-reminder',
  description: 'Shows a break reminder after a configurable interval',
  requires: [],
  defaultConfig: {
    style: 'bold yellow',
    intervalMins: 60,
    message: 'take a break',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms;
  if (durationMs == null) return null;

  const mins = durationMs / 60000;
  if (mins < cfg.intervalMins) return null;

  return { text: cfg.message, style: cfg.style };
}
