// src/plugins/soundtrack.js — Dynamic music genre suggestion based on session activity
// Zero dependencies. Node 18+ ESM.
//
// Genre selection (priority order, highest wins):
//   1. context >= 85%           -> boss battle music     (bold red)
//   2. removed > added, removed > 50 -> death metal     (red)
//   3. lines_added > 200        -> epic orchestral       (bold magenta)
//   4. added > 100, removed > 30 -> jazz                 (magenta)
//   5. api > 50% of total, total > 120s -> ambient       (dim)
//   6. cost > $10               -> cha-ching sounds       (yellow)
//   7. duration > 1hr           -> lo-fi beats            (dim)
//   8. lines_added > 50         -> synth pop              (cyan)
//   9. duration < 2min          -> startup jingle         (green)
//  10. default                  -> lo-fi beats            (dim)
//
// Anti-flicker: genre must win for 2 consecutive renders before switching.

const GENRES = [
  {
    test: (d) => (d?.context_window?.used_percentage ?? 0) >= 85,
    label: 'boss battle music',
    style: 'bold red',
  },
  {
    test: (d) => {
      const removed = d?.cost?.total_lines_removed ?? 0;
      const added = d?.cost?.total_lines_added ?? 0;
      return removed > added && removed > 50;
    },
    label: 'death metal',
    style: 'red',
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) > 200,
    label: 'epic orchestral',
    style: 'bold magenta',
  },
  {
    test: (d) =>
      (d?.cost?.total_lines_added ?? 0) > 100 &&
      (d?.cost?.total_lines_removed ?? 0) > 30,
    label: 'jazz',
    style: 'magenta',
  },
  {
    test: (d) => {
      const totalDuration = d?.cost?.total_duration_ms ?? 0;
      const apiDuration = d?.cost?.total_api_duration_ms ?? 0;
      return totalDuration > 120_000 && apiDuration > totalDuration * 0.5;
    },
    label: 'ambient',
    style: 'dim',
  },
  {
    test: (d) => (d?.cost?.total_cost_usd ?? 0) > 10,
    label: 'cha-ching sounds',
    style: 'yellow',
  },
  {
    test: (d) => (d?.cost?.total_duration_ms ?? 0) > 3_600_000,
    label: 'lo-fi beats',
    style: 'dim',
  },
  {
    test: (d) => (d?.cost?.total_lines_added ?? 0) > 50,
    label: 'synth pop',
    style: 'cyan',
  },
  {
    test: (d) => (d?.cost?.total_duration_ms ?? 0) < 120_000,
    label: 'startup jingle',
    style: 'green',
  },
];

const DEFAULT_GENRE = {
  label: 'lo-fi beats',
  style: 'dim',
};

const EMOJI = '\u{1F3B5}';
const STABLE_THRESHOLD = 2;

// Anti-flicker state: track the currently displayed genre and how many
// consecutive renders the new candidate has been the winner.
let lastGenre = null;
let candidateLabel = null;
let stableCount = 0;

export const meta = {
  name: 'soundtrack',
  description: 'Suggests a music genre/mood based on session activity',
  requires: [],
  defaultConfig: {
    style: '',
    showEmoji: true,
  },
};

/**
 * @param {object} data - Parsed stdin JSON from Claude Code
 * @param {object} config - Per-plugin config from theme
 * @returns {{text: string, style: string}}
 */
export function render(data, config) {
  const cfg = { ...meta.defaultConfig, ...config };

  // Determine the winning genre for this render
  const winner = GENRES.find((g) => g.test(data)) ?? DEFAULT_GENRE;

  // Anti-flicker logic: only switch to a new genre after it wins
  // for STABLE_THRESHOLD consecutive renders.
  if (winner.label === candidateLabel) {
    stableCount++;
  } else {
    candidateLabel = winner.label;
    stableCount = 1;
  }

  // Promote the candidate once it is stable, or on first render
  if (stableCount >= STABLE_THRESHOLD || lastGenre == null) {
    lastGenre = winner;
  }

  const display = lastGenre;
  const prefix = cfg.showEmoji ? `${EMOJI} ` : '';
  const text = `${prefix}${display.label}`;

  // Allow per-plugin style override; fall back to genre-specific style
  const style = cfg.style || display.style;

  return { text, style };
}
