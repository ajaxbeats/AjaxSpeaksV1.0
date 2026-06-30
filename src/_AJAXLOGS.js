#!/usr/bin/env node
/**
 * _AJAXLOGS — Append a !mem entry and auto-archive old sessions.
 *
 * Usage:
 *   _AJAXLOGS "add: built the feature"
 *   _AJAXLOGS "fix: commit abc123, removed dead code"
 *   _AJAXLOGS --date 2026-06-25 "!! critical insight"
 *   _AJAXLOGS --list               Show recent !mem entries
 *   _AJAXLOGS --archive            Archive oldest session manually
 *   _AJAXLOGS -f FILE.mem          Use specific file
 *
 * Auto-archiving:
 *   When !mem has 4+ date headers, the oldest is moved to {name}.archive.mem.
 *   Keeps the rolling window to 3 sessions.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { resolve, join, basename } from 'path';
import { findMemFile, getProjectDir, getCurrentProjectName } from './utils.js';

const MAX_ACTIVE_SESSIONS = 3;

function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function usage() {
  console.log(`\n_AJAXLOGS — Append !mem entry + auto-archive\n`);
  console.log(`  _AJAXLOGS "entry text"          Append to today's !mem`);
  console.log(`  _AJAXLOGS --date YYYY-MM-DD txt  Append to specific date`);
  console.log(`  _AJAXLOGS --list                 Show recent !mem dates`);
  console.log(`  _AJAXLOGS --archive              Archive oldest session`);
  console.log(`  _AJAXLOGS -f FILE.mem            Use specific .mem file\n`);
}

function countMemSessions(source) {
  let count = 0;
  for (const line of source.split('\n')) {
    if (/^\!mem\s+\d{4}-\d{2}-\d{2}/.test(line.trim())) count++;
  }
  return count;
}

function archiveOldestSession(memPath) {
  const source = readFileSync(memPath, 'utf-8');
  const lines = source.split('\n');
  const dir = memPath.split('/').slice(0, -1).join('/');
  const baseName = basename(memPath, '.mem');
  const archivePath = join(dir, `${baseName}.archive.mem`);

  // Find the first !mem date header and its block
  let firstDateIdx = -1;
  let firstDateLine = '';
  let blockEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    if (/^\!mem\s+\d{4}-\d{2}-\d{2}/.test(lines[i].trim())) {
      if (firstDateIdx === -1) {
        firstDateIdx = i;
        firstDateLine = lines[i];
      }
    }
    if (firstDateIdx !== -1 && i > firstDateIdx && lines[i].startsWith('!') && !lines[i].startsWith('!mem')) {
      blockEnd = i;
      break;
    }
  }

  if (firstDateIdx === -1) {
    console.log('No sessions to archive.');
    return;
  }

  // Find where this first session's block ends (next !mem or next section)
  let sessionEnd = firstDateIdx + 1;
  while (sessionEnd < lines.length) {
    const t = lines[sessionEnd].trim();
    if (t.startsWith('!mem ') && t !== firstDateLine) break;
    if (t.startsWith('!') && !t.startsWith('!mem')) break;
    sessionEnd++;
  }

  // Extract the archived block (including blank lines before/within)
  const archivedLines = lines.slice(firstDateIdx, sessionEnd);
  let preBlank = firstDateIdx;
  while (preBlank > 0 && lines[preBlank - 1].trim() === '') preBlank--;
  const fullArchived = lines.slice(preBlank, sessionEnd);

  // Remove from source
  const remaining = [...lines.slice(0, preBlank), ...lines.slice(sessionEnd)];

  // Append to archive file
  const archiveContent = fullArchived.join('\n') + '\n';
  if (existsSync(archivePath)) {
    appendFileSync(archivePath, archiveContent, 'utf-8');
  } else {
    writeFileSync(archivePath, `# Archived !mem sessions from ${baseName}.mem\n${archiveContent}`, 'utf-8');
  }

  // Write back the cleaned source
  const cleaned = remaining.join('\n').trimEnd() + '\n';
  writeFileSync(memPath, cleaned, 'utf-8');

  console.log(`Archived: ${firstDateLine.trim()} → ${basename(archivePath)}`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.length === 0) { usage(); process.exit(0); }

  const rootDir = resolve('.');
  const fIdx = args.indexOf('-f');
  const memPath = fIdx !== -1 ? resolve(args[fIdx + 1]) : findMemFile(rootDir);

  if (!memPath || !existsSync(memPath)) {
    console.log('No .mem file found. Run _AJAXREADS first.');
    process.exit(1);
  }

  // --list: show existing !mem entries
  if (args.includes('--list')) {
    const source = readFileSync(memPath, 'utf-8');
    const lines = source.split('\n');
    let inMem = false;
    let count = 0;
    console.log(`!mem sessions in ${basename(memPath)}:`);
    for (const line of lines) {
      if (line.startsWith('!mem ')) {
        console.log(`  ${line.trim()}`);
        count++;
        inMem = true;
      } else if (inMem && line.startsWith('!')) {
        inMem = false;
      }
    }
    if (count === 0) console.log('  (none)');
    process.exit(0);
  }

  // --archive: manually archive the oldest session
  if (args.includes('--archive')) {
    archiveOldestSession(memPath);
    process.exit(0);
  }

  // Determine date
  let dateStr = today();
  const dateIdx = args.indexOf('--date');
  if (dateIdx !== -1 && args[dateIdx + 1]) {
    dateStr = args[dateIdx + 1];
  }

  // Extract entry text (first non-flag argument)
  const entryText = args.find(a => !a.startsWith('-'));
  if (!entryText) {
    console.error('Error: No entry text provided.');
    console.log('  _AJAXLOGS "add: description of what happened"');
    process.exit(1);
  }

  // Read existing file
  let source = readFileSync(memPath, 'utf-8');
  const lines = source.split('\n');

  // Find the !mem section range
  let memStart = -1;
  let memEnd = -1;
  let nextSectionStart = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('!mem ')) {
      if (memStart === -1) memStart = i;
      memEnd = i;
    } else if (lines[i].startsWith('!') && memStart !== -1 && memEnd !== -1) {
      nextSectionStart = i;
      break;
    }
  }

  // If no !mem section at all, find where to insert one
  if (memStart === -1) {
    let lastSectionEnd = lines.length;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('!') && !lines[i].startsWith('!mem')) {
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('!')) {
            lastSectionEnd = j;
            break;
          }
        }
        break;
      }
    }

    const newEntry = `  ${entryText}`;
    const newLines = ['', `!mem ${dateStr}`, newEntry, ''];

    let insertAt = lastSectionEnd;
    while (insertAt > 0 && lines[insertAt - 1].trim() === '') insertAt--;

    lines.splice(insertAt, 0, ...newLines);
    source = lines.join('\n');
    writeFileSync(memPath, source, 'utf-8');
    console.log(`Logged to ${basename(memPath)}: !mem ${dateStr}`);
    console.log(`  ${entryText}`);
    process.exit(0);
  }

  // Find today's date header in existing !mem section
  let todayHeaderIdx = -1;
  const dateHeaderStr = `!mem ${dateStr}`;
  for (let i = memStart; i < (nextSectionStart > -1 ? nextSectionStart : lines.length); i++) {
    if (lines[i].trim() === dateHeaderStr) {
      todayHeaderIdx = i;
      break;
    }
  }

  if (todayHeaderIdx !== -1) {
    const newLine = `  ${entryText}`;
    let insertAt = todayHeaderIdx + 1;
    while (insertAt < lines.length) {
      const trimmed = lines[insertAt].trim();
      if (trimmed.startsWith('!') && !trimmed.startsWith('!mem')) break;
      if (trimmed.startsWith('!mem ')) break;
      if (trimmed === '') break;
      insertAt++;
    }
    lines.splice(insertAt, 0, newLine);
    source = lines.join('\n');
    writeFileSync(memPath, source, 'utf-8');
    console.log(`Logged to ${basename(memPath)}: !mem ${dateStr}`);
    console.log(`  ${entryText}`);
  } else {
    let insertAt = memEnd + 1;
    while (insertAt < lines.length && lines[insertAt].trim() === '') insertAt++;
    const newLines = [`!mem ${dateStr}`, `  ${entryText}`];
    lines.splice(insertAt, 0, ...newLines);
    source = lines.join('\n');
    writeFileSync(memPath, source, 'utf-8');
    console.log(`Logged to ${basename(memPath)}: !mem ${dateStr}`);
    console.log(`  ${entryText}`);
  }

  // Check if we need to archive old sessions
  const sessionCount = countMemSessions(source);
  if (sessionCount > MAX_ACTIVE_SESSIONS) {
    archiveOldestSession(memPath);
  }
}

main();