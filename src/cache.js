// src/cache.js — File-based caching
// Zero dependencies. Node 18+ ESM.

import { mkdirSync, writeFileSync, readFileSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

const CACHE_DIR = '/tmp/omc-cache';

/**
 * Ensure the cache directory exists.
 */
function ensureCacheDir() {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
  } catch {
    // If we can't create the cache dir, caching is effectively disabled.
  }
}

/**
 * Hash a cache key to a safe filename.
 *
 * @param {string} key - The cache key
 * @returns {string} Hex-encoded SHA-256 hash
 */
function hashKey(key) {
  return createHash('sha256').update(String(key || '')).digest('hex');
}

/**
 * Execute a shell command with caching.
 *
 * If a cached result exists and is younger than ttlMs, returns the cached value.
 * Otherwise runs the command, caches the output, and returns it.
 * If the command fails (non-zero exit), returns empty string.
 *
 * @param {string} key - Cache key (arbitrary string, will be hashed)
 * @param {string} command - Shell command to execute
 * @param {number} [ttlMs=5000] - Cache time-to-live in milliseconds
 * @returns {string} Command stdout (trimmed), or empty string on failure
 */
export function cachedExec(key, command, ttlMs = 5000) {
  if (!key || !command) return '';

  ensureCacheDir();

  const filename = hashKey(key);
  const filepath = join(CACHE_DIR, filename);

  // Check cache freshness
  try {
    const stat = statSync(filepath);
    const ageMs = Date.now() - stat.mtimeMs;
    if (ageMs < ttlMs) {
      return readFileSync(filepath, 'utf8');
    }
  } catch {
    // Cache miss — file doesn't exist or can't be read. Proceed to execute.
  }

  // Execute command
  let result = '';
  try {
    result = execSync(command, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    // Command failed — return empty string, don't cache failure.
    return '';
  }

  // Write to cache
  try {
    writeFileSync(filepath, result, 'utf8');
  } catch {
    // Can't write cache — that's fine, we still have the result.
  }

  return result;
}

/**
 * Remove all cached files.
 */
export function clearCache() {
  try {
    const entries = readdirSync(CACHE_DIR);
    for (const entry of entries) {
      try {
        unlinkSync(join(CACHE_DIR, entry));
      } catch {
        // Ignore individual file removal failures.
      }
    }
  } catch {
    // Cache dir doesn't exist or can't be read — nothing to clear.
  }
}
