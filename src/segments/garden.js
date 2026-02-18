// src/segments/garden.js — ASCII plants that grow as you code
// Zero dependencies. Node 18+ ESM.
//
// Growth stages (based on total_lines_added):
//   0 lines:    (.)  — seed          dim
//   1-49:       (,)  — sprouting     dim
//   50-99:      (Y)  — seedling      green
//   100-199:    (🌱) — small plant   green
//   200-349:    (🌿) — growing       bold green
//   350-499:    (🌻) — flowering     bold yellow
//   500+:       (🌳) — full tree     bold green
//
// Override: context >= 95% → (🥀) wilted, red

const STAGES = [
  { min: 500, text: '(🌳)', style: 'bold green' },
  { min: 350, text: '(🌻)', style: 'bold yellow' },
  { min: 200, text: '(🌿)', style: 'bold green' },
  { min: 100, text: '(🌱)', style: 'green' },
  { min: 50,  text: '(Y)',  style: 'green' },
  { min: 1,   text: '(,)',  style: 'dim' },
  { min: 0,   text: '(.)',  style: 'dim' },
];

const WILTED = { text: '(🥀)', style: 'red' };

export const meta = {
  name: 'garden',
  description: 'ASCII plants that grow with each 50 lines of code added',
  requires: [],
  defaultConfig: {
    style: '',
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const contextPct = data?.context_window?.used_percentage ?? 0;

  // Context >= 95% overrides everything — plant is wilted
  if (contextPct >= 95) {
    return { text: WILTED.text, style: cfg.style || WILTED.style };
  }

  const linesAdded = data?.cost?.total_lines_added ?? 0;

  // Find the first stage whose minimum is met (sorted highest-first)
  const stage = STAGES.find((s) => linesAdded >= s.min) ?? STAGES[STAGES.length - 1];

  return { text: stage.text, style: cfg.style || stage.style };
}
