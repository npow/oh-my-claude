// plugin.js — oh-my-claude plugin template
//
// Quick start:
//   1. Copy this directory to ~/.claude/oh-my-claude/plugins/<your-name>/
//   2. Rename and edit this file
//   3. Run: omc add <your-name> && omc test <your-name>
//
// Three rules:
//   - Export `meta` (object with name + description)
//   - Export `render` (function)
//   - Return { text, style } or null

export const meta = {
  name: 'my-plugin',           // must match directory name
  description: 'One-line description of what this shows',
  requires: [],                // e.g. ["git"] for external deps
  defaultConfig: {
    style: 'cyan',             // default style (bold, dim, red, green, etc.)
    // Add your own config keys here — users override them via:
    //   omc config my-plugin key=value
  },
};

/**
 * Render this plugin segment.
 *
 * @param {object} data - JSON from Claude Code. Always use optional chaining (data?.field).
 * @param {object} config - Merged config: meta.defaultConfig < theme < user overrides.
 * @returns {{ text: string, style: string } | null} Return null to hide.
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // ── Access Claude Code data ──────────────────────
  // data?.model?.display_name         → "Opus", "Sonnet"
  // data?.model?.id                   → "claude-opus-4-6"
  // data?.context_window?.used_percentage → 0-100
  // data?.cost?.total_cost_usd        → e.g. 2.41
  // data?.cost?.total_duration_ms     → session wall-clock time
  // data?.cost?.total_lines_added     → lines added this session
  // data?.cost?.total_lines_removed   → lines removed
  // data?.workspace?.current_dir      → cwd path
  // data?.session_id                  → unique session id
  // data?.version                     → Claude Code version
  //
  // Full reference: docs/plugin-contract.md

  // ── Example: show model name ─────────────────────
  const value = data?.model?.display_name;
  if (value == null) return null;  // hide when data is missing

  return { text: `${value}`, style: cfg.style };
}
