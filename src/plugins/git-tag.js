// src/plugins/git-tag.js — Current or nearest git tag
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-tag',
  description: 'Shows the current or nearest git tag',
  requires: ['git'],
  defaultConfig: {
    style: 'yellow',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const tag = cachedExec('git-tag', 'git describe --tags --abbrev=0 2>/dev/null', 10000);
  if (!tag) return null;

  return { text: tag.trim(), style: cfg.style };
}
