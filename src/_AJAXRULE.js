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
  saveRule,
  unsaveRule,
  saveAllRules,
  unsaveAllRules,
  checkRuleStatus,
  backupAll,
  SUPPORTED_TOOLS,
} from './rules.js';

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
      console.log(`  ✓ ${r.message}`);
    } else {
      console.log(`  ✗ ${r.error || r.message}`);
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

  // --status: check which tools have rules installed
  if (args.includes('--status')) {
    console.log('\nAjaxSpeaks Rule Status:\n');
    const statuses = checkRuleStatus();
    for (const s of statuses) {
      const icon = s.installed ? '✓' : ' ';
      console.log(`  ${icon} ${s.label.padEnd(20)} ${s.installed ? 'installed' : 'not installed'}`);
      console.log(`     ${s.path}`);
    }
    console.log('');
    process.exit(0);
  }

  // --backup: backup all projects and rules
  if (args.includes('--backup')) {
    console.log('\nBacking up AjaxSpeaks data...\n');
    const { backupDir, manifest } = backupAll();
    console.log(`  ✓ Backup created: ${backupDir}`);
    console.log(`  ✓ Projects backed up: ${manifest.projects.length}`);
    console.log(`  ✓ AI tool configs snapshotted: ${manifest.aiToolConfigs.length}`);
    console.log('');
    process.exit(0);
  }

  // Determine target
  const toIdx = args.indexOf('--to');
  const target = toIdx !== -1 && args[toIdx + 1] ? args[toIdx + 1] : null;

  if (target && !SUPPORTED_TOOLS.includes(target)) {
    console.error(`Error: Unknown target "${target}". Available: ${TOOLS_LIST}`);
    process.exit(1);
  }

  // --save
  if (args.includes('--save')) {
    console.log(`\nSaving AjaxSpeaks rule...\n`);
    const results = target ? [saveRule(target)] : saveAllRules();
    printResults(results);
    console.log('');
    process.exit(0);
  }

  // --unsave
  if (args.includes('--unsave')) {
    console.log(`\nRemoving AjaxSpeaks rule...\n`);
    const results = target ? [unsaveRule(target)] : unsaveAllRules();
    printResults(results);
    console.log('');
    process.exit(0);
  }

  // Unknown flags
  console.error(`Error: Unknown flags. Use --help for usage.`);
  process.exit(1);
}

main();