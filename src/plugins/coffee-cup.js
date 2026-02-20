// src/plugins/coffee-cup.js — Coffee cup that drains over a 2-hour session
// Zero dependencies. Node 18+ ESM.
//
// Based on total_duration_ms:
//   < 15min:     [████]        bold
//   15-30min:    [███░]        bold
//   30-45min:    [██░░]        (none)
//   45-60min:    [█░░░]        yellow
//   60-90min:    [░░░░]        dim
//   90min+:      [    ] refill?  bold red

const MIN_15 = 15 * 60 * 1000;
const MIN_30 = 30 * 60 * 1000;
const MIN_45 = 45 * 60 * 1000;
const MIN_60 = 60 * 60 * 1000;
const MIN_90 = 90 * 60 * 1000;

export const meta = {
  name: 'coffee-cup',
  description: 'A coffee cup that drains as the session progresses',
  requires: [],
  defaultConfig: {
    style: '',
    charFull: '\u2588',   // █
    charEmpty: '\u2591',  // ░
  },
};

/**
 * Build the coffee cup display string.
 *
 * @param {number} fullCount - Number of full blocks (0-4)
 * @param {string} charFull - Character for full portion
 * @param {string} charEmpty - Character for empty portion
 * @param {boolean} refill - Whether to append " refill?"
 * @returns {string}
 */
function buildCup(fullCount, charFull, charEmpty, refill) {
  if (refill) {
    return '[    ] refill?';
  }
  const full = charFull.repeat(fullCount);
  const empty = charEmpty.repeat(4 - fullCount);
  return `[${full}${empty}]`;
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms ?? 0;

  let text;
  let levelStyle;

  if (durationMs >= MIN_90) {
    text = buildCup(0, cfg.charFull, cfg.charEmpty, true);
    levelStyle = 'bold red';
  } else if (durationMs >= MIN_60) {
    text = buildCup(0, cfg.charFull, cfg.charEmpty, false);
    levelStyle = 'dim';
  } else if (durationMs >= MIN_45) {
    text = buildCup(1, cfg.charFull, cfg.charEmpty, false);
    levelStyle = 'yellow';
  } else if (durationMs >= MIN_30) {
    text = buildCup(2, cfg.charFull, cfg.charEmpty, false);
    levelStyle = '';
  } else if (durationMs >= MIN_15) {
    text = buildCup(3, cfg.charFull, cfg.charEmpty, false);
    levelStyle = 'bold';
  } else {
    text = buildCup(4, cfg.charFull, cfg.charEmpty, false);
    levelStyle = 'bold';
  }

  return { text, style: cfg.style || levelStyle };
}
