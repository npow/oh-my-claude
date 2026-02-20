// src/plugins/tamagotchi.js — Virtual pet that reacts to coding session behavior
// Zero dependencies. Node 18+ ESM.
//
// Pet state priority (highest wins):
//   1. Dead       — context > 95%
//   2. Panicking  — context > 80%
//   3. Sweating   — context > 60%
//   4. Rich       — cost > $15
//   5. Sleepy     — api_duration/total_duration > 0.5 AND total_duration > 120s
//   6. Egg        — cost < $0.10 AND duration < 60s
//   7. Excited    — lines_added > 200
//   8. Focused    — lines_added > 50
//   9. Happy      — default

const STATES = {
  dead:      { face: '(x_x) RIP',   style: 'bold red' },
  panicking: { face: '(\u00d7_\u00d7)!!',    style: 'bold yellow' },
  sweating:  { face: '(\u00b0_\u00b0;)',     style: 'yellow' },
  rich:      { face: '($.$)',        style: 'bold magenta' },
  sleepy:    { face: '(-_-) zzZ',    style: 'dim' },
  egg:       { face: '(o)',          style: '' },
  excited:   { face: '(\u2605\u203f\u2605)',       style: '' },
  focused:   { face: '(\u2022_\u2022)',       style: '' },
  happy:     { face: '(^.^)',        style: '' },
};

export const meta = {
  name: 'tamagotchi',
  description: 'A virtual pet that reacts to coding session behavior',
  requires: [],
  defaultConfig: {
    style: '',
    showName: false,
    name: 'Claude',
  },
};

/**
 * Determine the pet state from session metrics.
 * Priority order is enforced by early returns (highest priority first).
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @returns {string} state key from STATES
 */
function resolveState(data) {
  const contextPct = data?.context_window?.used_percentage ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;
  const totalDuration = data?.cost?.total_duration_ms ?? 0;
  const apiDuration = data?.cost?.total_api_duration_ms ?? 0;
  const linesAdded = data?.cost?.total_lines_added ?? 0;

  // 1. Dead — context > 95%
  if (contextPct > 95) return 'dead';

  // 2. Panicking — context > 80%
  if (contextPct > 80) return 'panicking';

  // 3. Sweating — context 60-80%
  if (contextPct > 60) return 'sweating';

  // 4. Rich — cost above critical threshold
  if (cost > 15) return 'rich';

  // 5. Sleepy — API wait dominates AND session is non-trivial
  if (totalDuration > 120_000 && apiDuration / totalDuration > 0.5) return 'sleepy';

  // 6. Egg — brand new session
  if (cost < 0.10 && totalDuration < 60_000) return 'egg';

  // 7. Excited — major code changes
  if (linesAdded > 200) return 'excited';

  // 8. Focused — active coding
  if (linesAdded > 50) return 'focused';

  // 9. Happy — default
  return 'happy';
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const state = resolveState(data);
  const { face, style: stateStyle } = STATES[state];

  const text = cfg.showName ? `${cfg.name} ${face}` : face;
  const style = cfg.style || stateStyle;

  return { text, style };
}
