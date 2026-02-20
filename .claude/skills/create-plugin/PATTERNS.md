# Plugin Patterns

Data fields, templates, and common patterns for oh-my-claude plugins.

## Data fields available in `render(data, config)`

The `data` object is JSON piped from Claude Code. Every field may be absent — always use optional chaining.

| Path | Type | Example | Description |
|------|------|---------|-------------|
| `data.model.display_name` | string | `"Opus"` | Human-friendly model name |
| `data.model.id` | string | `"claude-opus-4-6"` | Model identifier |
| `data.context_window.used_percentage` | number | `42.5` | Context window usage 0-100 |
| `data.context_window.context_window_size` | number | `200000` | Total context size in tokens |
| `data.context_window.total_input_tokens` | number | `72000` | Input tokens this session |
| `data.context_window.total_output_tokens` | number | `13000` | Output tokens this session |
| `data.cost.total_cost_usd` | number | `4.56` | Session cost in USD |
| `data.cost.total_duration_ms` | number | `750000` | Wall-clock session time |
| `data.cost.total_api_duration_ms` | number | `180000` | Time in API calls |
| `data.cost.total_lines_added` | number | `83` | Lines added this session |
| `data.cost.total_lines_removed` | number | `21` | Lines removed this session |
| `data.workspace.current_dir` | string | `"/Users/dev/myproject"` | Current working directory |
| `data.workspace.project_dir` | string | `"/Users/dev/myproject"` | Project root |
| `data.session_id` | string | `"abc123"` | Unique session ID |
| `data.version` | string | `"2.1.34"` | Claude Code version |
| `data.vim.mode` | string | `"NORMAL"` | Vim mode if active |
| `data.exceeds_200k_tokens` | boolean | `true` | Over 200k token threshold |

## JS plugin template

```js
// ~/.claude/oh-my-claude/plugins/<name>/plugin.js

export const meta = {
  name: '<name>',
  description: 'One-line description',
  requires: [],
  defaultConfig: {
    style: 'cyan',
    // add config keys here
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const value = data?.some?.field;
  if (value == null) return null;

  return { text: `${value}`, style: cfg.style };
}
```

## JS plugin with shell command (cached)

```js
import { cachedExec } from '../../src/cache.js';

export const meta = {
  name: '<name>',
  description: 'Shows output from a shell command',
  requires: [],
  defaultConfig: { style: 'cyan' },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // cachedExec(cacheKey, command, ttlMs)
  // Runs the command at most once per TTL, caches stdout.
  const output = cachedExec('<name>', 'some-command --flag', 5000);
  if (!output) return null;

  return { text: output.trim(), style: cfg.style };
}
```

## JS plugin with thresholds

```js
export const meta = {
  name: '<name>',
  description: 'Shows a value with color thresholds',
  requires: [],
  defaultConfig: {
    style: 'white',
    warnAt: 60,
    criticalAt: 80,
    styleWarn: 'bold yellow',
    styleCritical: 'bold red',
  },
};

export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const value = data?.context_window?.used_percentage;
  if (value == null) return null;

  let style = cfg.style;
  if (value >= cfg.criticalAt) style = cfg.styleCritical;
  else if (value >= cfg.warnAt) style = cfg.styleWarn;

  return { text: `${Math.round(value)}%`, style };
}
```

## Script plugin (Python)

File: `~/.claude/oh-my-claude/plugins/<name>/plugin` (must be executable)

```python
#!/usr/bin/env python3
"""Plugin description."""
import json, sys

def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(1)

    # Access data fields
    value = data.get("model", {}).get("display_name")
    if not value:
        sys.exit(1)  # exit non-zero to hide

    # Access per-plugin config
    config = data.get("_config", {})

    json.dump({"text": value, "style": "cyan"}, sys.stdout)

if __name__ == "__main__":
    main()
```

Companion file: `plugin.json`

```json
{
  "name": "<name>",
  "description": "One-line description",
  "cacheTtl": 5000,
  "timeout": 5000,
  "defaultConfig": { "style": "cyan" }
}
```

## Script plugin (Bash)

```bash
#!/usr/bin/env bash
set -euo pipefail
INPUT=$(cat)
# Requires jq for JSON parsing
VALUE=$(echo "$INPUT" | jq -r '.model.display_name // empty')
[ -z "$VALUE" ] && exit 1
echo "{\"text\": \"$VALUE\", \"style\": \"cyan\"}"
```

## Style tokens

Space-separated string: `"bold cyan"`, `"bg:red white"`, `"dim yellow"`

| Token | Effect |
|-------|--------|
| `bold` | Bold |
| `dim` | Dimmed |
| `italic` | Italic |
| `underline` | Underlined |
| `inverse` | Swap fg/bg |
| `black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` | Foreground color |
| `bg:black` `bg:red` `bg:green` `bg:yellow` `bg:blue` `bg:magenta` `bg:cyan` `bg:white` | Background color |

## CLI commands for plugin development

```bash
omc create <name>                # scaffold JS plugin
omc create <name> --script       # scaffold script plugin (Python default)
omc create <name> --script --lang=bash  # scaffold Bash script plugin
omc test <name>                  # run with mock data, show output
omc info <name>                  # show plugin details + config
omc config <name>                # show current config
omc config <name> key=value      # set config values
omc add <name>                   # add to statusline (line 1, right)
omc add <name> --line 2 --left   # add to specific position
omc show                         # show layout + preview
omc doctor                       # check everything for errors
```

## Common patterns

### Format numbers for statusline

```js
// Cost: show 2 decimal places
const text = `$${cost.toFixed(2)}`;

// Percentage: round to integer
const text = `${Math.round(pct)}%`;

// Duration: minutes and seconds
const mins = Math.floor(ms / 60000);
const secs = Math.floor((ms % 60000) / 1000);
const text = `${mins}m ${secs}s`;

// Large numbers: abbreviate
const text = tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : `${tokens}`;
```

### Conditional display

```js
// Hide below a threshold
if (value < config.minToShow) return null;

// Hide when zero
if (linesAdded === 0 && linesRemoved === 0) return null;

// Show different text based on state
const text = isActive ? 'ACTIVE' : 'idle';
```

### Multiple data sources

```js
// Combine fields safely
const input = data?.context_window?.total_input_tokens;
const output = data?.context_window?.total_output_tokens;
if (input == null || output == null) return null;
const total = input + output;
```

## Failure diagnosis

| Symptom | Cause | Fix |
|---------|-------|-----|
| Plugin doesn't show up | `meta.name` doesn't match directory name | Rename to match exactly |
| Plugin doesn't show up | Not added to statusline | Run `omc add <name>` |
| Plugin doesn't show up | `render()` returns null | Check data access — field may be missing from mock data |
| `omc test` shows error | `render()` throws | Add optional chaining to all `data.` accesses |
| `omc test` says "not found" | Wrong name or not installed | Run `omc list` to see installed plugins |
| Script plugin times out | Slow external command | Reduce work or increase `timeout` in plugin.json |
| Script plugin returns null | Non-zero exit code | Check stderr — add error handling to script |
| Config changes not reflected | Stale cache | Restart Claude Code, or wait for cache TTL |
