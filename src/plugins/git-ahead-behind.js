// src/plugins/git-ahead-behind.js — Commits ahead/behind remote
// Zero dependencies. Node 18+ ESM.

import { cachedExec } from '../cache.js';

export const meta = {
  name: 'git-ahead-behind',
  description: 'Shows commits ahead/behind the remote tracking branch',
  requires: ['git'],
  defaultConfig: {
    style: 'cyan',
    hideIfSynced: true,
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const output = cachedExec(
    'git-ahead-behind',
    'git rev-list --left-right --count HEAD...@{upstream} 2>/dev/null',
    5000
  );
  if (!output) return null;

  const parts = output.trim().split(/\s+/);
  if (parts.length < 2) return null;

  const ahead = parseInt(parts[0], 10) || 0;
  const behind = parseInt(parts[1], 10) || 0;

  if (cfg.hideIfSynced && ahead === 0 && behind === 0) return null;

  const segments = [];
  if (ahead > 0) segments.push(`\u2191${ahead}`);
  if (behind > 0) segments.push(`\u2193${behind}`);

  return { text: segments.join(' ') || 'synced', style: cfg.style };
}
