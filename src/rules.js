#!/usr/bin/env node
/**
 * rules.js — AjaxSpeaks Persistent Rule Manager
 *
 * Manages saving/removing AjaxSpeaks command reference as persistent rules
 * in AI tools' global configs. Supports Claude, Cline, Cursor, Copilot, Continue.
 *
 * Usage (via _AJAXRULE):
 *   _AJAXRULE --save              Save rule to all detected AI tools
 *   _AJAXRULE --save --to TARGET  Save to specific tool
 *   _AJAXRULE --unsave            Remove from all tools
 *   _AJAXRULE --unsave --to TARGET Remove from specific tool
 *   _AJAXRULE --list              List installed rules
 *   _AJAXRULE --status            Check which tools have rules present
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync, readdirSync, cpSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { homedir } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const AS_HOME = resolve(dirname(__filename), '..');

// ─── Rule Template ───────────────────────────────────────────────────────────

export const RULE_TEMPLATE = `<!-- AjaxSpeaks Commands -->
Run these terminal commands in any project to manage AI context:

_AJAXREADS    Discover all context files and build/update .mem
_AJAXLOADS    Load .mem into this session (--archive, --dry-run, --to TARGET)
_AJAXLOGS     Log a session entry: _AJAXLOGS "fix: description"
_AJAXFORGETS  Wipe the .mem file
_AJAXHIDE     Scan .mem for secrets before sharing
_AJAXSEEK     Fill placeholder values in a shared .mem
_AJAXRULE     Manage persistent rules (--save --unsave --status)
_AJAXBEATS    Open AjaxBeats Spotify playlist

https://github.com/ajaxbeats/ajaxspeaks
`;

export const RULE_BOUNDARY_START = '<!-- AjaxSpeaks Commands -->';
export const RULE_BOUNDARY_END = 'https://github.com/ajaxbeats/ajaxspeaks';

// ─── Global Path Map ─────────────────────────────────────────────────────────

const HOME = homedir();

export const GLOBAL_RULE_PATHS = {
  'claude-code': {
    path: join(HOME, '.claude', 'CLAUDE.md'),
    type: 'append',
    label: 'Claude Code',
  },
  'claude-desktop': {
    path: (() => {
      // Try snap path first (Ubuntu), fall back to ~/.claude
      const snapPath = join(HOME, 'snap', 'claude-ai-desktop', 'current', '.config', 'claude-desktop', 'CLAUDE.md');
      if (existsSync(snapPath)) return snapPath;
      return join(HOME, '.claude', 'CLAUDE.md');
    })(),
    type: 'append',
    label: 'Claude Desktop',
  },
  'cline': {
    path: join(HOME, '.clinerules'),
    type: 'write',
    label: 'Cline',
  },
  'cursor': {
    path: join(HOME, '.cursor', 'rules', 'ajaxspeaks.mdc'),
    type: 'write',
    label: 'Cursor',
  },
  'copilot': {
    path: join(HOME, '.github', 'copilot-instructions.md'),
    type: 'append',
    label: 'GitHub Copilot',
  },
  'continue': {
    path: join(HOME, '.continue', 'config.json'),
    type: 'json-merge',
    label: 'Continue',
  },
};

export const SUPPORTED_TOOLS = Object.keys(GLOBAL_RULE_PATHS);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToolConfig(tool) {
  const config = GLOBAL_RULE_PATHS[tool];
  if (!config) return null;
  // Resolve dynamic path functions
  if (typeof config.path === 'function') {
    return { ...config, path: config.path() };
  }
  return config;
}

/**
 * Wrap rule content with AjaxSpeaks markers for easy extraction.
 */
function wrapRule(content) {
  return RULE_TEMPLATE + '\n';
}

/**
 * Check if a file already contains AjaxSpeaks rule content.
 */
function fileHasAjaxSpeaks(content) {
  return content.includes(RULE_BOUNDARY_START) && content.includes(RULE_BOUNDARY_END);
}

/**
 * Strip AjaxSpeaks rule block from content.
 */
function stripAjaxSpeaksBlock(content) {
  const startMarker = RULE_BOUNDARY_START;
  const endMarker = RULE_BOUNDARY_END;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return content;
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) return content;
  // Remove from startMarker to end of endMarker line
  const endOfLine = content.indexOf('\n', endIdx);
  const removeEnd = endOfLine !== -1 ? endOfLine + 1 : content.length;
  // Also remove preceding blank lines
  let removeStart = startIdx;
  while (removeStart > 0 && content[removeStart - 1] === '\n') removeStart--;
  return content.slice(0, removeStart) + content.slice(removeEnd);
}

/**
 * Ensure directory exists for a file path.
 */
function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

// ─── Per-Tool Save Functions ─────────────────────────────────────────────────

function saveAppend(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  ensureDir(path);

  let existing = '';
  if (existsSync(path)) {
    existing = readFileSync(path, 'utf-8');
  }

  if (fileHasAjaxSpeaks(existing)) {
    return { success: true, message: `Rule already installed for ${config.label} (${path})`, path };
  }

  const content = existing.trimEnd() + '\n\n' + RULE_TEMPLATE + '\n';
  writeFileSync(path, content, 'utf-8');

  // Also save a master copy to rules/ directory
  const masterDir = join(AS_HOME, 'rules');
  if (!existsSync(masterDir)) mkdirSync(masterDir, { recursive: true });
  const masterPath = join(masterDir, `${tool}.md`);
  writeFileSync(masterPath, RULE_TEMPLATE, 'utf-8');

  return { success: true, message: `Rule saved to ${config.label} (${path})`, path };
}

function saveWrite(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  ensureDir(path);

  // For write-type rules, we check if file exists and has our content
  if (existsSync(path)) {
    const existing = readFileSync(path, 'utf-8');
    if (fileHasAjaxSpeaks(existing)) {
      return { success: true, message: `Rule already installed for ${config.label} (${path})`, path };
    }
  }

  ensureDir(path);
  writeFileSync(path, RULE_TEMPLATE + '\n', 'utf-8');

  // Save master copy
  const masterDir = join(AS_HOME, 'rules');
  if (!existsSync(masterDir)) mkdirSync(masterDir, { recursive: true });
  const masterPath = join(masterDir, `${tool}.md`);
  writeFileSync(masterPath, RULE_TEMPLATE, 'utf-8');

  return { success: true, message: `Rule saved to ${config.label} (${path})`, path };
}

function saveJsonMerge(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  ensureDir(path);

  let configJson = {};
  if (existsSync(path)) {
    try {
      configJson = JSON.parse(readFileSync(path, 'utf-8'));
    } catch (e) {
      return { success: false, error: `Failed to parse ${path}: ${e.message}` };
    }
  }

  // For Continue, we add a customCommand entry
  if (!configJson.customCommands) {
    configJson.customCommands = [];
  }

  const existingCmd = configJson.customCommands.find(
    cmd => cmd.name === 'ajaxspeaks' || (cmd.description && cmd.description.includes('AjaxSpeaks'))
  );
  if (existingCmd) {
    return { success: true, message: `Rule already installed for Continue (${path})`, path };
  }

  configJson.customCommands.push({
    name: 'ajaxspeaks',
    description: 'AjaxSpeaks — AI context management commands',
    command: RULE_TEMPLATE.trim(),
  });

  writeFileSync(path, JSON.stringify(configJson, null, 2) + '\n', 'utf-8');

  // Save master copy
  const masterDir = join(AS_HOME, 'rules');
  if (!existsSync(masterDir)) mkdirSync(masterDir, { recursive: true });
  const masterPath = join(masterDir, `${tool}.md`);
  writeFileSync(masterPath, RULE_TEMPLATE, 'utf-8');

  return { success: true, message: `Rule saved to Continue (${path})`, path };
}

// ─── Per-Tool Unsave Functions ───────────────────────────────────────────────

function unsaveAppend(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  if (!existsSync(path)) {
    return { success: true, message: `No rule file for ${config.label} (doesn't exist)`, path };
  }

  const existing = readFileSync(path, 'utf-8');
  if (!fileHasAjaxSpeaks(existing)) {
    return { success: true, message: `No AjaxSpeaks rule found in ${config.label}`, path };
  }

  const cleaned = stripAjaxSpeaksBlock(existing);
  writeFileSync(path, cleaned, 'utf-8');
  return { success: true, message: `Rule removed from ${config.label} (${path})`, path };
}

function unsaveWrite(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  if (!existsSync(path)) {
    return { success: true, message: `No rule file for ${config.label} (doesn't exist)`, path };
  }

  // For write-type rules, just delete the file if it only contains AjaxSpeaks content
  const existing = readFileSync(path, 'utf-8');
  if (!fileHasAjaxSpeaks(existing)) {
    return { success: true, message: `No AjaxSpeaks rule found in ${config.label}`, path };
  }

  const cleaned = stripAjaxSpeaksBlock(existing).trim();
  if (cleaned === '') {
    // File was only our rule, safe to remove
    writeFileSync(path, '', 'utf-8');
  } else {
    writeFileSync(path, cleaned, 'utf-8');
  }
  return { success: true, message: `Rule removed from ${config.label} (${path})`, path };
}

function unsaveJsonMerge(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: ${tool}` };
  const { path } = config;

  if (!existsSync(path)) {
    return { success: true, message: `No config for Continue (doesn't exist)`, path };
  }

  try {
    const configJson = JSON.parse(readFileSync(path, 'utf-8'));
    if (configJson.customCommands) {
      configJson.customCommands = configJson.customCommands.filter(
        cmd => cmd.name !== 'ajaxspeaks' && !(cmd.description && cmd.description.includes('AjaxSpeaks'))
      );
    }
    writeFileSync(path, JSON.stringify(configJson, null, 2) + '\n', 'utf-8');
    return { success: true, message: `Rule removed from Continue (${path})`, path };
  } catch (e) {
    return { success: false, error: `Failed to parse ${path}: ${e.message}` };
  }
}

// ─── Dispatch Map ────────────────────────────────────────────────────────────

const SAVE_DISPATCH = {
  'append': saveAppend,
  'write': saveWrite,
  'json-merge': saveJsonMerge,
};

const UNSAVE_DISPATCH = {
  'append': unsaveAppend,
  'write': unsaveWrite,
  'json-merge': unsaveJsonMerge,
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Save AjaxSpeaks rule to a specific AI tool's global config.
 * @param {string} tool - Tool name (claude-code, claude-desktop, cline, cursor, copilot, continue)
 * @returns {object} { success, message, path }
 */
export function saveRule(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: "${tool}". Supported: ${SUPPORTED_TOOLS.join(', ')}` };
  const saver = SAVE_DISPATCH[config.type];
  if (!saver) return { success: false, error: `Unknown save type for ${tool}: ${config.type}` };
  return saver(tool);
}

/**
 * Remove AjaxSpeaks rule from a specific AI tool's global config.
 * @param {string} tool - Tool name
 * @returns {object} { success, message, path }
 */
export function unsaveRule(tool) {
  const config = getToolConfig(tool);
  if (!config) return { success: false, error: `Unknown tool: "${tool}". Supported: ${SUPPORTED_TOOLS.join(', ')}` };
  const unsaver = UNSAVE_DISPATCH[config.type];
  if (!unsaver) return { success: false, error: `Unknown unsave type for ${tool}: ${config.type}` };
  return unsaver(tool);
}

/**
 * Save rule to ALL supported AI tools.
 * @returns {Array<object>} Results for each tool
 */
export function saveAllRules() {
  const results = [];
  for (const tool of SUPPORTED_TOOLS) {
    results.push(saveRule(tool));
  }
  return results;
}

/**
 * Remove rule from ALL supported AI tools.
 * @returns {Array<object>} Results for each tool
 */
export function unsaveAllRules() {
  const results = [];
  for (const tool of SUPPORTED_TOOLS) {
    results.push(unsaveRule(tool));
  }
  return results;
}

/**
 * Check status of AjaxSpeaks rules across all tools.
 * @returns {Array<object>} { tool, label, installed: boolean, path }
 */
export function checkRuleStatus() {
  const results = [];
  for (const tool of SUPPORTED_TOOLS) {
    const config = getToolConfig(tool);
    if (!config) continue;
    const { path, label } = config;
    const exists = existsSync(path);
    let installed = false;
    if (exists) {
      try {
        const content = readFileSync(path, 'utf-8');
        installed = fileHasAjaxSpeaks(content) || content.includes('ajaxspeaks');
      } catch {
        installed = false;
      }
    }
    results.push({ tool, label, installed, path });
  }
  return results;
}

/**
 * Backup all .mem files and rules before uninstall.
 * @returns {object} { backupDir, manifest }
 */
export function backupAll() {
  const timestamp = new Date().toISOString().slice(0, 10);
  const backupDir = join(AS_HOME, 'backup', `ajaxspeaks-backup-${timestamp}`);
  ensureDir(backupDir);
  ensureDir(join(backupDir, 'projects'));
  ensureDir(join(backupDir, 'rules'));

  const manifest = {
    backupDate: new Date().toISOString(),
    projects: [],
    rules: [],
    aiToolConfigs: [],
  };

  // Backup projects/
  const projectsDir = join(AS_HOME, 'projects');
  if (existsSync(projectsDir)) {
    const projectDirs = readdirSync(projectsDir, { withFileTypes: true });
    for (const entry of projectDirs) {
      if (entry.isDirectory()) {
        const srcDir = join(projectsDir, entry.name);
        const dstDir = join(backupDir, 'projects', entry.name);
        mkdirSync(dstDir, { recursive: true });
        try {
          cpSync(srcDir, dstDir, { recursive: true });
          manifest.projects.push(entry.name);
        } catch (e) {
          console.error(`  ⚠ Failed to backup project ${entry.name}: ${e.message}`);
        }
      }
    }
  }

  // Backup rules/
  const rulesDir = join(AS_HOME, 'rules');
  if (existsSync(rulesDir)) {
    try {
      cpSync(rulesDir, join(backupDir, 'rules'), { recursive: true });
      manifest.rules.push('all rules copied');
    } catch (e) {
      console.error(`  ⚠ Failed to backup rules: ${e.message}`);
    }
  }

  // Snapshot current AI tool configs
  for (const tool of SUPPORTED_TOOLS) {
    const config = getToolConfig(tool);
    if (!config) continue;
    if (existsSync(config.path)) {
      try {
        const content = readFileSync(config.path, 'utf-8');
        const toolBackupDir = join(backupDir, 'ai-configs');
        ensureDir(toolBackupDir);
        const safeName = tool.replace(/[^a-z0-9]/g, '-');
        writeFileSync(join(toolBackupDir, `${safeName}.txt`), content, 'utf-8');
        manifest.aiToolConfigs.push(tool);
      } catch (e) {
        console.error(`  ⚠ Failed to backup ${tool} config: ${e.message}`);
      }
    }
  }

  // Write manifest
  writeFileSync(join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return { backupDir, manifest };
}

/**
 * Find .mem file in centralized projects/ directory.
 */
export function findCentralMemFile(projectName) {
  const memPath = join(AS_HOME, 'projects', projectName, `${projectName}.mem`);
  const archivePath = join(AS_HOME, 'projects', projectName, `${projectName}.archive.mem`);
  return { memPath: existsSync(memPath) ? memPath : null, archivePath: existsSync(archivePath) ? archivePath : null };
}
