// src/plugins/date-display.js — Current date
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'date-display',
  description: 'Shows the current date',
  requires: [],
  defaultConfig: {
    style: 'dim',
    format: 'short',
  },
};

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const now = new Date();

  let text;
  if (cfg.format === 'iso') {
    text = now.toISOString().slice(0, 10);
  } else if (cfg.format === 'day') {
    text = `${DAYS_SHORT[now.getDay()]} ${MONTHS_SHORT[now.getMonth()]} ${now.getDate()}`;
  } else {
    text = `${MONTHS_SHORT[now.getMonth()]} ${now.getDate()}`;
  }

  return { text, style: cfg.style };
}
