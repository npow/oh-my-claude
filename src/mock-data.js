// src/mock-data.js — Canonical mock data for previews, tests, and validation
// Zero dependencies. Node 18+ ESM.

export const MOCK_DATA = {
  model: { id: 'claude-opus-4-6', display_name: 'Opus' },
  context_window: {
    used_percentage: 42.5,
    context_window_size: 200000,
    total_input_tokens: 72000,
    total_output_tokens: 13000,
  },
  cost: {
    total_cost_usd: 4.56,
    total_duration_ms: 750000,
    total_api_duration_ms: 180000,
    total_lines_added: 83,
    total_lines_removed: 21,
  },
  workspace: { current_dir: '/Users/dev/myproject', project_dir: '/Users/dev/myproject' },
  session_id: 'demo-abc123',
  version: '2.1.34',
  _hooks: {
    last_tool: { name: 'Edit', ts: Date.now() },
    tool_count: 42,
    error_count: 3,
    compacting: false,
  },
};
