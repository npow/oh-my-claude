// src/plugins/input-output-ratio.js — Input:output token ratio
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'input-output-ratio',
  description: 'Shows the ratio of input to output tokens',
  requires: [],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const input = data?.context_window?.total_input_tokens;
  const output = data?.context_window?.total_output_tokens;
  if (input == null || output == null || output === 0) return null;

  const ratio = (input / output).toFixed(1);

  return { text: `${ratio}:1 i/o`, style: cfg.style };
}
