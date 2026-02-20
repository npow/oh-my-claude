// src/plugins/combo-meter.js — Activity intensity gauge
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'combo-meter',
  description: 'Shows session intensity as a combo multiplier',
  requires: [],
  defaultConfig: {
    style: 'yellow',
    styleFire: 'bold red',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lines = data?.cost?.total_lines_added || 0;
  const apiMs = data?.cost?.total_api_duration_ms;
  const totalMs = data?.cost?.total_duration_ms;
  if (!apiMs || !totalMs) return null;

  // Intensity = how much of the session is active API use
  const apiRatio = apiMs / totalMs;
  // Productivity = lines per minute of API time
  const apiMins = apiMs / 60000;
  const lpm = apiMins > 0 ? lines / apiMins : 0;

  let combo;
  if (apiRatio > 0.5 && lpm > 30) combo = 'x5 GODLIKE';
  else if (apiRatio > 0.4 && lpm > 20) combo = 'x4 ULTRA';
  else if (apiRatio > 0.3 && lpm > 10) combo = 'x3 SUPER';
  else if (apiRatio > 0.2 && lpm > 5) combo = 'x2 NICE';
  else combo = 'x1';

  if (combo === 'x1') return null;

  const style = combo.includes('GODLIKE') || combo.includes('ULTRA') ? cfg.styleFire : cfg.style;
  return { text: combo, style };
}
