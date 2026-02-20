# Theme Format

Themes are JSON files in the `themes/` directory. They control which plugins appear, their order, their layout (left vs right), and per-plugin configuration overrides.

## Schema

```json
{
  "name": "default",
  "description": "The default oh-my-claude theme",
  "lines": [
    {
      "left": ["model", "context", "cost"],
      "right": ["version"]
    }
  ],
  "separator": " ",
  "plugins": {
    "context": {
      "warnAt": 80,
      "criticalAt": 95
    },
    "cost": {
      "precision": 2
    }
  }
}
```

## Fields

### `name` (string, required)

Unique theme identifier. Must match the filename without extension (e.g., `minimal.json` has `name: "minimal"`).

### `description` (string, required)

One-line description of the theme. Shown in `omc theme list`.

### `lines` (array of objects, required)

Defines the statusline layout. Each element in the array is one line of output. Most themes use a single line, but multi-line layouts are supported.

Each line object has:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `left` | `string[]` | yes | Plugin names rendered on the left side, in order. |
| `right` | `string[]` | yes | Plugin names rendered on the right side, in order. |

Plugins are rendered in array order. Left plugins flow left-to-right. Right plugins flow left-to-right but are right-aligned as a group.

If a plugin returns `null`, it is removed from the line and the remaining plugins close the gap. This means plugins can conditionally appear without leaving blank spaces.

### `separator` (string, optional)

The string placed between adjacent plugins on the same side. Defaults to `" "` (single space).

Examples:
- `" "` -- space between plugins
- `" | "` -- pipe separator
- `" // "` -- double slash
- `" \u2502 "` -- Unicode box-drawing character

The separator is only placed between visible plugins. If a plugin is hidden (returns null), no extra separator appears.

### `plugins` (object, optional)

Per-plugin configuration overrides. Keys are plugin names, values are config objects passed to the plugin's `render()` function.

These overrides sit between the plugin's `meta.defaultConfig` and the user's `config.json` overrides in the resolution order:

```
meta.defaultConfig  <  theme.plugins  <  user config.plugins
```

Only include config for plugins that need non-default values. Plugins not listed here receive their defaults.

## Theme Resolution

When the framework starts:

1. Load `themes/default.json` as the base.
2. If the user's config specifies a different theme (`"theme": "minimal"`), load `themes/minimal.json` and use it instead of the default. The default is NOT merged -- the named theme fully replaces it.
3. The user's `~/.claude/oh-my-claude/config.json` can override individual plugin configs on top of whichever theme is active.

## Referencing Plugins

Plugin names in `left` and `right` arrays can reference:

- **Built-in plugins**: Any file in `src/plugins/` by its `meta.name` (e.g., `"model"`, `"context"`, `"cost"`).
- **External plugins**: Any plugin in `~/.claude/oh-my-claude/plugins/<name>/` by its directory name (e.g., `"my-plugin"`).

If a referenced plugin does not exist, the framework silently skips it (same as if it returned null).

## Example: Single-Line Theme

```json
{
  "name": "minimal",
  "description": "Just the essentials",
  "lines": [
    {
      "left": ["model"],
      "right": ["cost"]
    }
  ]
}
```

Produces output like:

```
Opus                                                           $1.23
```

## Example: Multi-Line Theme

```json
{
  "name": "detailed",
  "description": "Two-line layout with full info",
  "lines": [
    {
      "left": ["model", "context"],
      "right": ["version"]
    },
    {
      "left": ["git-branch", "git-status"],
      "right": ["cost", "duration"]
    }
  ],
  "separator": " | ",
  "plugins": {
    "context": { "warnAt": 70 },
    "cost": { "precision": 3 }
  }
}
```

Produces output like:

```
Opus | 42%                                                     v2.1.34
main | clean                                              $1.230 | 12m
```

## Creating a New Theme

1. Create a JSON file in `themes/`.
2. Set `name` to match the filename (without `.json`).
3. Define at least one line with `left` and `right` arrays.
4. Test with: `echo '<sample json>' | node src/runner.js --theme your-theme`
5. Validate with: `npm run validate`

The framework ships with `themes/default.json`. Use it as a starting point.
