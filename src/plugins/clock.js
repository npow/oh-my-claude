// src/plugins/clock.js — Current time
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'clock',
  description: 'Shows the current time',
  requires: [],
  defaultConfig: {
    style: 'dim',
    format24: false,
    showSeconds: false,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');

  let text;
  if (cfg.format24) {
    text = `${String(h).padStart(2, '0')}:${m}`;
  } else {
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    text = `${h}:${m}${ampm}`;
  }

  if (cfg.showSeconds) {
    const s = String(now.getSeconds()).padStart(2, '0');
    text += `:${s}`;
  }

  return { text, style: cfg.style };
}
