import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COLLECTOR_PATH = join(__dirname, '..', 'hooks', 'collector.js');
const SESSION_ID = 'test-collector-' + process.pid;
const STATE_DIR = join('/tmp/omc', SESSION_ID);
const STATE_PATH = join(STATE_DIR, 'state.json');

function runCollector(hookData) {
  const input = JSON.stringify(hookData);
  execSync(`echo '${input}' | node ${COLLECTOR_PATH}`, {
    encoding: 'utf8',
    timeout: 5000,
  });
}

function readState() {
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

describe('hooks/collector.js', () => {
  before(() => {
    // Clean up any leftover state
    try { rmSync(STATE_DIR, { recursive: true }); } catch {}
  });

  after(() => {
    try { rmSync(STATE_DIR, { recursive: true }); } catch {}
  });

  it('creates state file on first PreToolUse event', () => {
    runCollector({
      session_id: SESSION_ID,
      hook_type: 'PreToolUse',
      tool_name: 'Bash',
    });

    assert.ok(existsSync(STATE_PATH));
    const state = readState();
    assert.equal(state.last_tool.name, 'Bash');
    assert.equal(typeof state.last_tool.ts, 'number');
    assert.equal(state.tool_count, 0);
    assert.equal(state.error_count, 0);
    assert.equal(state.compacting, false);
  });

  it('increments tool_count on PostToolUse', () => {
    runCollector({
      session_id: SESSION_ID,
      hook_type: 'PostToolUse',
      tool_name: 'Edit',
    });

    const state = readState();
    assert.equal(state.last_tool.name, 'Edit');
    assert.equal(state.tool_count, 1);
    assert.equal(state.error_count, 0);
  });

  it('increments error_count on PostToolUseFailure', () => {
    runCollector({
      session_id: SESSION_ID,
      hook_type: 'PostToolUseFailure',
      tool_name: 'Bash',
    });

    const state = readState();
    assert.equal(state.last_tool.name, 'Bash');
    assert.equal(state.tool_count, 2);
    assert.equal(state.error_count, 1);
  });

  it('sets compacting on PreCompact', () => {
    runCollector({
      session_id: SESSION_ID,
      hook_type: 'PreCompact',
    });

    const state = readState();
    assert.equal(state.compacting, true);
  });

  it('exits cleanly with empty stdin', () => {
    // Should not throw
    execSync(`echo '' | node ${COLLECTOR_PATH}`, {
      encoding: 'utf8',
      timeout: 5000,
    });
  });

  it('exits cleanly with invalid JSON', () => {
    execSync(`echo 'not json' | node ${COLLECTOR_PATH}`, {
      encoding: 'utf8',
      timeout: 5000,
    });
  });

  it('exits cleanly without session_id', () => {
    execSync(`echo '{"hook_type":"PreToolUse"}' | node ${COLLECTOR_PATH}`, {
      encoding: 'utf8',
      timeout: 5000,
    });
  });
});
