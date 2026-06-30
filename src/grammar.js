#!/usr/bin/env node
/**
 * grammar.js — Token estimation and .mem syntax utilities.
 *
 * AjaxSpeaks uses a simple `!keyword` + indented content format:
 *   !meta
 *     name = ProjectName
 *   !deps
 *     npm: some-package
 *   !mem 2026-06-30
 *     feat: description
 *   !rules
 *     - Always do X
 *   !arch
 *     src/ :: description
 *   !files
 *     path/to/file :: tag description
 */

/**
 * Estimate token count for a string.
 * Rough approximation: ~4 chars per token for code, ~5 for prose.
 */
export function estimateTokens(text) {
  // More accurate: split by whitespace + punctuation boundaries
  const tokens = text.split(/\s+|(?<=[a-z])(?=[A-Z])|_|(?<=[a-zA-Z])(?=\d)|(?<=\d)(?=[a-zA-Z])/);
  let count = 0;
  for (const t of tokens) {
    if (t.length === 0) continue;
    // Code tokens are denser (~3 chars/token), prose is ~5
    const isCode = /[{}[\]();=<>/]/.test(t);
    count += isCode ? Math.ceil(t.length / 3) : Math.ceil(t.length / 4);
  }
  return Math.max(1, count);
}

/**
 * Estimate tokens with verbose breakdown (for --stats).
 */
export function estimateTokensVerbose(text) {
  const total = estimateTokens(text);
  return total;
}

/**
 * Validate a .mem section header.
 * Headers must match: !word or !word YYYY-MM-DD
 */
export function isValidHeader(line) {
  return /^\![a-z]+\s*(\d{4}-\d{2}-\d{2})?$/.test(line.trim());
}

/**
 * Check if text looks like valid .mem content.
 */
export function isValidMem(source) {
  if (!source || source.trim().length === 0) return false;
  const lines = source.split('\n');
  let hasHeader = false;
  for (const line of lines) {
    if (line.trim().startsWith('!')) {
      if (isValidHeader(line)) hasHeader = true;
    }
  }
  return hasHeader;
}