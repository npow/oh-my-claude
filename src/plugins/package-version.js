// src/plugins/package-version.js — Version from package.json
// Zero dependencies. Node 18+ ESM.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const meta = {
  name: 'package-version',
  description: 'Shows the version from package.json in the current project',
  requires: [],
  defaultConfig: {
    style: 'dim',
    prefix: 'v',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const dir = data?.workspace?.project_dir || data?.workspace?.current_dir;
  if (!dir) return null;

  try {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    if (!pkg.version) return null;
    return { text: `${cfg.prefix}${pkg.version}`, style: cfg.style };
  } catch {
    return null;
  }
}
