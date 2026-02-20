// src/plugins/git-last-commit.js — Time since last commit
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-last-commit',
  description: 'Shows time since the last git commit',
  requires: ['git'],
  defaultConfig: {
    style: 'dim',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const output = cachedExec('git-last-commit', 'git log -1 --format=%ct 2>/dev/null', 10000);
  if (!output) return null;

  const ts = parseInt(output.trim(), 10);
  if (!ts) return null;

  const diffSec = Math.floor(Date.now() / 1000) - ts;
  if (diffSec < 0) return null;

  let text;
  if (diffSec < 60) text = 'just now';
  else if (diffSec < 3600) text = `${Math.floor(diffSec / 60)}m ago`;
  else if (diffSec < 86400) text = `${Math.floor(diffSec / 3600)}h ago`;
  else text = `${Math.floor(diffSec / 86400)}d ago`;

  return { text, style: cfg.style };
}
