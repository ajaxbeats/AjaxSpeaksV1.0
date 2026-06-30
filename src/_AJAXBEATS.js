#!/usr/bin/env node
/**
 * _AJAXBEATS — Open the AjaxBeats Spotify playlist.
 *
 * AjaxBeats is a curated coding/music playlist on Spotify.
 *
 * Usage:
 *   _AJAXBEATS              Open playlist in default browser
 *   _AJAXBEATS --url        Just print the URL
 *   _AJAXBEATS --copy       Copy URL to clipboard
 */

import { execSync } from 'child_process';

const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', green: '\x1b[32m',
  cyan: '\x1b[36m', dim: '\x1b[2m',
};

const PLAYLIST_URL = 'https://open.spotify.com/playlist/7GyDdZ05PQG8lf5nOZOWbI?si=26b565e3ab72411c';

function usage() {
  console.log(`\n_AJAXBEATS — Open AjaxBeats Spotify playlist\n`);
  console.log(`  _AJAXBEATS          Open playlist in browser`);
  console.log(`  _AJAXBEATS --url    Print URL`);
  console.log(`  _AJAXBEATS --copy   Copy URL to clipboard\n`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) { usage(); process.exit(0); }

  if (args.includes('--url')) {
    console.log(PLAYLIST_URL);
    process.exit(0);
  }

  if (args.includes('--copy')) {
    try {
      execSync(`echo "${PLAYLIST_URL}" | xclip -selection clipboard`, { stdio: 'pipe' });
      console.log(`  ${C.green}✓ URL copied to clipboard${C.reset}`);
    } catch {
      try {
        execSync(`echo "${PLAYLIST_URL}" | pbcopy`, { stdio: 'pipe' });
        console.log(`  ${C.green}✓ URL copied to clipboard${C.reset}`);
      } catch {
        console.log(PLAYLIST_URL);
        console.log(`  ${C.dim}(clipboard not available, printed URL above)${C.reset}`);
      }
    }
    process.exit(0);
  }

  // Default: open in browser
  const platform = process.platform;
  try {
    if (platform === 'darwin') {
      execSync(`open "${PLAYLIST_URL}"`, { stdio: 'pipe' });
    } else if (platform === 'win32') {
      execSync(`start "" "${PLAYLIST_URL}"`, { stdio: 'pipe', shell: true });
    } else {
      // Linux
      execSync(`xdg-open "${PLAYLIST_URL}"`, { stdio: 'pipe' });
    }
    console.log(`\n${C.green}${C.bold}✓ Opened AjaxBeats playlist${C.reset} ${C.dim}in browser${C.reset}\n`);
  } catch {
    console.log(`\n${C.cyan}${PLAYLIST_URL}${C.reset}`);
    console.log(`${C.dim}  (could not open browser, printed URL above)${C.reset}\n`);
  }
}

main();
