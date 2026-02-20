# Plugin Contract

Every plugin is a single ES module file in `src/plugins/`. This document is the authoritative specification for the plugin API.

## Module Shape

A plugin file MUST export exactly two things:

```js
export const meta = { ... };
export function render(data, config) { ... }
```

Nothing else is required. Nothing else is read by the framework.

## `meta` Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | yes | Unique plugin identifier. Must match the filename (e.g., `model.js` exports `name: "model"`). Used in theme files to reference the plugin. |
| `description` | `string` | yes | One-line human-readable description. Shown in `omc list`. |
| `requires` | `string[]` | no | External dependencies this plugin needs. Example: `["git"]`. The framework checks availability at startup and skips plugins whose deps are missing. Defaults to `[]`. |
| `defaultConfig` | `object` | no | Plugin-specific configuration defaults. Merged under the theme's per-plugin config and the user's per-plugin overrides. Defaults to `{}`. |

Example:

```js
export const meta = {
  name: "context",
  description: "Context window usage bar",
  requires: [],
  defaultConfig: {
    warnAt: 80,       // show warning color above this %
    criticalAt: 95    // show critical color above this %
  }
};
```

## `render(data, config)` Function

### Parameters

#### `data`

The JSON object piped from Claude Code on stdin. The framework parses it and passes it to every plugin's `render()`. Fields may be absent or null at any time -- plugins must handle this.

Complete field reference:

| Path | Type | Description |
|------|------|-------------|
| `model.display_name` | `string` | Human-friendly model name (e.g., "Opus") |
| `model.id` | `string` | Model identifier (e.g., "claude-opus-4-6") |
| `context_window.used_percentage` | `number` | Percentage of context window used (0-100) |
| `context_window.context_window_size` | `number` | Total context window size in tokens |
| `context_window.total_input_tokens` | `number` | Total input tokens consumed this session |
| `context_window.total_output_tokens` | `number` | Total output tokens generated this session |
| `context_window.current_usage` | `number` | Current context usage in tokens |
| `cost.total_cost_usd` | `number` | Total session cost in USD |
| `cost.total_duration_ms` | `number` | Total wall-clock session duration in milliseconds |
| `cost.total_api_duration_ms` | `number` | Total time spent in API calls in milliseconds |
| `cost.total_lines_added` | `number` | Lines added across all file edits this session |
| `cost.total_lines_removed` | `number` | Lines removed across all file edits this session |
| `workspace.current_dir` | `string` | Current working directory |
| `workspace.project_dir` | `string` | Project root directory |
| `session_id` | `string` | Unique session identifier |
| `transcript_path` | `string` | Path to the session transcript file |
| `version` | `string` | Claude Code version string |
| `output_style.name` | `string` | Current output style (e.g., "streamlined") |
| `vim.mode` | `string` | Current vim mode if vim keybindings are active |
| `agent.name` | `string` | Agent name if running as a sub-agent |
| `exceeds_200k_tokens` | `boolean` | Whether session has exceeded 200k token threshold |

#### `config`

Plugin-specific configuration object. Resolved by the framework in this order (later wins):

1. `meta.defaultConfig` (from the plugin itself)
2. `theme.plugins["plugin-name"]` (from the active theme file)
3. `userConfig.plugins["plugin-name"]` (from the user's config.json)

The plugin receives the final merged result.

### Return Value

`render()` MUST return one of:

#### `{ text: string, style: string }` -- show the plugin

- `text`: The content to display. Keep it short. No ANSI codes -- the framework applies styling.
- `style`: A space-separated string of style tokens. Examples:
  - `"bold cyan"` -- bold text, cyan foreground
  - `"bg:red white"` -- red background, white foreground
  - `"dim yellow"` -- dim yellow text
  - `"underline green"` -- underlined green text
  - `""` -- no styling (plain text)

Supported style tokens:

| Token | Effect |
|-------|--------|
| `bold` | Bold text |
| `dim` | Dimmed text |
| `italic` | Italic text |
| `underline` | Underlined text |
| `inverse` | Swap foreground/background |
| `hidden` | Hidden text |
| `strikethrough` | Strikethrough text |
| `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white` | Foreground color |
| `bg:black`, `bg:red`, `bg:green`, `bg:yellow`, `bg:blue`, `bg:magenta`, `bg:cyan`, `bg:white` | Background color |

#### `null` -- hide the plugin

Return `null` when the plugin has nothing to show. The framework removes it from the line and adjusts spacing. This is the correct way to conditionally hide a plugin.

## Error Handling

If `render()` throws an exception, the framework catches it and treats the plugin as if it returned `null`. The statusline never crashes because of a plugin error. Errors are silently swallowed -- the statusline is a display layer, not a place for error reporting.

That said, plugins should still handle errors internally. Relying on the framework catch is a last resort, not a design pattern.

### Defensive Access Pattern

Always use optional chaining for data field access:

```js
// Good
const pct = data?.context_window?.used_percentage;
if (pct == null) return null;

// Bad -- will throw if context_window is undefined
const pct = data.context_window.used_percentage;
```

## Performance

`render()` should complete in under 50ms. The framework calls every plugin on every statusline update, so slow plugins degrade the entire experience.

For anything that requires a shell command (git status, system info, etc.), use the cache layer:

```js
import { cachedExec } from "../cache.js";

export function render(data, config) {
  const branch = cachedExec("git-branch", "git rev-parse --abbrev-ref HEAD", 5000);
  if (!branch) return null;
  return { text: branch.trim(), style: "bold magenta" };
}
```

`cachedExec(key, command, ttlMs)` runs the command at most once per TTL window and returns the cached stdout. See [architecture.md](architecture.md) for details.

## Full Example

```js
// src/plugins/cost.js
export const meta = {
  name: "cost",
  description: "Session cost in USD",
  requires: [],
  defaultConfig: {
    warnAt: 5.0,
    precision: 2
  }
};

export function render(data, config) {
  const cost = data?.cost?.total_cost_usd;
  if (cost == null) return null;

  const text = `$${cost.toFixed(config.precision)}`;
  const style = cost >= config.warnAt ? "bold red" : "green";

  return { text, style };
}
```

## Checklist for New Plugins

- [ ] File is in `src/plugins/` and filename matches `meta.name`
- [ ] Exports `meta` object with `name` and `description`
- [ ] Exports `render` function
- [ ] `render` returns `{ text, style }` or `null`
- [ ] All data field access uses optional chaining
- [ ] Shell commands go through `cachedExec`
- [ ] Test file exists in `tests/` covering: normal data, null/missing fields, edge cases
- [ ] Runs in under 50ms
