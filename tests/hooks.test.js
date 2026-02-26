import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// We need to import the function under test
import { readHooksState } from '../src/hooks.js';

const TEST_DIR = '/tmp/omc/test-session-hooks';

describe('readHooksState', () => {
  before(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  after(() => {
    try { rmSync(TEST_DIR, { recursive: true }); } catch {}
  });

  it('returns null for missing session ID', () => {
    assert.equal(readHooksState(null), null);
    assert.equal(readHooksState(undefined), null);
    assert.equal(readHooksState(''), null);
  });

  it('returns null for non-existent session directory', () => {
    assert.equal(readHooksState('nonexistent-session-12345'), null);
  });

  it('reads valid state file', () => {
    const state = {
      last_tool: { name: 'Bash', ts: Date.now() },
      tool_count: 5,
      error_count: 1,
      compacting: false,
    };
    writeFileSync(join(TEST_DIR, 'state.json'), JSON.stringify(state), 'utf8');

    const result = readHooksState('test-session-hooks');
    assert.deepEqual(result, state);
  });

  it('returns null for stale state file', async () => {
    const state = { last_tool: null, tool_count: 0, error_count: 0, compacting: false };
    writeFileSync(join(TEST_DIR, 'state.json'), JSON.stringify(state), 'utf8');

    // Wait a small amount then use maxAgeMs=1 to ensure file is stale
    await new Promise((r) => setTimeout(r, 10));
    const result = readHooksState('test-session-hooks', 1);
    assert.equal(result, null);
  });

  it('returns null for invalid JSON in state file', () => {
    writeFileSync(join(TEST_DIR, 'state.json'), 'not valid json', 'utf8');

    const result = readHooksState('test-session-hooks');
    assert.equal(result, null);
  });
});
