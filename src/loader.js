#!/usr/bin/env node
/**
 * loader.js — Parse .mem files and format for AI tool targets.
 *
 * Targets: claude-code, claude-desktop, cursor, cline, copilot, 
 *          continue, deepseek, gemini, grok, openai, generic
 */

/**
 * Parse a .mem source into structured sections.
 */
export function parse(source) {
  const lines = source.split('\n');
  const sections = [];
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    if (line.startsWith('!')) {
      if (currentSection) {
        sections.push({ header: currentSection, content: currentContent.join('\n') });
      }
      currentSection = line;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections.push({ header: currentSection, content: currentContent.join('\n') });
  }
  return sections;
}

/**
 * Format parsed .mem content for a specific AI tool target.
 */
export function load(source, target) {
  const sections = parse(source);
  let output = '';

  switch (target) {
    case 'claude-code':
    case 'claude-desktop':
      output = formatClaude(sections);
      break;
    case 'cline':
      output = formatCline(sections);
      break;
    case 'cursor':
      output = formatCursor(sections);
      break;
    case 'copilot':
      output = formatCopilot(sections);
      break;
    case 'continue':
      output = formatContinue(sections);
      break;
    case 'deepseek':
    case 'gemini':
    case 'grok':
    case 'openai':
    case 'generic':
    default:
      output = formatGeneric(sections);
      break;
  }

  return { output, sections, target };
}

/**
 * Quick load — just return the raw markdown.
 */
export function quickLoad(source) {
  return { output: source };
}

/**
 * Format .mem as markdown for Claude.
 */
function formatClaude(sections) {
  const lines = [];
  for (const section of sections) {
    if (section.header.startsWith('!meta')) {
      const metaLines = section.content.trim().split('\n');
      for (const m of metaLines) {
        const [key, ...vals] = m.split('=').map(s => s.trim());
        if (key) lines.push(`**${key}**: ${vals.join('=')}`);
      }
      lines.push('');
    } else if (section.header.startsWith('!deps')) {
      lines.push('## Dependencies');
      const depLines = section.content.trim().split('\n');
      for (const d of depLines) {
        if (d.trim()) lines.push(`- ${d.trim()}`);
      }
      lines.push('');
    } else if (section.header.startsWith('!arch')) {
      lines.push('## Architecture');
      const archLines = section.content.trim().split('\n');
      for (const a of archLines) {
        if (a.trim()) lines.push(`- ${a.trim()}`);
      }
      lines.push('');
    } else if (section.header.startsWith('!rules')) {
      lines.push('## Rules');
      const ruleLines = section.content.trim().split('\n');
      for (const r of ruleLines) {
        if (r.trim()) lines.push(`- ${r.trim()}`);
      }
      lines.push('');
    } else if (section.header.startsWith('!files')) {
      lines.push('## Key Files');
      const fileLines = section.content.trim().split('\n');
      for (const f of fileLines) {
        if (f.trim()) lines.push(`- \`${f.trim()}\``);
      }
      lines.push('');
    } else if (section.header.startsWith('!mem')) {
      const datePart = section.header.replace('!mem', '').trim();
      lines.push(`## Session: ${datePart}`);
      const memLines = section.content.trim().split('\n');
      for (const m of memLines) {
        if (m.trim()) lines.push(`- ${m.trim()}`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

/**
 * Format for Cline (.clinerules).
 */
function formatCline(sections) {
  return formatClaude(sections);
}

/**
 * Format for Cursor (.cursorrules).
 */
function formatCursor(sections) {
  return formatClaude(sections);
}

/**
 * Format for GitHub Copilot.
 */
function formatCopilot(sections) {
  return formatClaude(sections);
}

/**
 * Format for Continue.dev.
 */
function formatContinue(sections) {
  return formatClaude(sections);
}

/**
 * Generic format — plain markdown.
 */
function formatGeneric(sections) {
  return formatClaude(sections);
}

/**
 * List all available targets.
 */
export function listTargets() {
  return [
    'claude-code',
    'claude-desktop',
    'cline',
    'cursor',
    'copilot',
    'continue',
    'deepseek',
    'gemini',
    'grok',
    'openai',
    'generic',
  ];
}