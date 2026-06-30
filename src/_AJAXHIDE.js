#!/usr/bin/env node
/**
 * _AJAXHIDE — Scan .mem for secrets before sharing.
 *
 * Scans for 10 common secret patterns:
 *   🔴 Critical: API keys, tokens, passwords, AWS keys, private keys, connection strings
 *   🟠 High:     Credentials in URLs, .env vars with secrets
 *   🟡 Medium:   Suspicious-looking config values
 *
 * Usage:
 *   _AJAXHIDE              Scan current project's .mem
 *   _AJAXHIDE -f FILE.mem  Scan specific .mem file
 *   _AJAXHIDE --fix        Redact found secrets in-place
 *   _AJAXHIDE --dry-run    Show what would be redacted
 *   _AJAXHIDE --quiet      Machine-readable output (JSON)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { findMemFile } from './utils.js';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  cyan: '\x1b[36m', yellow: '\x1b[33m', red: '\x1b[31m', dim: '\x1b[2m',
};

// ─── Secret Patterns ──────────────────────────────────────────────────────────
// Each pattern has: regex, severity, label, replacement hint

const SECRET_PATTERNS = [
  // 🔴 Critical
  {
    name: 'API Key (generic)',
    regex: /(?:api[_-]?key|apikey)[=:]["']?([a-zA-Z0-9_\-]{20,})["']?/gi,
    severity: 'critical',
    icon: '🔴',
    group: 1,
    hint: '***API-KEY-REDACTED***',
  },
  {
    name: 'Bearer / Auth Token',
    regex: /(?:bearer|token|auth_token|access_token)[=:]\s*["']?([a-zA-Z0-9_\-\.]{20,})["']?/gi,
    severity: 'critical',
    icon: '🔴',
    group: 1,
    hint: '***TOKEN-REDACTED***',
  },
  {
    name: 'Password',
    regex: /(?:password|passwd|pwd)[=:]["']?([^\s"']{6,})["']?/gi,
    severity: 'critical',
    icon: '🔴',
    group: 1,
    hint: '***PASSWORD-REDACTED***',
  },
  {
    name: 'AWS Access Key',
    regex: /(AKIA[0-9A-Z]{16})/g,
    severity: 'critical',
    icon: '🔴',
    group: 0,
    hint: '***AWS-KEY-REDACTED***',
  },
  {
    name: 'Private Key / Certificate',
    regex: /(-----BEGIN\s?(?:RSA\s?)?PRIVATE\s?KEY-----)/g,
    severity: 'critical',
    icon: '🔴',
    group: 0,
    hint: '***PRIVATE-KEY-REDACTED***',
  },
  {
    name: 'Connection String',
    regex: /(mongodb(?:\+srv)?:\/\/[^\s]+)/g,
    severity: 'critical',
    icon: '🔴',
    group: 0,
    hint: '***CONNECTION-STRING-REDACTED***',
  },
  // 🟠 High
  {
    name: 'Credentials in URL',
    regex: /(https?:\/\/)[^:\/\s]+:[^@\s]+@/g,
    severity: 'high',
    icon: '🟠',
    group: 0,
    hint: '$1***CREDENTIALS-REDACTED***@',
  },
  {
    name: 'JWT Token',
    regex: /(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g,
    severity: 'high',
    icon: '🟠',
    group: 0,
    hint: '***JWT-REDACTED***',
  },
  // 🟡 Medium
  {
    name: '.env variable with secret',
    regex: /(SECRET|SECRET_KEY|SECRET_TOKEN|JWT_SECRET|ENCRYPTION_KEY)[=:]["']?([^\s"']{8,})["']?/g,
    severity: 'medium',
    icon: '🟡',
    group: 0,
    hint: '$1=***REDACTED***',
  },
  {
    name: 'Slack / Discord Webhook',
    regex: /(https:\/\/hooks\.slack\.com\/services\/[^\s]+|https:\/\/discord\.com\/api\/webhooks\/[^\s]+)/g,
    severity: 'high',
    icon: '🟠',
    group: 0,
    hint: '***WEBHOOK-REDACTED***',
  },
];

// ─── Core Logic ───────────────────────────────────────────────────────────────

function usage() {
  console.log(`\n_AJAXHIDE — Scan .mem for secrets\n`);
  console.log(`  _AJAXHIDE              Scan current project's .mem`);
  console.log(`  _AJAXHIDE -f FILE.mem  Scan specific .mem file`);
  console.log(`  _AJAXHIDE --fix        Redact secrets in-place`);
  console.log(`  _AJAXHIDE --dry-run    Show what would be redacted`);
  console.log(`  _AJAXHIDE --quiet      Machine-readable JSON output\n`);
}

/**
 * Scan content for all secret patterns.
 * @returns {Array<{pattern, match, index, severity, icon}>}
 */
function scan(content) {
  const findings = [];
  for (const pattern of SECRET_PATTERNS) {
    let match;
    // Reset lastIndex
    pattern.regex.lastIndex = 0;
    while ((match = pattern.regex.exec(content)) !== null) {
      const matchedText = match[0];
      // For grouped patterns, the secret value is the capture group
      const secretVal = pattern.group > 0 ? match[pattern.group] : match[0];
      findings.push({
        pattern: pattern,
        name: pattern.name,
        severity: pattern.severity,
        icon: pattern.icon,
        match: matchedText,
        value: secretVal,
        index: match.index,
        length: matchedText.length,
      });
    }
  }
  return findings;
}

/**
 * Redact all secrets in content.
 * @returns {{ redacted: string, count: number }}
 */
function redact(content) {
  let result = content;
  let count = 0;

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    result = result.replace(pattern.regex, () => {
      count++;
      return pattern.hint;
    });
  }

  return { redacted: result, count };
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

  const content = readFileSync(memPath, 'utf-8');
  const isFix = args.includes('--fix');
  const isDryRun = args.includes('--dry-run');
  const isQuiet = args.includes('--quiet');

  const findings = scan(content);

  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');

  if (isQuiet) {
    console.log(JSON.stringify({
      file: memPath, total: findings.length,
      critical: critical.length, high: high.length, medium: medium.length,
      findings: findings.map(f => ({ name: f.name, severity: f.severity, value: f.value.slice(0, 20) + '...', index: f.index })),
    }, null, 2));
    process.exit(0);
  }

  console.log(`\n${C.bold}Scanning:${C.reset} ${C.dim}${memPath}${C.reset}\n`);

  if (findings.length === 0) {
    console.log(`  ${C.green}${C.bold}✓ No secrets found — safe to share!${C.reset}\n`);
    process.exit(0);
  }

  console.log(`  ${C.red}${C.bold}Found ${findings.length} potential secret(s):${C.reset}\n`);
  for (const f of findings) {
    const truncated = f.value.length > 40 ? f.value.slice(0, 20) + '...' + f.value.slice(-10) : f.value;
    console.log(`  ${f.icon} ${C.bold}[${f.severity.toUpperCase()}]${C.reset} ${f.name}`);
    console.log(`     ${C.dim}${truncated}${C.reset}`);
  }

  console.log(`\n  ${C.dim}Summary: ${critical.length} critical, ${high.length} high, ${medium.length} medium${C.reset}\n`);

  if (isFix || isDryRun) {
    const { redacted, count } = redact(content);
    if (isDryRun) {
      console.log(`${C.yellow}--- DRY RUN: Would redact ${count} secrets ---${C.reset}`);
      console.log(redacted);
      console.log(`${C.yellow}--- END DRY RUN ---${C.reset}\n`);
      process.exit(0);
    }
    writeFileSync(memPath, redacted, 'utf-8');
    console.log(`  ${C.green}${C.bold}✓ Redacted ${count} secret(s)${C.reset} ${C.dim}in ${memPath}${C.reset}\n`);
    process.exit(0);
  }

  console.log(`  ${C.cyan}💡 Run with --fix to redact these secrets${C.reset}\n`);
}

main();
