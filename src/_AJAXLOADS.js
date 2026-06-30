#!/usr/bin/env node
/**
 * _AJAXLOADS — Load .mem with smart archive support.
 *
 * Usage:
 *   _AJAXLOADS                      Load {project}.mem (active only)
 *   _AJAXLOADS --archive            Load {project}.mem + {project}.archive.mem
 *   _AJAXLOADS --to TARGET          Load for specific AI tool
 *   _AJAXLOADS --archive --to TARGET  Load all history for AI tool
 *   _AJAXLOADS -f FILE.mem          Load specific .mem file
 *   _AJAXLOADS --dry-run            Print to stdout (no file write)
 *   _AJAXLOADS --list               List available targets
 *   _AJAXLOADS --stats              Show token counts
 *
 * Targets: claude-code, claude-desktop, cursor, cline, copilot,
 *          continue, deepseek, gemini, grok, openai, generic
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, basename } from 'path';
import { load, listTargets } from './loader.js';
import { estimateTokensVerbose } from './grammar.js';
import { findMemFile, getAjaxSpeaksHome, getCurrentProjectName } from './utils.js';

const AI_DETECTION = [
  { files: ['.clinerules'], env: 'CLINE_CONFIG', target: 'cline' },
  { files: ['.cursorrules', '.cursor'], env: null, target: 'cursor' },
  { files: ['CLAUDE.md', '.claude'], env: null, target: 'claude-code' },
  { files: ['.github/copilot-instructions.md'], env: null, target: 'copilot' },
  { files: ['.continue'], env: null, target: 'continue' },
];

const OUTPUT_FILES = {
  cline: '.clinerules',
  cursor: '.cursorrules',
  'claude-code': 'CLAUDE.md',
  'claude-desktop': 'CLAUDE.md',
  copilot: '.github/copilot-instructions.md',
  gemini: null, openai: null, grok: null, deepseek: null, generic: null,
};

function detectAITool(dir) {
  for (const { files, env, target } of AI_DETECTION) {
    for (const file of files) {
      if (existsSync(join(dir, file))) return target;
    }
    if (env && process.env[env]) return target;
  }
  return 'generic';
}

function usage() {
  console.log(`\n_AJAXLOADS — Load .mem with archive support\n`);
  console.log(`  _AJAXLOADS                      Load active memory`);
  console.log(`  _AJAXLOADS --archive            Include archived sessions`);
  console.log(`  _AJAXLOADS --to TARGET          Format for AI tool`);
  console.log(`  _AJAXLOADS --archive --to TARGET  All history for tool`);
  console.log(`  _AJAXLOADS -f FILE.mem          Specific file`);
  console.log(`  _AJAXLOADS --dry-run            Print only (no write)`);
  console.log(`  _AJAXLOADS --stats              Show token counts`);
  console.log(`  _AJAXLOADS --list               List AI tool targets`);
  console.log(`\nTargets: ${listTargets().join(', ')}\n`);
}

function countDateHeaders(source) {
  let count = 0;
  for (const line of source.split('\n')) {
    if (/^\!mem\s+\d{4}-\d{2}-\d{2}/.test(line.trim())) count++;
  }
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  if (args.includes('--list')) {
    console.log('Available AI tools:'); for (const t of listTargets()) console.log(`  ${t}`);
    process.exit(0);
  }

  const rootDir = resolve('.');
  const fIdx = args.indexOf('-f');
  const memPath = fIdx !== -1 ? resolve(args[fIdx + 1]) : findMemFile(rootDir);

  if (!memPath || !existsSync(memPath)) {
    console.error('Error: No .mem file found. Run _AJAXREADS first.');
    process.exit(1);
  }

  // Determine target
  const toIdx = args.indexOf('--to');
  const target = toIdx !== -1 && args[toIdx + 1]
    ? args[toIdx + 1]
    : detectAITool(rootDir);

  const validTargets = listTargets();
  if (!validTargets.includes(target)) {
    console.error(`Error: Unknown target "${target}". Available: ${validTargets.join(', ')}`);
    process.exit(1);
  }

  // Determine output file
  const outputFile = OUTPUT_FILES[target];
  const oIdx = args.indexOf('-o');
  const outputPath = oIdx !== -1
    ? resolve(args[oIdx + 1])
    : (outputFile ? join(rootDir, outputFile) : null);

  const includeArchive = args.includes('--archive');
  const isDryRun = args.includes('--dry-run');
  const showStats = args.includes('--stats');

  // Read main .mem
  const mainSource = readFileSync(memPath, 'utf-8');

  // Optionally read archive
  const dir = memPath.split('/').slice(0, -1).join('/');
  const baseName = basename(memPath, '.mem');
  const archivePath = join(dir, `${baseName}.archive.mem`);

  let fullSource = mainSource;
  if (includeArchive && existsSync(archivePath)) {
    const archiveSource = readFileSync(archivePath, 'utf-8');
    fullSource = mainSource + '\n' + archiveSource;
  }

  // Format for target
  const result = load(fullSource, target);
  const output = result.output;

  if (outputPath && !isDryRun) {
    writeFileSync(outputPath, output, 'utf-8');
    const tokens = estimateTokensVerbose(output);
    console.log(`\nAjaxSpeaks loaded.`);
    console.log(`Context → ${outputPath}`);
    console.log(`~${tokens} tokens (target: ${target})`);
    if (includeArchive) console.log('(includes archived sessions)');
  } else {
    console.log(output);
    if (outputPath && isDryRun) {
      console.log(`\n--- DRY RUN: Would write to ${outputPath} ---`);
    }
  }

  if (showStats) {
    console.error(`\nStats:`);
    console.error(`  Target: ${target}`);
    console.error(`  Active sessions: ${countDateHeaders(mainSource)}`);
    console.error(`  Archived sessions: ${includeArchive ? countDateHeaders(fullSource) - countDateHeaders(mainSource) : 0}`);
    console.error(`  Tokens: ~${estimateTokensVerbose(output)}`);
  }
}

main().catch(err => { console.error(`Error: ${err.message}`); process.exit(1); });