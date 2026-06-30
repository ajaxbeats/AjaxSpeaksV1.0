#!/usr/bin/env node
/**
 * _AJAXREADS — Discover all context files and build/update .mem
 *
 * Usage:
 *   _AJAXREADS                      Build .mem for current project
 *   _AJAXREADS -o FILE.mem          Write to specific path
 *   _AJAXREADS --dry-run            Print to stdout
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import { getAjaxSpeaksHome, getProjectDir, getCurrentProjectName } from './utils.js';

function usage() {
  console.log(`\n_AJAXREADS — Discover context and build .mem\n`);
  console.log(`  _AJAXREADS              Build .mem for current project`);
  console.log(`  _AJAXREADS -o FILE.mem  Write to specific path`);
  console.log(`  _AJAXREADS --dry-run    Print to stdout\n`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  const rootDir = resolve('.');
  const projectName = getCurrentProjectName();
  const isDryRun = args.includes('--dry-run');

  // Determine output path
  const oIdx = args.indexOf('-o');
  let outputPath;
  if (oIdx !== -1 && args[oIdx + 1]) {
    outputPath = resolve(args[oIdx + 1]);
  } else {
    const projDir = getProjectDir(projectName);
    outputPath = join(projDir, `${projectName}.mem`);
  }

  // Gather context from common files
  const contextFiles = [
    'CLAUDE.md',
    '.cursorrules',
    '.clinerules',
    '.github/copilot-instructions.md',
    '.continue/config.json',
    'README.md',
    'package.json',
    'build.gradle',
    '.env.example',
    '.env',
  ];

  let sections = [];

  // Scan for !mem sections in existing .mem first (to preserve history)
  const existingMem = join(getAjaxSpeaksHome(), 'projects', projectName, `${projectName}.mem`);
  if (existsSync(existingMem)) {
    const existing = readFileSync(existingMem, 'utf-8');
    const lines = existing.split('\n');
    let inMem = false;
    let memBlock = [];
    for (const line of lines) {
      if (line.startsWith('!mem ')) {
        inMem = true;
        memBlock.push(line);
      } else if (inMem && line.startsWith('!')) {
        inMem = false;
        memBlock.push('');
      } else if (inMem) {
        memBlock.push(line);
      }
    }
    if (memBlock.length > 0) {
      sections.push(memBlock.join('\n'));
    }
  }

  // Read context files to extract metadata
  for (const file of contextFiles) {
    const filePath = join(rootDir, file);
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8').trim();
        if (content.length > 0) {
          sections.push(`# From ${file}\n${content}`);
        }
      } catch { /* skip unreadable files */ }
    }
  }

  // Check for other .md files in root
  try {
    const files = readdirSync(rootDir);
    for (const file of files) {
      if (file.endsWith('.md') && !contextFiles.includes(file) && file !== 'node_modules') {
        const filePath = join(rootDir, file);
        try {
          const content = readFileSync(filePath, 'utf-8').slice(0, 2000); // first 2KB
          if (content.trim().length > 0) {
            sections.push(`# From ${file}\n${content}`);
          }
        } catch { /* skip */ }
      }
    }
  } catch { /* directory read error */ }

  const output = sections.join('\n\n---\n\n');
  
  if (isDryRun) {
    console.log(output);
  } else {
    writeFileSync(outputPath, output, 'utf-8');
    console.log(`\nAjaxSpeaks read complete.`);
    console.log(`Memory → ${outputPath}`);
  }
}

main();