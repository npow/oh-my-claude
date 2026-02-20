// src/plugins/countdown.js — Days until a target date
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'countdown',
  description: 'Shows days remaining until a target date',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    target: '',
    label: '',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  if (!cfg.target) return null;

  const target = new Date(cfg.target);
  if (isNaN(target.getTime())) return null;

  const now = new Date();
  const diffMs = target - now;

  if (diffMs <= 0) return { text: `${cfg.label || cfg.target} TODAY`, style: 'bold green' };

  const days = Math.ceil(diffMs / 86400000);
  const label = cfg.label || cfg.target;

  if (days === 1) return { text: `${label} tomorrow`, style: cfg.style };
  return { text: `${label} in ${days}d`, style: cfg.style };
}
