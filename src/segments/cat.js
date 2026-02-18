// src/segments/cat.js — A cat that does cat things based on session state
// Zero dependencies. Node 18+ ESM.
//
// States (priority order):
//   1. Sits on context window   — context >= 90%
//   2. Pushes lines off desk    — lines_removed > lines_added AND lines_removed > 20
//   3. Sleeping                 — api_duration > total_duration * 0.5 AND total_duration > 120s
//   4. Watches intently         — lines_added > 200
//   5. Knocks wallet off table  — cost > $10
//   6. Yawns                    — duration > 1 hour
//   7. Perks up                 — duration < 1 minute
//   8. Default                  — just a cat

export const meta = {
  name: 'cat',
  description: 'A cat that does cat things based on session state',
  requires: [],
  defaultConfig: {
    style: '',
  },
};

/**
 * Determine the cat's current behavior from session metrics.
 * Priority order is enforced by early returns.
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @returns {{ text: string, style: string }}
 */
function resolveCat(data) {
  const context = data?.context_window?.used_percentage ?? 0;
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const linesRemoved = data?.cost?.total_lines_removed ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;
  const totalDuration = data?.cost?.total_duration_ms ?? 0;
  const apiDuration = data?.cost?.total_api_duration_ms ?? 0;

  // 1. Sits on context window
  if (context >= 90) {
    return { text: '=^._.^= *sits on context window*', style: 'bold yellow' };
  }

  // 2. Pushes lines off desk
  if (linesRemoved > linesAdded && linesRemoved > 20) {
    return { text: `=^._.^= *pushes ${linesRemoved} lines off desk*`, style: 'red' };
  }

  // 3. Sleeping — API wait dominates a non-trivial session
  if (totalDuration > 120_000 && apiDuration > totalDuration * 0.5) {
    return { text: '=^._.^= zzz', style: 'dim' };
  }

  // 4. Watches intently
  if (linesAdded > 200) {
    return { text: '=^._.^= *watches intently*', style: 'cyan' };
  }

  // 5. Knocks wallet off table
  if (cost > 10) {
    return { text: '=^._.^= *knocks wallet off table*', style: 'yellow' };
  }

  // 6. Yawns — long session
  if (totalDuration > 3_600_000) {
    return { text: '=^._.^= *yawns*', style: 'dim' };
  }

  // 7. Perks up — fresh session
  if (totalDuration < 60_000) {
    return { text: '=^._.^= *perks up*', style: 'green' };
  }

  // 8. Default
  return { text: '=^._.^=', style: 'dim' };
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const cat = resolveCat(data);
  const style = cfg.style || cat.style;

  return { text: cat.text, style };
}
