#!/usr/bin/env node
/**
 * _AJAXSEEK — Fill placeholder values in a shared .mem.
 *
 * When sharing a .mem file that contains project-specific values,
 * you can use {{PLACEHOLDER}} markers. _AJAXSEEK interactively
 * prompts the user to fill them in (or accepts --set KEY=VAL).
 *
 * Placeholder syntax: {{KEY}} or {{KEY:default_value}}
 *
 * Usage:
 *   _AJAXSEEK                   Scan and interactively fill placeholders
 *   _AJAXSEEK -f FILE.mem       Scan specific .mem file
 *   _AJAXSEEK --set KEY=VAL     Set a specific placeholder
 *   _AJAXSEEK --dry-run         List placeholders without filling
 *   _AJAXSEEK --clear           Replace all placeholders with empty string
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';
import { stdin as processStdin, stdout as processStdout } from 'process';
import { findMemFile } from './utils.js';

const PLACEHOLDER_REGEX = /\{\{([A-Z_][A-Z0-9_]*)(?::([^}]*))?\}\}/g;

function usage() {
  console.log(`\n_AJAXSEEK — Fill placeholders in .mem\n`);
  console.log(`  _AJAXSEEK                   Interactive fill`);
  console.log(`  _AJAXSEEK -f FILE.mem       Specific file`);
  console.log(`  _AJAXSEEK --set KEY=VAL     Set a specific placeholder`);
  console.log(`  _AJAXSEEK --set KEY=VAL --set KEY2=VAL2  Multiple`);
  console.log(`  _AJAXSEEK --dry-run         List placeholders only`);
  console.log(`  _AJAXSEEK --clear           Replace all with empty\n`);
}

/**
 * Find all unique placeholders in content.
 * @returns {Array<{key: string, default: string|null, count: number}>}
 */
function findPlaceholders(content) {
  const map = new Map();
  let match;
  PLACEHOLDER_REGEX.lastIndex = 0;
  while ((match = PLACEHOLDER_REGEX.exec(content)) !== null) {
    const key = match[1];
    const def = match[2] || null;
    if (map.has(key)) {
      map.get(key).count++;
    } else {
      map.set(key, { key, default: def, count: 1 });
    }
  }
  return Array.from(map.values());
}

/**
 * Replace placeholders in content with provided values.
 * @param {string} content
 * @param {Map<string,string>} values - key -> replacement
 * @returns {string}
 */
function replacePlaceholders(content, values) {
  return content.replace(PLACEHOLDER_REGEX, (match, key, def) => {
    return values.has(key) ? values.get(key) : (def !== undefined ? def : match);
  });
}

/**
 * Prompt user for input (simple readline).
 */
function prompt(question) {
  return new Promise((resolvePromise) => {
    const rl = createInterface({
      input: processStdin,
      output: processStdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolvePromise(answer.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  const rootDir = resolve('.');
  const fIdx = args.indexOf('-f');
  const memPath = fIdx !== -1 ? resolve(args[fIdx + 1]) : findMemFile(rootDir);

  if (!memPath || !existsSync(memPath)) {
    console.error('Error: No .mem file found.');
    process.exit(1);
  }

  const content = readFileSync(memPath, 'utf-8');
  const placeholders = findPlaceholders(content);

  if (placeholders.length === 0) {
    console.log('\n  ✅ No placeholders found in .mem\n');
    process.exit(0);
  }

  // --dry-run: list placeholders
  if (args.includes('--dry-run')) {
    console.log(`\nPlaceholders in ${memPath}:\n`);
    for (const p of placeholders) {
      const def = p.default ? ` (default: "${p.default}")` : '';
      console.log(`  {{${p.key}}}${def} — ${p.count} occurrence(s)`);
    }
    console.log('');
    process.exit(0);
  }

  // --clear: replace all placeholders with empty string
  if (args.includes('--clear')) {
    const cleared = content.replace(PLACEHOLDER_REGEX, '');
    writeFileSync(memPath, cleared, 'utf-8');
    console.log(`\n  ✅ Cleared ${placeholders.length} placeholder(s)\n`);
    process.exit(0);
  }

  // --set KEY=VAL
  const setArgs = [];
  const setIdx = args.indexOf('--set');
  if (setIdx !== -1) {
    for (let i = setIdx + 1; i < args.length && !args[i].startsWith('-'); i++) {
      setArgs.push(args[i]);
    }
  }

  if (setArgs.length > 0) {
    const values = new Map();
    for (const kv of setArgs) {
      const eqIdx = kv.indexOf('=');
      if (eqIdx === -1) {
        console.error(`Error: Invalid --set format "${kv}". Use KEY=VAL`);
        process.exit(1);
      }
      values.set(kv.slice(0, eqIdx), kv.slice(eqIdx + 1));
    }

    const replaced = replacePlaceholders(content, values);
    writeFileSync(memPath, replaced, 'utf-8');
    console.log(`\n  ✅ Set ${values.size} placeholder(s)\n`);
    process.exit(0);
  }

  // Interactive mode
  console.log(`\nFilling placeholders in ${memPath}:\n`);
  const values = new Map();
  for (const p of placeholders) {
    const def = p.default || '';
    const hint = def ? ` [${def}]` : '';
    const answer = await prompt(`  {{${p.key}}}${hint}: `);
    values.set(p.key, answer || def);
  }

  const replaced = replacePlaceholders(content, values);
  writeFileSync(memPath, replaced, 'utf-8');
  console.log(`\n  ✅ Filled ${values.size} placeholder(s)\n`);
}

main().catch(err => { console.error(`Error: ${err.message}`); process.exit(1); });
