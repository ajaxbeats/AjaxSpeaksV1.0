#!/usr/bin/env node
/**
 * _AJAXREADS — Discover all context files and build/update .mem
 *
 * Usage:
 *   _AJAXREADS                      Build .mem for current project
 *   _AJAXREADS --init               Create a blank .mem template (no overwrite)
 *   _AJAXREADS -o FILE.mem          Write to specific path
 *   _AJAXREADS --dry-run            Print to stdout
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import { getAjaxSpeaksHome, getProjectDir, getCurrentProjectName } from './utils.js';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  dim: '\x1b[2m',
};

function usage() {
  console.log(`\n${C.bold}${C.cyan}_AJAXREADS${C.reset} — Discover context and build .mem\n`);
  console.log(`  _AJAXREADS              Build .mem for current project`);
  console.log(`  _AJAXREADS --init       Create a blank .mem template`);
  console.log(`  _AJAXREADS -o FILE.mem  Write to specific path`);
  console.log(`  _AJAXREADS --dry-run    Print to stdout\n`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  if (args.includes('--init')) {
    const projectName = getCurrentProjectName();
    const projDir = getProjectDir(projectName);
    const outputPath = join(projDir, `${projectName}.mem`);
    if (existsSync(outputPath)) {
      console.log(`\n${C.yellow}⚠ .mem already exists — not overwriting${C.reset}`);
      console.log(`${C.dim}  ${outputPath}${C.reset}\n`);
      process.exit(0);
    }
    const template = `!meta
  name = ${projectName}
  desc =

!arch
  src/ ::

!rules
  !!

!mem
`;
    writeFileSync(outputPath, template, 'utf-8');
    console.log(`\n${C.green}${C.bold}✓ Created .mem template${C.reset}`);
    console.log(`${C.cyan}  ${outputPath}${C.reset}\n`);
    process.exit(0);
  }

  const rootDir = resolve('.');
  const projectName = getCurrentProjectName();
  const isDryRun = args.includes('--dry-run');

  const oIdx = args.indexOf('-o');
  let outputPath;
  if (oIdx !== -1 && args[oIdx + 1]) {
    outputPath = resolve(args[oIdx + 1]);
  } else {
    const projDir = getProjectDir(projectName);
    outputPath = join(projDir, `${projectName}.mem`);
  }

  const contextFiles = [
    'CLAUDE.md', '.cursorrules', '.clinerules',
    '.github/copilot-instructions.md', '.continue/config.json',
    'README.md', 'package.json', 'build.gradle', '.env.example', '.env',
  ];

  let sections = [];

  const existingMem = join(getAjaxSpeaksHome(), 'projects', projectName, `${projectName}.mem`);
  if (existsSync(existingMem)) {
    const existing = readFileSync(existingMem, 'utf-8');
    const lines = existing.split('\n');
    let inMem = false;
    let memBlock = [];
    for (const line of lines) {
      if (line.startsWith('!mem ')) { inMem = true; memBlock.push(line); }
      else if (inMem && line.startsWith('!')) { inMem = false; memBlock.push(''); }
      else if (inMem) { memBlock.push(line); }
    }
    if (memBlock.length > 0) sections.push(memBlock.join('\n'));
  }

  let found = 0;
  for (const file of contextFiles) {
    const filePath = join(rootDir, file);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8').trim();
        if (content.length > 0) { sections.push(`# From ${file}\n${content}`); found++; }
      } catch { /* skip unreadable files */ }
    }
  }

  try {
    const files = readdirSync(rootDir);
    for (const file of files) {
      if (file.endsWith('.md') && !contextFiles.includes(file) && file !== 'node_modules') {
        const filePath = join(rootDir, file);
        try {
          const content = readFileSync(filePath, 'utf-8').slice(0, 2000);
          if (content.trim().length > 0) { sections.push(`# From ${file}\n${content}`); found++; }
        } catch { /* skip */ }
      }
    }
  } catch { /* directory read error */ }

  const output = sections.join('\n\n---\n\n');

  if (isDryRun) {
    console.log(output);
  } else {
    writeFileSync(outputPath, output, 'utf-8');
    console.log(`\n${C.green}${C.bold}✓ AjaxSpeaks read complete${C.reset} ${C.dim}(${found} files scanned)${C.reset}`);
    console.log(`${C.cyan}  Memory → ${C.reset}${outputPath}\n`);
  }
}

main();
