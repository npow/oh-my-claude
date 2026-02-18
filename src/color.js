// src/color.js — ANSI color utilities
// Zero dependencies. Node 18+ ESM.

const RESET = '\x1b[0m';

// Style codes: modifiers
const MODIFIERS = {
  bold:      '\x1b[1m',
  dim:       '\x1b[2m',
  italic:    '\x1b[3m',
  underline: '\x1b[4m',
  inverse:   '\x1b[7m',
};

// Foreground colors (standard 16-color)
const FG_COLORS = {
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  cyan:    '\x1b[36m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
  grey:    '\x1b[90m',
  // orange via 256-color (color 208)
  orange:  '\x1b[38;5;208m',
};

// Background colors
const BG_COLORS = {
  red:     '\x1b[41m',
  green:   '\x1b[42m',
  yellow:  '\x1b[43m',
  blue:    '\x1b[44m',
  magenta: '\x1b[45m',
  cyan:    '\x1b[46m',
  white:   '\x1b[47m',
  gray:    '\x1b[100m',
  grey:    '\x1b[100m',
  // orange via 256-color background (color 208)
  orange:  '\x1b[48;5;208m',
};

/**
 * Apply ANSI styles to text.
 *
 * @param {string} text - The text to style
 * @param {string} styleString - Space-separated tokens, e.g. "bold cyan", "bg:red white", "dim green"
 * @returns {string} ANSI-wrapped text, or plain text if no valid styles
 */
export function stylize(text, styleString) {
  if (text == null) return '';
  const str = String(text);
  if (!str) return '';
  if (!styleString || typeof styleString !== 'string') return str;

  const tokens = styleString.trim().split(/\s+/);
  let codes = '';

  for (const token of tokens) {
    if (!token) continue;

    const lower = token.toLowerCase();

    // Background color: "bg:COLOR"
    if (lower.startsWith('bg:')) {
      const colorName = lower.slice(3);
      if (BG_COLORS[colorName]) {
        codes += BG_COLORS[colorName];
      }
      continue;
    }

    // Modifier
    if (MODIFIERS[lower]) {
      codes += MODIFIERS[lower];
      continue;
    }

    // Foreground color
    if (FG_COLORS[lower]) {
      codes += FG_COLORS[lower];
      continue;
    }
  }

  if (!codes) return str;
  return codes + str + RESET;
}

// Regex matching all ANSI escape sequences (CSI sequences and OSC sequences)
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*m|\x1b\].*?\x07/g;

/**
 * Strip all ANSI escape codes from text.
 *
 * @param {string} text - Text potentially containing ANSI codes
 * @returns {string} Plain text with ANSI codes removed
 */
export function stripAnsi(text) {
  if (text == null) return '';
  return String(text).replace(ANSI_RE, '');
}
