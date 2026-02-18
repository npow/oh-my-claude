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
   config.js           Load theme + user overrides, resolve per-segment config
        |
        v
   segments/*.js       Each segment's render(data, config) called
        |
        v
   compositor.js       Arrange segments into lines with left/right alignment
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
4. Discover all segment modules in `src/segments/`.
5. Check each segment's `meta.requires` against available system commands. Skip segments with missing dependencies.
6. For each line defined in the theme, call each segment's `render(data, config)`.
7. Pass rendered segments to `compositor.js` to produce final output.
8. Write to stdout.

All segment render calls are synchronous. The statusline must produce output quickly and exit.

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
  "segments": {
    "cost": { "precision": 4, "warnAt": 10.0 }
  }
}
```

Config resolution for a segment:

1. Start with the segment's `meta.defaultConfig`.
2. Merge the theme's `segments["name"]` on top.
3. Merge the user's `segments["name"]` on top.
4. Pass the result as `config` to `render()`.

Merging is shallow `Object.assign` -- not deep merge. Keep segment configs flat.

## compositor.js

Takes an array of line definitions (each with rendered left and right segments) and produces the final output string.

### Alignment

Each line has a `left` array and a `right` array of rendered segments. The compositor:

1. Joins left segments with the theme's separator (default: `" "`).
2. Joins right segments with the separator.
3. Detects terminal width from `process.stdout.columns` (falls back to 80).
4. Pads the space between left and right groups to fill the terminal width.
5. If the combined width exceeds the terminal, truncates the right group first, then the left group. Truncation adds `...` as an indicator.

### Multi-line Output

Themes can define multiple lines. The compositor outputs each line separated by `\n`. Claude Code's statusline feature supports multi-line output.

### Separator

The theme's `separator` field controls the string placed between adjacent segments on the same side. Default is a single space. Themes can use Unicode characters like `|`, `//`, or powerline glyphs.

## color.js

Parses style strings into ANSI escape sequences.

Input: A space-separated string like `"bold cyan"` or `"bg:red white"`.

Output: An object with `open` and `close` ANSI strings that wrap the segment text.

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

Provides a TTL-based cache for shell command output. Segments that run external commands (git, system utilities) MUST use this to avoid re-executing commands on every statusline update.

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

Users can add custom segments without modifying the framework.

### Location

```
~/.claude/oh-my-claude/plugins/<name>/segment.sh
```

### Contract

- The script receives the full stdin JSON on stdin.
- It must output exactly one line to stdout: the segment text.
- Exit code 0: segment is shown. Non-zero: segment is hidden.
- The theme references external plugins by name (e.g., `"my-plugin"`).
- Styling for external plugins is configured in the theme's `segments` block:

```json
{
  "segments": {
    "my-plugin": { "style": "bold cyan" }
  }
}
```

External plugins do not support the `meta` object. The framework assigns reasonable defaults (no requirements, no default config).

### Performance Note

External plugins fork a child process on every invocation. They are inherently slower than built-in JS segments. The framework enforces a 2-second timeout on plugin execution.

## Dependency Checking

When a segment declares `meta.requires = ["git"]`, the framework checks at startup:

1. Run `which <dep>` for each dependency.
2. Cache the result for the lifetime of the process.
3. If any dependency is missing, skip the segment entirely (treat as null).

This prevents error spam from segments that depend on tools not installed on the user's system.

## Error Isolation

Every segment render call is wrapped in a try/catch. If a segment throws:

1. The exception is caught.
2. The segment is treated as returning `null` (hidden).
3. No error output contaminates stdout. The statusline is a display-only surface.

This guarantee means a single broken segment can never take down the entire statusline.
