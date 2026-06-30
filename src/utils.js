#!/usr/bin/env node
/**
 * utils.js — Shared utility functions for AjaxSpeaks commands.
 */

import { existsSync, mkdirSync } from 'fs';
import { resolve, join, basename } from 'path';
import { homedir } from 'os';

/**
 * Find the AjaxSpeaks 1.0 home directory.
 * Prioritizes the standard location (~/AjaxSpeaks 1.0).
 */
export function getAjaxSpeaksHome() {
  if (process.env.AJAXSPEAKS_HOME) return process.env.AJAXSPEAKS_HOME;
  const home = homedir();
  const v1Path = join(home, 'AjaxSpeaks 1.0');
  if (existsSync(v1Path)) return v1Path;
  const oldPath = join(home, 'ajaxspeaks-v2');
  if (existsSync(oldPath)) return oldPath;
  const oldPath2 = join(home, 'AjaxSpeaks');
  if (existsSync(oldPath2)) return oldPath2;
  return v1Path;
}

/**
 * Find .mem file for a project.
 * Searches:
 *   1. ~/AjaxSpeaks 1.0/projects/<name>/<name>.mem
 *   2. ~/ajaxspeaks-v2/projects/<name>/<name>.mem
 *   3. $PWD/<name>.mem (legacy fallback)
 *
 * @param {string} rootDir - Project root directory (default: cwd)
 * @returns {string|null} Path to .mem file, or null if not found
 */
export function findMemFile(rootDir) {
  const dirName = basename(rootDir || resolve('.'));

  // 1. Centralized path
  const asHome = getAjaxSpeaksHome();
  const centralMem = join(asHome, 'projects', dirName, `${dirName}.mem`);
  if (existsSync(centralMem)) return centralMem;

  // 2. Old v2 centralized path
  const oldDir = join(homedir(), 'ajaxspeaks-v2');
  const oldMem = join(oldDir, 'projects', dirName, `${dirName}.mem`);
  if (existsSync(oldDir) && existsSync(oldMem)) return oldMem;

  // 3. Old AjaxSpeaks path
  const oldDir2 = join(homedir(), 'AjaxSpeaks');
  const oldMem2 = join(oldDir2, 'projects', dirName, `${dirName}.mem`);
  if (existsSync(oldDir2) && existsSync(oldMem2)) return oldMem2;

  // 4. Legacy fallback: .mem in project root
  const legacyMem = join(rootDir, `${dirName}.mem`);
  if (existsSync(legacyMem)) return legacyMem;

  return null;
}

/**
 * Get the centralized projects directory.
 */
export function getProjectsDir() {
  return join(getAjaxSpeaksHome(), 'projects');
}

/**
 * Get the centralized project-specific directory.
 * Creates it if it doesn't exist.
 */
export function getProjectDir(projectName) {
  const dir = join(getProjectsDir(), projectName);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Determine the current project name from cwd.
 */
export function getCurrentProjectName() {
  return basename(resolve('.'));
}