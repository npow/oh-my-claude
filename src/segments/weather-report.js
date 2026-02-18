// src/segments/weather-report.js — Session conditions as weather forecast
// Zero dependencies. Node 18+ ESM.
//
// Conditions (priority order):
//   1. Stormy          — context >= 85%
//   2. Overcast        — context >= 65%
//   3. Hail            — cost > $15
//   4. Windy           — lines_added > 200
//   5. Turbulent       — lines_removed > lines_added
//   6. Partly Cloudy   — duration > 1 hour
//   7. Dawn            — duration < 2 minutes
//   8. Clear Skies     — default

export const meta = {
  name: 'weather-report',
  description: 'Session conditions as a weather forecast',
  requires: [],
  defaultConfig: {
    style: '',
  },
};

/**
 * Determine the weather condition from session metrics.
 * Priority order is enforced by early returns.
 *
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @returns {{ text: string, style: string }}
 */
function resolveWeather(data) {
  const context = data?.context_window?.used_percentage ?? 0;
  const cost = data?.cost?.total_cost_usd ?? 0;
  const linesAdded = data?.cost?.total_lines_added ?? 0;
  const linesRemoved = data?.cost?.total_lines_removed ?? 0;
  const totalDuration = data?.cost?.total_duration_ms ?? 0;

  // 1. Stormy
  if (context >= 85) {
    return { text: '\u26C8\uFE0F Stormy', style: 'bold red' };
  }

  // 2. Overcast
  if (context >= 65) {
    return { text: '\uD83C\uDF27\uFE0F Overcast', style: 'yellow' };
  }

  // 3. Hail
  if (cost > 15) {
    return { text: `\uD83C\uDF28\uFE0F Hail ($${cost.toFixed(2)})`, style: 'bold yellow' };
  }

  // 4. Windy
  if (linesAdded > 200) {
    return { text: `\uD83D\uDCA8 Windy (+${linesAdded})`, style: 'cyan' };
  }

  // 5. Turbulent
  if (linesRemoved > linesAdded) {
    return { text: '\uD83C\uDF2A\uFE0F Turbulent', style: 'yellow' };
  }

  // 6. Partly Cloudy
  if (totalDuration > 3_600_000) {
    return { text: '\uD83C\uDF24\uFE0F Partly Cloudy', style: '' };
  }

  // 7. Dawn
  if (totalDuration < 120_000) {
    return { text: '\uD83C\uDF05 Dawn', style: 'dim' };
  }

  // 8. Clear Skies
  return { text: '\u2600\uFE0F Clear Skies', style: 'green' };
}

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-segment config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  const weather = resolveWeather(data);
  const style = cfg.style || weather.style;

  return { text: weather.text, style };
}
