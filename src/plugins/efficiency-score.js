// src/plugins/efficiency-score.js — Lines added per API minute
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'efficiency-score',
  description: 'Shows lines of code added per minute of API time',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const lines = data?.cost?.total_lines_added;
  const apiMs = data?.cost?.total_api_duration_ms;
  if (!lines || !apiMs) return null;

  const apiMins = apiMs / 60000;
  if (apiMins < 0.5) return null;

  const rate = Math.round(lines / apiMins);

  return { text: `${rate} L/m`, style: cfg.style };
}
