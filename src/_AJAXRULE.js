#!/usr/bin/env node
/**
 * _AJAXRULE — Manage persistent AjaxSpeaks rules in AI tools.
 *
 * Usage:
 *   _AJAXRULE --save              Save rule to all detected AI tools
 *   _AJAXRULE --save --to TARGET  Save to specific tool
 *   _AJAXRULE --unsave            Remove from all tools
 *   _AJAXRULE --unsave --to TARGET Remove from specific tool
 *   _AJAXRULE --list              List installed rules  
 *   _AJAXRULE --status            Check which tools have rules present
 *   _AJAXRULE --backup            Backup all projects + rules
 *
 * Targets: claude-code, claude-desktop, cline, cursor, copilot, continue
 */

import {
  saveRule, unsaveRule, saveAllRules, unsaveAllRules,
  checkRuleStatus, backupAll, SUPPORTED_TOOLS,
} from './rules.js';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  cyan: '\x1b[36m', red: '\x1b[31m', dim: '\x1b[2m',
};

const TOOLS_LIST = SUPPORTED_TOOLS.join(', ');

function usage() {
  console.log(`\n_AJAXRULE — Manage AjaxSpeaks persistent rules\n`);
  console.log(`  _AJAXRULE --save              Save to all detected AI tools`);
  console.log(`  _AJAXRULE --save --to TARGET  Save to specific tool`);
  console.log(`  _AJAXRULE --unsave            Remove from all tools`);
  console.log(`  _AJAXRULE --unsave --to TARGET Remove from specific tool`);
  console.log(`  _AJAXRULE --list              List installed rules`);
  console.log(`  _AJAXRULE --status            Check which tools have rules`);
  console.log(`  _AJAXRULE --backup            Backup all projects + rules`);
  console.log(`\nTargets: ${TOOLS_LIST}\n`);
}

function printResults(results) {
  for (const r of results) {
    if (r.success) {
      console.log(`  ${C.green}✓${C.reset} ${r.message}`);
    } else {
      console.log(`  ${C.red}✗${C.reset} ${r.error || r.message}`);
    }
  }
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    usage();
    process.exit(0);
  }

  // --list: show supported tools
  if (args.includes('--list')) {
    console.log('\nSupported AI tools:');
    for (const t of SUPPORTED_TOOLS) console.log(`  ${t}`);
    console.log('');
    process.exit(0);
  }

  if (args.includes('--status')) {
    console.log(`\n${C.bold}AjaxSpeaks Rule Status:${C.reset}\n`);
    const statuses = checkRuleStatus();
    for (const s of statuses) {
      const icon = s.installed ? `${C.green}✓${C.reset}` : `${C.dim} ${C.reset}`;
      const state = s.installed ? `${C.green}installed${C.reset}` : `${C.dim}not installed${C.reset}`;
      console.log(`  ${icon} ${s.label.padEnd(20)} ${state}`);
      console.log(`     ${C.dim}${s.path}${C.reset}`);
    }
    console.log('');
    process.exit(0);
  }

  if (args.includes('--backup')) {
    console.log(`\n${C.bold}Backing up AjaxSpeaks data...${C.reset}\n`);
    const { backupDir, manifest } = backupAll();
    console.log(`  ${C.green}✓${C.reset} Backup created: ${C.dim}${backupDir}${C.reset}`);
    console.log(`  ${C.green}✓${C.reset} Projects backed up: ${manifest.projects.length}`);
    console.log(`  ${C.green}✓${C.reset} AI tool configs snapshotted: ${manifest.aiToolConfigs.length}`);
    console.log('');
    process.exit(0);
  }

  const toIdx = args.indexOf('--to');
  const target = toIdx !== -1 && args[toIdx + 1] ? args[toIdx + 1] : null;

  if (target && !SUPPORTED_TOOLS.includes(target)) {
    console.error(`${C.red}✗ Error: Unknown target "${target}". Available: ${TOOLS_LIST}${C.reset}`);
    process.exit(1);
  }

  if (args.includes('--save')) {
    console.log(`\n${C.bold}Saving AjaxSpeaks rule...${C.reset}\n`);
    const results = target ? [saveRule(target)] : saveAllRules();
    printResults(results);
    console.log('');
    process.exit(0);
  }

  // --unsave
  if (args.includes('--unsave')) {
    console.log(`\n${C.bold}Removing AjaxSpeaks rule...${C.reset}\n`);
    const results = target ? [unsaveRule(target)] : unsaveAllRules();
    printResults(results);
    console.log('');
    process.exit(0);
  }

  console.error(`${C.red}✗ Error: Unknown flags. Use --help for usage.${C.reset}`);
  process.exit(1);
}

main();