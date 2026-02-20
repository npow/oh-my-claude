// src/plugins/compliment.js — Random developer compliment
// Zero dependencies. Node 18+ ESM.

export const meta = {
  name: 'compliment',
  description: 'Shows a rotating developer compliment',
  requires: [],
  defaultConfig: {
    style: 'green italic',
  },
};

const COMPLIMENTS = [
  'Your code is chef\'s kiss',
  'You type with the fury of a thousand suns',
  'Bug-free legend in the making',
  'Clean commits, cleaner conscience',
  'The codebase is lucky to have you',
  'You debug with style and grace',
  'Impeccable variable naming today',
  'Your git history is a work of art',
  'You ship features like FedEx',
  'Stack Overflow would be proud',
  'Your refactoring sparks joy',
  'The tests pass because they fear you',
  'Masterful use of optional chaining',
  'You make async/await look easy',
  'Your PR reviews are legendary',
];

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const durationMs = data?.cost?.total_duration_ms || 0;
  const idx = Math.floor(durationMs / 180000) % COMPLIMENTS.length;

  return { text: COMPLIMENTS[idx], style: cfg.style };
}
