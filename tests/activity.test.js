import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { meta, render } from '../src/plugins/activity.js';

describe('activity plugin', () => {
  describe('meta', () => {
    it('has correct name', () => {
      assert.equal(meta.name, 'activity');
    });

    it('has description', () => {
      assert.ok(meta.description);
    });

    it('has defaultConfig with stale_after_ms', () => {
      assert.equal(typeof meta.defaultConfig.stale_after_ms, 'number');
    });
  });

  describe('render', () => {
    it('returns tool label when hooks data is fresh', () => {
      const data = {
        _hooks: {
          last_tool: { name: 'Edit', ts: Date.now() },
          tool_count: 10,
          error_count: 0,
          compacting: false,
        },
      };
      const result = render(data, {});
      assert.ok(result);
      assert.equal(result.text, 'Editing...');
      assert.equal(result.style, 'dim');
    });

    it('returns friendly label for Bash', () => {
      const data = {
        _hooks: { last_tool: { name: 'Bash', ts: Date.now() } },
      };
      assert.equal(render(data, {}).text, 'Running...');
    });

    it('returns friendly label for Grep', () => {
      const data = {
        _hooks: { last_tool: { name: 'Grep', ts: Date.now() } },
      };
      assert.equal(render(data, {}).text, 'Searching...');
    });

    it('returns fallback label for unknown tool', () => {
      const data = {
        _hooks: { last_tool: { name: 'CustomTool', ts: Date.now() } },
      };
      assert.equal(render(data, {}).text, 'CustomTool...');
    });

    it('returns null when hooks data is null', () => {
      assert.equal(render({ _hooks: null }, {}), null);
    });

    it('returns null when _hooks is missing', () => {
      assert.equal(render({}, {}), null);
    });

    it('returns null for null data', () => {
      assert.equal(render(null, {}), null);
    });

    it('returns null when last_tool is stale', () => {
      const data = {
        _hooks: {
          last_tool: { name: 'Bash', ts: Date.now() - 20000 },
        },
      };
      const result = render(data, { stale_after_ms: 10000 });
      assert.equal(result, null);
    });

    it('returns null when last_tool has no name', () => {
      const data = {
        _hooks: { last_tool: { ts: Date.now() } },
      };
      assert.equal(render(data, {}), null);
    });

    it('returns null when last_tool has no ts', () => {
      const data = {
        _hooks: { last_tool: { name: 'Bash' } },
      };
      assert.equal(render(data, {}), null);
    });

    it('respects custom stale_after_ms config', () => {
      const data = {
        _hooks: {
          last_tool: { name: 'Bash', ts: Date.now() - 3000 },
        },
      };
      // Default 10000ms — should still show
      assert.ok(render(data, {}));
      // Custom 2000ms — should be stale
      assert.equal(render(data, { stale_after_ms: 2000 }), null);
    });

    it('respects custom style config', () => {
      const data = {
        _hooks: { last_tool: { name: 'Read', ts: Date.now() } },
      };
      const result = render(data, { style: 'bold yellow' });
      assert.equal(result.style, 'bold yellow');
    });
  });
});
