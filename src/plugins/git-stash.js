// src/plugins/git-stash.js — Git stash count
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-stash',
  description: 'Shows the number of git stashes',
  requires: ['git'],
  defaultConfig: {
    style: 'magenta',
    hideIfZero: true,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const output = cachedExec('git-stash', 'git stash list 2>/dev/null | wc -l', 5000);
  const count = parseInt(output?.trim(), 10) || 0;

  if (cfg.hideIfZero && count === 0) return null;

  return { text: `stash:${count}`, style: cfg.style };
}
