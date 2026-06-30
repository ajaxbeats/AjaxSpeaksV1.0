#!/usr/bin/env node
/**
 * _AJAXFORGETS — Wipe the .mem file.
 *
 * Usage:
 *   _AJAXFORGETS                    Wipe current project's .mem
 *   _AJAXFORGETS -f FILE.mem        Wipe specific .mem file
 *   _AJAXFORGETS --dry-run          Print what would be wiped
 */

import { writeFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { findMemFile } from './utils.js';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  cyan: '\x1b[36m', red: '\x1b[31m', dim: '\x1b[2m',
};

function usage() {
  console.log(`\n_AJAXFORGETS — Wipe .mem file\n`);
  console.log(`  _AJAXFORGETS              Wipe current project's .mem`);
  console.log(`  _AJAXFORGETS -f FILE.mem  Wipe specific file`);
  console.log(`  _AJAXFORGETS --dry-run    Print what would be wiped\n`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  const rootDir = resolve('.');
  const fIdx = args.indexOf('-f');
  const memPath = fIdx !== -1 ? resolve(args[fIdx + 1]) : findMemFile(rootDir);

  if (!memPath || !existsSync(memPath)) {
    console.error(`${C.red}✗ Error: No .mem file found.${C.reset}`);
    process.exit(1);
  }

  const isDryRun = args.includes('--dry-run');

  if (isDryRun) {
    console.log(`\nWould wipe: ${memPath}\n`);
    process.exit(0);
  }

  // Write minimal template
  const template = `# AjaxSpeaks — Project Memory\n# Wiped by _AJAXFORGETS on ${new Date().toISOString().slice(0, 10)}\n\n!meta\n  name = ${basename(rootDir)}\n`;
  writeFileSync(memPath, template, 'utf-8');
  console.log(`\n${C.green}${C.bold}✓ Forgotten.${C.reset} ${C.dim}${memPath}${C.reset}\n`);
}

main();