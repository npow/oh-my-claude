# oh-my-claude

A statusline framework for Claude Code -- like oh-my-zsh but for Claude Code's `--statusline` feature.

## Golden Rules

1. Every plugin MUST export `meta` (object) and `render` (function). No exceptions.
2. `render()` MUST return `{ text, style }` or `null`. Null means "hide this plugin."
3. Plugins MUST handle missing/undefined data fields gracefully. Never crash the statusline.
4. Git and system plugins MUST use the cache layer (`src/cache.js`) for shell commands.
5. Themes are JSON files in `themes/`. They declare left/right plugin layout per line.
6. Zero npm dependencies. Node 18+ built-ins only. No exceptions.

## File Structure

```
bin/omc.js              CLI entry point (installs/configures statusline)
src/
  runner.js             Main pipeline: stdin -> render -> stdout
  config.js             Theme + user config resolution
  compositor.js         Multi-line left/right alignment and output
  color.js              Style string -> ANSI escape code parser
  cache.js              TTL cache for shell command results
  plugins/              Built-in plugins (one file per plugin)
    model.js            Model name/id display
    context.js          Context window usage
    cost.js             Session cost in USD
    ...
themes/
  default.json          Ships with the framework
tests/
  fixtures/             Sample stdin JSON for testing
  *.test.js             Node test runner tests
scripts/
  validate.js           Validates all plugins export correct shape
docs/                   Deep documentation (see below)
```

## Documentation Index

| Doc | What it covers |
|-----|----------------|
| [docs/plugin-contract.md](docs/plugin-contract.md) | Full plugin API: meta, render, data fields, return values |
| [docs/architecture.md](docs/architecture.md) | Pipeline, caching, config resolution, compositor |
| [docs/theme-format.md](docs/theme-format.md) | Theme JSON schema and how themes are loaded |

## Plugin Contract (Quick Reference)

```js
// src/plugins/example.js
export const meta = {
  name: "example",
  description: "One-line description",
  requires: [],           // e.g. ["git"] for external deps
  defaultConfig: {}       // plugin-specific defaults
};

export function render(data, config) {
  const value = data?.some?.field;
  if (value == null) return null;   // hide when no data
  return { text: `${value}`, style: "bold cyan" };
}
```

Three rules: export `meta`, export `render`, return `{ text, style }` or `null`.

Full spec: [docs/plugin-contract.md](docs/plugin-contract.md)

## Data Fields (stdin JSON)

The `data` object passed to `render()` comes directly from Claude Code. Key paths:

- `model.display_name`, `model.id`
- `context_window.used_percentage`, `context_window.context_window_size`
- `context_window.total_input_tokens`, `context_window.total_output_tokens`
- `cost.total_cost_usd`, `cost.total_duration_ms`, `cost.total_api_duration_ms`
- `cost.total_lines_added`, `cost.total_lines_removed`
- `workspace.current_dir`, `workspace.project_dir`
- `session_id`, `transcript_path`, `version`
- `output_style.name`, `vim.mode`, `agent.name`
- `exceeds_200k_tokens`

Full reference: [docs/plugin-contract.md](docs/plugin-contract.md)

## Testing

```bash
# Run all tests
npm test

# Validate every plugin exports correct shape
npm run validate

# Manual smoke test with sample data
npm start
```

When adding a plugin, also add a test in `tests/` covering: normal data, null fields, and edge cases.

## Style Strings

Space-separated tokens: `"bold cyan"`, `"bg:red white"`, `"dim yellow"`.
Parsed by `src/color.js`. See [docs/plugin-contract.md](docs/plugin-contract.md) for full list.
