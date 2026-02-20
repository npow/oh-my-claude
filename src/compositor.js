// src/compositor.js — Layout engine
// Zero dependencies. Node 18+ ESM.

import { openSync, closeSync } from 'fs';
import { execFileSync } from 'child_process';
import { stylize, stripAnsi } from './color.js';

/**
 * Detect terminal width.
 *
 * Claude Code pipes JSON to our stdin and reads our stdout, so
 * process.stdout.columns is undefined (it's a pipe, not a TTY).
 * We open /dev/tty directly to query the real terminal size via ioctl.
 *
 * @returns {number}
 */
function detectWidth() {
  // 1. Explicit env override (user can set OMC_WIDTH in settings.json env)
  if (process.env.OMC_WIDTH) {
    const w = parseInt(process.env.OMC_WIDTH, 10);
    if (w > 0) return w;
  }

  // 2. COLUMNS env var (set by some shells, inherited by subprocesses)
  if (process.env.COLUMNS) {
    const w = parseInt(process.env.COLUMNS, 10);
    if (w > 0) return w;
  }

  // 3. stdout/stderr columns (works if either is still a TTY)
  if (process.stdout.columns) return process.stdout.columns;
  if (process.stderr.columns) return process.stderr.columns;

  // 4. Query real terminal size via stty with /dev/tty as stdin.
  //    `stty size` outputs "rows cols". We open /dev/tty and pass the fd
  //    as stty's stdin so it queries the actual terminal, not the pipe.
  try {
    const ttyFd = openSync('/dev/tty', 'r');
    let cols = 0;
    try {
      const output = execFileSync('stty', ['size'], {
        encoding: 'utf8',
        timeout: 1000,
        stdio: [ttyFd, 'pipe', 'pipe'],
      }).trim();
      cols = parseInt(output.split(/\s+/)[1], 10);
    } catch {}
    closeSync(ttyFd);
    if (cols > 0) return cols;
  } catch {
    // /dev/tty unavailable (e.g., CI, Docker without TTY)
  }

  // 5. Fallback — most modern terminals are wider than 80
  return 120;
}

/**
 * Render an array of plugin results into a styled string joined by separator.
 *
 * @param {Array<{text: string, style: string}>} parts - Plugin outputs
 * @param {string} separator - Plain separator string (will not be styled)
 * @returns {{ rendered: string, plainLength: number }}
 */
function renderSide(parts, separator) {
  if (!parts || !Array.isArray(parts) || parts.length === 0) {
    return { rendered: '', plainLength: 0 };
  }

  const styledParts = [];
  for (const part of parts) {
    if (!part || part.text == null) continue;
    const text = String(part.text);
    if (!text) continue;
    styledParts.push(stylize(text, part.style || ''));
  }

  if (styledParts.length === 0) {
    return { rendered: '', plainLength: 0 };
  }

  const sep = separator || ' | ';
  const rendered = styledParts.join(sep);
  const plainLength = stripAnsi(rendered).length;

  return { rendered, plainLength };
}

/**
 * Compose the final statusline output from line definitions.
 *
 * @param {Array<{left: Array, right: Array}>} lines - Line objects with left/right plugin arrays
 * @param {number} [terminalWidth] - Terminal width override (defaults to process.stdout.columns or 80)
 * @param {string} [separator] - Separator between plugins (default: ' | ')
 * @returns {string} Final formatted output string (lines joined by newline)
 */
export function compose(lines, terminalWidth, separator) {
  if (!lines || !Array.isArray(lines) || lines.length === 0) return '';

  const width = terminalWidth || detectWidth();
  const sep = separator || ' | ';
  const outputLines = [];

  for (const line of lines) {
    if (!line) {
      outputLines.push('');
      continue;
    }

    const left = renderSide(line.left, sep);
    const right = renderSide(line.right, sep);

    // If both sides are empty, skip this line entirely
    if (!left.rendered && !right.rendered) continue;

    // If only one side has content
    if (!right.rendered) {
      outputLines.push(left.rendered);
      continue;
    }
    if (!left.rendered) {
      // Right-align: pad with spaces
      const padding = Math.max(0, width - right.plainLength);
      outputLines.push(' '.repeat(padding) + right.rendered);
      continue;
    }

    // Both sides have content — fill middle with spaces
    const usedWidth = left.plainLength + right.plainLength;
    const gap = width - usedWidth;

    if (gap >= 1) {
      // Plenty of room — pad the middle
      outputLines.push(left.rendered + ' '.repeat(gap) + right.rendered);
    } else {
      // Terminal too narrow — truncate left side to make room for right
      // We need at least right.plainLength + 1 char for "..." truncation indicator
      const available = width - right.plainLength - 1;

      if (available <= 0) {
        // Not enough room for anything on the left — just show right
        outputLines.push(right.rendered);
      } else {
        // Truncate the left side's plain text and re-render
        // We walk the rendered string character by character, tracking visible length
        const truncated = truncateAnsi(left.rendered, available);
        outputLines.push(truncated + '\x1b[0m' + ' ' + right.rendered);
      }
    }
  }

  return outputLines.join('\n');
}

/**
 * Truncate an ANSI-styled string to a given visible character count.
 * Preserves ANSI codes but cuts visible characters.
 *
 * @param {string} str - ANSI-styled string
 * @param {number} maxVisible - Maximum visible character count
 * @returns {string} Truncated string
 */
function truncateAnsi(str, maxVisible) {
  if (!str) return '';
  if (maxVisible <= 0) return '';

  let visible = 0;
  let result = '';
  let i = 0;

  while (i < str.length && visible < maxVisible) {
    // Check for ANSI escape sequence
    if (str[i] === '\x1b' && str[i + 1] === '[') {
      // Find end of CSI sequence (ends at a letter)
      let j = i + 2;
      while (j < str.length && !/[A-Za-z]/.test(str[j])) j++;
      if (j < str.length) j++; // include the terminating letter
      result += str.slice(i, j);
      i = j;
    } else {
      result += str[i];
      visible++;
      i++;
    }
  }

  return result;
}
