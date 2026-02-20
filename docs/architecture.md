# Architecture

How oh-my-claude transforms Claude Code's JSON status data into a styled, multi-line statusline.

## Pipeline

```
Claude Code (stdin JSON)
        |
        v
   runner.js          Parse stdin, orchestrate pipeline
        |
        v
   config.js           Load theme + user overrides, resolve per-plugin config
        |
        v
   plugins/*.js        Each plugin's render(data, config) called
        |
        v
   compositor.js       Arrange plugins into lines with left/right alignment
        |
        v
   color.js            Apply ANSI escape codes from style strings
        |
        v
   stdout              Final styled string printed to terminal
```

## runner.js

The entry point. Responsibilities:

1. Read stdin to completion (Claude Code pipes a single JSON blob).
2. Parse JSON. If parsing fails, output an empty line and exit.
3. Call `config.js` to resolve the active theme and user overrides.
4. Discover all plugin modules in `src/plugins/`.
5. Check each plugin's `meta.requires` against available system commands. Skip plugins with missing dependencies.
6. For each line defined in the theme, call each plugin's `render(data, config)`.
7. Pass rendered plugins to `compositor.js` to produce final output.
8. Write to stdout.

All plugin render calls are synchronous. The statusline must produce output quickly and exit.

## config.js

Resolves configuration through a three-layer stack:

```
Layer 1 (lowest priority):  themes/default.json
Layer 2:                     themes/<active-theme>.json
Layer 3 (highest priority):  ~/.claude/oh-my-claude/config.json
```

The user config file at `~/.claude/oh-my-claude/config.json` can specify:

```json
{
  "theme": "minimal",
  "plugins": {
    "cost": { "precision": 4, "warnAt": 10.0 }
  }
}
```

Config resolution for a plugin:

1. Start with the plugin's `meta.defaultConfig`.
2. Merge the theme's `plugins["name"]` on top.
3. Merge the user's `plugins["name"]` on top.
4. Pass the result as `config` to `render()`.

Merging is shallow `Object.assign` -- not deep merge. Keep plugin configs flat.

## compositor.js

Takes an array of line definitions (each with rendered left and right plugins) and produces the final output string.

### Alignment

Each line has a `left` array and a `right` array of rendered plugins. The compositor:

1. Joins left plugins with the theme's separator (default: `" "`).
2. Joins right plugins with the separator.
3. Detects terminal width from `process.stdout.columns` (falls back to 80).
4. Pads the space between left and right groups to fill the terminal width.
5. If the combined width exceeds the terminal, truncates the left group to make room. Truncation adds `...` as an indicator.

### Multi-line Output

Themes can define multiple lines. The compositor outputs each line separated by `\n`. Claude Code's statusline feature supports multi-line output.

### Separator

The theme's `separator` field controls the string placed between adjacent plugins on the same side. Default is a single space. Themes can use Unicode characters like `|`, `//`, or powerline glyphs.

## color.js

Parses style strings into ANSI escape sequences.

Input: A space-separated string like `"bold cyan"` or `"bg:red white"`.

Output: An object with `open` and `close` ANSI strings that wrap the plugin text.

### Parsing Rules

1. Split style string on spaces.
2. For each token:
   - Modifiers (`bold`, `dim`, `italic`, `underline`, `inverse`, `hidden`, `strikethrough`): map to ANSI SGR codes.
   - Foreground colors (`black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`): map to ANSI 30-37.
   - Background colors (`bg:black`, `bg:red`, etc.): map to ANSI 40-47.
3. Combine all codes into a single `\x1b[...m` open sequence.
4. Close sequence is always `\x1b[0m` (reset).

No 256-color or truecolor support in v1. Standard 8 colors cover the common case.

## cache.js

Provides a TTL-based cache for shell command output. Plugins that run external commands (git, system utilities) MUST use this to avoid re-executing commands on every statusline update.

### API

```js
import { cachedExec } from "../cache.js";

// Returns stdout as a string, or null if the command fails
const result = cachedExec(key, command, ttlMs);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | Cache key. Use a descriptive name like `"git-branch"`. |
| `command` | `string` | Shell command to execute. |
| `ttlMs` | `number` | Time-to-live in milliseconds. Cached result is reused within this window. |

### Implementation Details

- Uses `child_process.execSync` with a timeout (default: 2000ms).
- Cache storage: files in `/tmp/omc-cache/`. Each key maps to a file containing `{ timestamp, stdout }` as JSON.
- On cache hit (file exists and age < TTL): returns cached stdout without executing.
- On cache miss or expired: executes command, writes result, returns stdout.
- On command failure (non-zero exit, timeout): returns `null`. Does not cache failures.
- File-based cache survives across statusline invocations within the same shell session.

### Why File-Based

The statusline runs as a short-lived process on every update. In-memory caches die with the process. File-based caching in `/tmp` persists across invocations and is automatically cleaned by the OS.

## External Plugins

Users can add custom plugins without modifying the framework. There are two plugin types:

### JS Plugins (`plugin.js`)

In-process ESM modules. Same contract as built-in plugins — fastest option.

```
~/.claude/oh-my-claude/plugins/<name>/plugin.js
```

Must export `meta` (object with `name` string) and `render` (function). See [plugin-contract.md](plugin-contract.md).

### Script Plugins (executable `plugin`)

Subprocess-based plugins that can use any language (Python, Bash, Ruby, etc.).

```
~/.claude/oh-my-claude/plugins/<name>/plugin        # executable, any language
~/.claude/oh-my-claude/plugins/<name>/plugin.json    # optional manifest
```

**How it works:**

1. The framework pipes JSON to the script's stdin via `execFileSync`.
2. The script processes the data and outputs JSON to stdout.
3. Exit code 0: plugin is shown. Non-zero: plugin is hidden.

**stdin payload:**

The script receives the full Claude Code JSON data with an additional `_config` key containing the per-plugin config:

```json
{
  "model": { "display_name": "Opus", "id": "claude-opus-4-6" },
  "cost": { "total_cost_usd": 2.45 },
  "_config": { "myKey": "myValue" }
}
```

**stdout format:**

Output a single JSON object with `text` and `style`:

```json
{"text": "Hello!", "style": "bold cyan"}
```

Plain text output (single line, no JSON) is also accepted — it will be used as `text` with an empty style.

**`plugin.json` manifest** (optional):

```json
{
  "name": "my-plugin",
  "description": "What this plugin does",
  "cacheTtl": 5000,
  "defaultConfig": {}
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | `string` | directory name | Plugin name used in theme config |
| `description` | `string` | `""` | Shown in `omc list` |
| `cacheTtl` | `number` | `5000` | Cache TTL in milliseconds |
| `defaultConfig` | `object` | `{}` | Default config passed via `_config` |

If `plugin.json` is absent, the directory name is used as the plugin name with default settings.

### Plugin Resolution Order

When a plugin directory is found, the framework tries:

1. `plugin.js` — loaded as an in-process ESM module (fast)
2. `plugin` (executable) — wrapped as a subprocess plugin

If `plugin.js` exists and is valid, the executable `plugin` file is ignored.

### Caching

Script plugins are cached by plugin name (not by payload) with a configurable TTL (default: 5 seconds). This avoids re-executing the subprocess on every statusline tick. The cache key is `plugin:<name>`, stored in `/tmp/omc-cache/`.

### Limits

- **Timeout**: 2 seconds. If the script doesn't exit in time, output is null (plugin hidden).
- **Max output**: 64KB. Larger output is truncated.
- **Failures not cached**: Non-zero exit or timeout results are not cached, so the script is retried on the next tick.

### Installing Plugins

```bash
# From a git URL
omc install https://github.com/user/omc-plugin-example

# From a local path
omc install /path/to/local/plugin
```

This clones the repo into `~/.claude/oh-my-claude/plugins/<name>/` and ensures the `plugin` file is executable.

### Creating Script Plugins

```bash
# Python (default)
omc create my-plugin --script

# Bash
omc create my-plugin --script --lang=bash
```

This scaffolds a plugin directory with an executable `plugin` file and `plugin.json` manifest.

## Dependency Checking

When a plugin declares `meta.requires = ["git"]`, the framework checks at startup:

1. Run `which <dep>` for each dependency.
2. Cache the result for the lifetime of the process.
3. If any dependency is missing, skip the plugin entirely (treat as null).

This prevents error spam from plugins that depend on tools not installed on the user's system.

## Error Isolation

Every plugin render call is wrapped in a try/catch. If a plugin throws:

1. The exception is caught.
2. The plugin is treated as returning `null` (hidden).
3. No error output contaminates stdout. The statusline is a display-only surface.

This guarantee means a single broken plugin can never take down the entire statusline.
