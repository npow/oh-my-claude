# oh-my-claude Plugin Template

Copy this directory to get started with a new plugin.

## JS Plugin (recommended)

1. Copy this directory:
   ```bash
   cp -r templates/plugin ~/.claude/oh-my-claude/plugins/my-plugin
   ```

2. Edit `plugin.js` — update `meta.name` to match your directory name, write your `render()` function.

3. Add and test:
   ```bash
   omc add my-plugin
   omc test my-plugin
   ```

## Script Plugin (Python, Bash, etc.)

For non-JS plugins, delete `plugin.js` and create an executable `plugin` file instead:

```bash
#!/usr/bin/env python3
import json, sys

data = json.load(sys.stdin)
# data["_config"] contains your plugin config
json.dump({"text": "Hello!", "style": "cyan"}, sys.stdout)
```

Make it executable: `chmod +x plugin`

The `plugin.json` manifest tells oh-my-claude the plugin's name, cache TTL, and default config.

## Plugin Contract

- `render(data, config)` receives Claude Code session JSON and merged config
- Return `{ text: "...", style: "..." }` to show content
- Return `null` to hide the plugin
- Never throw — return `null` on errors
- Use optional chaining: `data?.model?.display_name`
- Shell commands must use `cachedExec` from `src/cache.js`

## Available Data Fields

| Path | Example |
|------|---------|
| `data.model.display_name` | `"Opus"` |
| `data.model.id` | `"claude-opus-4-6"` |
| `data.context_window.used_percentage` | `42.5` |
| `data.cost.total_cost_usd` | `2.41` |
| `data.cost.total_duration_ms` | `750000` |
| `data.cost.total_lines_added` | `83` |
| `data.workspace.current_dir` | `"/Users/dev/myproject"` |
| `data.session_id` | `"abc123"` |

Full reference: [docs/plugin-contract.md](../../docs/plugin-contract.md)

## Style Tokens

Space-separated: `"bold cyan"`, `"bg:red white"`, `"dim yellow"`

Colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`
Modifiers: `bold`, `dim`, `italic`, `underline`, `inverse`
Background: `bg:red`, `bg:blue`, etc.
