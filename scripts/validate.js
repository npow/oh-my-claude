#!/usr/bin/env node

// scripts/validate.js — Plugin contract validator (custom linter)
// Checks every plugin file in src/plugins/ against the contract spec.
// Agent-friendly error messages: tells you exactly what's wrong and how to fix it.

import { readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOCK_DATA } from '../src/mock-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = join(__dirname, '..', 'src', 'plugins');

let passed = 0;
let failed = 0;
const errors = [];

function fail(file, message, fix) {
  failed++;
  errors.push({ file, message, fix });
}

function pass(file, check) {
  passed++;
}

async function validatePlugin(filepath) {
  const filename = basename(filepath, '.js');

  // Skip index.js
  if (filename === 'index') return;

  let mod;
  try {
    mod = await import(filepath);
  } catch (err) {
    fail(filename, `Failed to import: ${err.message}`, 'Fix the syntax error or missing import in this file.');
    return;
  }

  // Check: exports meta
  if (!mod.meta) {
    fail(filename, 'Missing `export const meta`', 'Add: export const meta = { name: "...", description: "..." };');
    return;
  }
  pass(filename, 'exports meta');

  // Check: meta.name exists and is a string
  if (!mod.meta.name || typeof mod.meta.name !== 'string') {
    fail(filename, 'meta.name is missing or not a string', 'Set meta.name to a unique string identifier matching the filename.');
  } else {
    pass(filename, 'meta.name');
    // Check: meta.name matches filename
    if (mod.meta.name !== filename) {
      fail(filename, `meta.name "${mod.meta.name}" doesn't match filename "${filename}"`, `Change meta.name to "${filename}" or rename the file to "${mod.meta.name}.js".`);
    } else {
      pass(filename, 'meta.name matches filename');
    }
  }

  // Check: meta.description exists
  if (!mod.meta.description || typeof mod.meta.description !== 'string') {
    fail(filename, 'meta.description is missing or not a string', 'Add a one-line description: meta.description = "Shows the current model name"');
  } else {
    pass(filename, 'meta.description');
  }

  // Check: meta.requires is an array (if present)
  if (mod.meta.requires !== undefined && !Array.isArray(mod.meta.requires)) {
    fail(filename, 'meta.requires must be an array of strings', 'Set meta.requires = [] or meta.requires = ["git"]');
  } else {
    pass(filename, 'meta.requires');
  }

  // Check: meta.defaultConfig is an object (if present)
  if (mod.meta.defaultConfig !== undefined && (typeof mod.meta.defaultConfig !== 'object' || Array.isArray(mod.meta.defaultConfig))) {
    fail(filename, 'meta.defaultConfig must be a plain object', 'Set meta.defaultConfig = { ... } with key-value pairs.');
  } else {
    pass(filename, 'meta.defaultConfig');
  }

  // Check: exports render function
  if (typeof mod.render !== 'function') {
    fail(filename, 'Missing `export function render(data, config)`', 'Add: export function render(data, config) { return { text: "...", style: "..." }; }');
    return;
  }
  pass(filename, 'exports render');

  // Check: render handles normal data
  let result;
  try {
    result = mod.render(MOCK_DATA, mod.meta.defaultConfig || {});
  } catch (err) {
    fail(filename, `render() threw with valid data: ${err.message}`, 'render() must never throw. Use optional chaining and handle edge cases.');
    return;
  }
  pass(filename, 'render() does not throw with valid data');

  // Check: render returns correct shape
  if (result !== null) {
    if (typeof result === 'object') {
      if (result.text == null) {
        fail(filename, 'render() returned object without .text property', 'Return { text: "...", style: "..." } or null.');
      } else {
        pass(filename, 'render returns {text, style}');
      }
    } else if (typeof result !== 'string') {
      fail(filename, `render() returned unexpected type: ${typeof result}`, 'Return { text: "...", style: "..." } or null.');
    }
  } else {
    pass(filename, 'render returns null (plugin hidden for this data)');
  }

  // Check: render handles null/empty data gracefully
  try {
    mod.render({}, {});
  } catch (err) {
    fail(filename, `render() threw with empty data: ${err.message}`, 'Use optional chaining: data?.model?.display_name instead of data.model.display_name');
    return;
  }
  pass(filename, 'render() handles empty data');

  // Check: render handles fully null data
  try {
    mod.render(null, {});
  } catch (err) {
    fail(filename, `render() threw with null data: ${err.message}`, 'Add a guard at the top: if (!data) return null;');
    return;
  }
  pass(filename, 'render() handles null data');
}

async function main() {
  console.log('oh-my-claude plugin validator\n');
  console.log('Scanning src/plugins/ ...\n');

  let files;
  try {
    files = await readdir(PLUGINS_DIR);
  } catch {
    console.error('ERROR: Could not read src/plugins/ directory');
    process.exit(1);
  }

  const jsFiles = files.filter(f => f.endsWith('.js') && f !== 'index.js');

  if (jsFiles.length === 0) {
    console.log('No plugin files found.');
    process.exit(0);
  }

  console.log(`Found ${jsFiles.length} plugin(s)\n`);

  for (const file of jsFiles.sort()) {
    const filepath = join(PLUGINS_DIR, file);
    await validatePlugin(filepath);
  }

  console.log('─'.repeat(50));
  console.log(`\n  ${passed} checks passed`);

  if (failed > 0) {
    console.log(`  ${failed} checks FAILED\n`);
    for (const { file, message, fix } of errors) {
      console.log(`  FAIL [${file}]: ${message}`);
      console.log(`    FIX: ${fix}\n`);
    }
    process.exit(1);
  } else {
    console.log(`  All plugins valid!\n`);
    process.exit(0);
  }
}

main();
