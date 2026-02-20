// src/plugins/idle-timer.js — Time spent not waiting on API
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'idle-timer',
  description: 'Shows time spent thinking (not waiting on API)',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const totalMs = data?.cost?.total_duration_ms;
  const apiMs = data?.cost?.total_api_duration_ms;
  if (totalMs == null || apiMs == null) return null;

  const idleMs = Math.max(0, totalMs - apiMs);
  const mins = Math.floor(idleMs / 60000);
  const secs = Math.floor((idleMs % 60000) / 1000);

  return { text: `idle ${mins}m ${secs}s`, style: cfg.style };
}
