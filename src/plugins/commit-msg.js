// src/plugins/commit-msg.js — Preview what the commit message SHOULD be based on session activity
// Zero dependencies. Node 18+ ESM.
//
// Message selection (priority order, first match wins):
//   1. removed > added * 2 AND removed > 20   -> "fix: remove everything"
//   2. removed > added AND removed > 10        -> "refactor: simplify"
//   3. lines_added > 500                       -> "feat: rewrite the entire codebase"
//   4. lines_added > 200                       -> "feat: something incredible"
//   5. lines_added > 100                       -> "feat: new feature"
//   6. lines_added > 50                        -> "chore: updates"
//   7. lines_added > 10                        -> "fix: the thing"
//   8. lines_added > 0                         -> "style: whitespace"
//   9. default                                 -> "docs: update README"
//
// Display: git commit -m "{message}" (or just the message if showPrefix is false)

export const meta = {
  name: 'commit-msg',
  description: 'Preview what the commit message should be based on session activity',
  requires: [],
  defaultConfig: {
    style: 'dim',
    showPrefix: true,
  },
};

/**
 * Determine the commit message based on session line change metrics.
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @returns {string}
 */
function resolveMessage(data) {
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const linesRemoved = data?.cost?.total_lines_removed ?? 0;

  // 1. Massive net deletion
  if (linesRemoved > linesAdded * 2 && linesRemoved > 20) {
    return 'fix: remove everything';
  }

  // 2. Net deletion
  if (linesRemoved > linesAdded && linesRemoved > 10) {
    return 'refactor: simplify';
  }

  // 3. Huge additions
  if (linesAdded > 500) {
    return 'feat: rewrite the entire codebase';
  }

  // 4. Large additions
  if (linesAdded > 200) {
    return 'feat: something incredible';
  }

  // 5. Moderate additions
  if (linesAdded > 100) {
    return 'feat: new feature';
  }

  // 6. Small additions
  if (linesAdded > 50) {
    return 'chore: updates';
  }

  // 7. Minor additions
  if (linesAdded > 10) {
    return 'fix: the thing';
  }

  // 8. Tiny additions
  if (linesAdded > 0) {
    return 'style: whitespace';
  }

  // 9. Default — nothing changed
  return 'docs: update README';
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };
  const message = resolveMessage(data);

  const text = cfg.showPrefix
    ? `git commit -m "${message}"`
    : message;

  return { text, style: cfg.style };
}
