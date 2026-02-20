// src/plugins/loading-spinner.js — Animated spinner
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'loading-spinner',
  description: 'Shows a rotating spinner animation',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    frames: 'dots',
  },
};

const SPINNERS = {
  dots: ['\u280B', '\u2819', '\u2839', '\u2838', '\u283C', '\u2834', '\u2826', '\u2827', '\u2807', '\u280F'],
  line: ['|', '/', '-', '\\'],
  bounce: ['\u2801', '\u2802', '\u2804', '\u2840', '\u2880', '\u2820', '\u2810', '\u2808'],
  moon: ['\u{1F311}', '\u{1F312}', '\u{1F313}', '\u{1F314}', '\u{1F315}', '\u{1F316}', '\u{1F317}', '\u{1F318}'],
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const frames = SPINNERS[cfg.frames] || SPINNERS.dots;
  const durationMs = data?.cost?.total_duration_ms || Date.now();
  const idx = Math.floor(durationMs / 200) % frames.length;

  return { text: frames[idx], style: cfg.style };
}
