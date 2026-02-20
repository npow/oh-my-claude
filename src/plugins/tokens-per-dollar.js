// src/plugins/tokens-per-dollar.js — Token efficiency metric
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'tokens-per-dollar',
  description: 'Shows how many tokens you get per dollar spent',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cost = data?.cost?.total_cost_usd;
  const input = data?.context_window?.total_input_tokens;
  const output = data?.context_window?.total_output_tokens;
  if (!cost || input == null || output == null) return null;

  const total = input + output;
  const perDollar = total / cost;
  const label = perDollar >= 1000 ? `${Math.round(perDollar / 1000)}k` : `${Math.round(perDollar)}`;

  return { text: `${label} tok/$`, style: cfg.style };
}
