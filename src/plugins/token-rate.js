// src/plugins/token-rate.js — Tokens consumed per minute
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'token-rate',
  description: 'Shows token consumption rate per minute',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const input = data?.context_window?.total_input_tokens;
  const output = data?.context_window?.total_output_tokens;
  const durationMs = data?.cost?.total_duration_ms;
  if (input == null || output == null || !durationMs) return null;

  const totalTokens = input + output;
  const mins = durationMs / 60000;
  if (mins < 0.5) return null;

  const rate = Math.round(totalTokens / mins);
  const label = rate >= 1000 ? `${(rate / 1000).toFixed(1)}k` : `${rate}`;

  return { text: `${label} tok/m`, style: cfg.style };
}
