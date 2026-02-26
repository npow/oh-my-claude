// src/hooks.js — Read hooks state from disk
// Zero dependencies. Node 18+ ESM.
//
// The hooks collector (hooks/collector.js) writes state to /tmp/omc/<session_id>/state.json.
// This module reads that state for use by plugins like activity.js.

import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const HOOKS_DIR = '/tmp/omc';

/**
 * Read hooks state for a given session.
 *
 * @param {string} sessionId - The Claude Code session ID
 * @param {number} [maxAgeMs=30000] - Ignore state files older than this (default: 30s)
 * @returns {object|null} Parsed state object or null if missing/stale/invalid
 */
export function readHooksState(sessionId, maxAgeMs = 30000) {
  if (!sessionId || typeof sessionId !== 'string') return null;

  const statePath = join(HOOKS_DIR, sessionId, 'state.json');

  try {
    const stat = statSync(statePath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs > maxAgeMs) return null;

    const raw = readFileSync(statePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
