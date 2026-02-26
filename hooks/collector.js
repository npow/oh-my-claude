#!/usr/bin/env node

// hooks/collector.js — Claude Code hook handler for oh-my-claude
// Zero dependencies. Node 18+ ESM.
//
// Registered for: PreToolUse, PostToolUse, PostToolUseFailure, PreCompact
// Receives hook JSON on stdin, updates /tmp/omc/<session_id>/state.json atomically.
//
// State schema:
// {
//   "last_tool": { "name": "Bash", "ts": 1708000000 },
//   "tool_count": 42,
//   "error_count": 3,
//   "compacting": false
// }

import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const HOOKS_DIR = '/tmp/omc';

/**
 * Read all of stdin synchronously.
 * @returns {string}
 */
function readStdinSync() {
  try {
    return readFileSync('/dev/stdin', 'utf8');
  } catch {
    return '';
  }
}

/**
 * Read existing state from disk, or return a fresh state object.
 * @param {string} statePath
 * @returns {object}
 */
function loadState(statePath) {
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'));
  } catch {
    return { last_tool: null, tool_count: 0, error_count: 0, compacting: false };
  }
}

/**
 * Write state atomically: write to temp file, then rename.
 * @param {string} statePath
 * @param {object} state
 */
function saveState(statePath, state) {
  const tmpPath = statePath + '.tmp.' + process.pid;
  writeFileSync(tmpPath, JSON.stringify(state), 'utf8');
  renameSync(tmpPath, statePath);
}

function main() {
  const raw = readStdinSync();
  if (!raw.trim()) process.exit(0);

  let hook;
  try {
    hook = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const sessionId = hook.session_id;
  if (!sessionId) process.exit(0);

  const sessionDir = join(HOOKS_DIR, sessionId);
  const statePath = join(sessionDir, 'state.json');

  mkdirSync(sessionDir, { recursive: true });

  const state = loadState(statePath);
  const event = hook.hook_type || hook.event;
  const toolName = hook.tool_name || hook.tool?.name || null;
  const now = Date.now();

  switch (event) {
    case 'PreToolUse':
      if (toolName) {
        state.last_tool = { name: toolName, ts: now };
      }
      break;

    case 'PostToolUse':
      state.tool_count = (state.tool_count || 0) + 1;
      if (toolName) {
        state.last_tool = { name: toolName, ts: now };
      }
      break;

    case 'PostToolUseFailure':
      state.tool_count = (state.tool_count || 0) + 1;
      state.error_count = (state.error_count || 0) + 1;
      if (toolName) {
        state.last_tool = { name: toolName, ts: now };
      }
      break;

    case 'PreCompact':
      state.compacting = true;
      break;

    default:
      break;
  }

  saveState(statePath, state);

  // Hooks must exit 0 to not block Claude Code
  process.exit(0);
}

main();
