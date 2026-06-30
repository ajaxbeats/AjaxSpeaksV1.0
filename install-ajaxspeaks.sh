#!/usr/bin/env bash
set -e

# ────────────────────────────────────────────────────────────────────────────
# AjaxSpeaks 1.0 — Linux/macOS Installer
# ────────────────────────────────────────────────────────────────────────────
# This script installs AjaxSpeaks to ~/AjaxSpeaks 1.0/,
# makes CLI commands available system-wide, and auto-saves the
# persistent rule to all detected AI tools.
# ────────────────────────────────────────────────────────────────────────────

AS_HOME="$HOME/AjaxSpeaks 1.0"
AS_BIN="/usr/local/bin"
NODE_MIN=14

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║        AjaxSpeaks 1.0 — Install           ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

# ─── Check Node.js ──────────────────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo "  ✗ Node.js is not installed."
  echo "    Install Node.js ≥$NODE_MIN from https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -e "console.log(process.version.slice(1).split('.')[0])")
if [ "$NODE_VER" -lt "$NODE_MIN" ]; then
  echo "  ✗ Node.js v$(node -v) detected, need v${NODE_MIN}+"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# ─── Check installation directory ───────────────────────────────────────────

if [ -d "$AS_HOME" ]; then
  echo "  ℹ  AjaxSpeaks already installed at $AS_HOME"
  echo "     Re-running will overwrite existing files."
fi

# Make sure all necessary subdirs exist
mkdir -p "$AS_HOME"/src
mkdir -p "$AS_HOME"/projects
mkdir -p "$AS_HOME"/rules
mkdir -p "$AS_HOME"/backup

# ─── Create symlinks for each command ───────────────────────────────────────

echo ""
echo "  Installing commands..."

COMMANDS="_AJAXREADS _AJAXLOADS _AJAXLOGS _AJAXFORGETS _AJAXHIDE _AJAXSEEK _AJAXRULE _AJAXBEATS"

for CMD in $COMMANDS; do
  SRC="$AS_HOME/src/${CMD}.js"
  LINK="$AS_BIN/$CMD"

  if [ -f "$SRC" ]; then
    chmod +x "$SRC"
    # Use absolute path to node + script for reliability
    ln -sf "$SRC" "$LINK" 2>/dev/null || sudo ln -sf "$SRC" "$LINK" 2>/dev/null || {
      echo "  ℹ  Could not create symlink for $CMD (need sudo or write permission to $AS_BIN)"
      echo "     Run: sudo ln -sf $SRC $LINK"
    }
    echo "  ✓ $CMD → $LINK"
  else
    echo "  ⚠  $SRC not found, skipping"
  fi
done

# ─── Create path helper ─────────────────────────────────────────────────────

# Add to PATH via ~/.local/bin if needed
export PATH="$HOME/.local/bin:$PATH"
mkdir -p "$HOME/.local/bin"
for CMD in $COMMANDS; do
  SRC="$AS_HOME/src/${CMD}.js"
  LINK="$HOME/.local/bin/$CMD"
  if [ -f "$SRC" ]; then
    ln -sf "$SRC" "$LINK"
  fi
done

# Auto-source in shell config
SHELL_CONFIG=""
if [ -f "$HOME/.bashrc" ]; then SHELL_CONFIG="$HOME/.bashrc"; fi
if [ -f "$HOME/.zshrc" ]; then SHELL_CONFIG="$HOME/.zshrc"; fi

if [ -n "$SHELL_CONFIG" ]; then
  LINE='export PATH="$HOME/.local/bin:$PATH"'
  if ! grep -q "$LINE" "$SHELL_CONFIG"; then
    echo "$LINE" >> "$SHELL_CONFIG"
    echo "  ✓ Added ~/.local/bin to PATH in $SHELL_CONFIG"
  fi
fi

# ─── Voice-friendly aliases ──────────────────────────────────────────────────

# Option 1: "ajax" prefix — shorter, natural to type/say
ALIAS_OPT1='# AjaxSpeaks voice-friendly aliases (Option 1 - ajax prefix)
alias ajaxreads="_AJAXREADS"
alias ajaxloads="_AJAXLOADS"
alias ajaxlogs="_AJAXLOGS"
alias ajaxforgets="_AJAXFORGETS"
alias ajaxhide="_AJAXHIDE"
alias ajaxseek="_AJAXSEEK"
alias ajaxrule="_AJAXRULE"
alias ajaxbeats="_AJAXBEATS"'

# Option 2: verb-first — most natural for text-to-speech users
ALIAS_OPT2='# AjaxSpeaks voice-friendly aliases (Option 2 - verb-first)
alias readmem="_AJAXREADS"
alias loadmem="_AJAXLOADS"
alias logmem="_AJAXLOGS"
alias wipemem="_AJAXFORGETS"
alias scanmem="_AJAXHIDE"
alias fillmem="_AJAXSEEK"
alias rulemem="_AJAXRULE"
alias playlist="_AJAXBEATS"'

# Add both alias blocks to shell config if not already present
if [ -n "$SHELL_CONFIG" ]; then
  if ! grep -q "AjaxSpeaks voice-friendly aliases (Option 1" "$SHELL_CONFIG"; then
    echo "" >> "$SHELL_CONFIG"
    echo "$ALIAS_OPT1" >> "$SHELL_CONFIG"
    echo "" >> "$SHELL_CONFIG"
    echo "$ALIAS_OPT2" >> "$SHELL_CONFIG"
    echo "" >> "$SHELL_CONFIG"
    echo "  ✓ Added voice-friendly aliases to $SHELL_CONFIG"
    echo "    Option 1: ajaxreads, ajaxloads, ajaxlogs, ajaxforgets, ajaxhide, ajaxseek, ajaxrule, ajaxbeats"
    echo "    Option 2: readmem, loadmem, logmem, wipemem, scanmem, fillmem, rulemem, playlist"
  fi
fi


# ─── Auto-save rule to all AI tools ─────────────────────────────────────────

echo ""
echo "  Saving AjaxSpeaks rule to AI tools..."
node "$AS_HOME/src/_AJAXRULE.js" --save || echo "  ⚠  Rule save encountered issues (some tools may not be installed)"

# ─── Done ───────────────────────────────────────────────────────────────────

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║     AjaxSpeaks 1.0 — Installed!           ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""
echo "  Commands available:"
echo "    _AJAXREADS      Discover context and build .mem"
echo "    _AJAXLOADS      Load .mem into project (--archive, --to TARGET)"
echo "    _AJAXLOGS       Log a session entry to .mem"
echo "    _AJAXFORGETS    Wipe the .mem file"
echo "    _AJAXHIDE       Scan .mem for secrets (--fix to redact)"
echo "    _AJAXSEEK       Fill placeholder values in .mem"
echo "    _AJAXRULE       Manage persistent AI tool rules"
echo "    _AJAXBEATS      Open AjaxBeats Spotify playlist"
echo ""
echo "  Voice-friendly aliases also available:"
echo "    Option 1: ajaxreads, ajaploads, ajaxlogs, ..."
echo "    Option 2: readmem, loadmem, logmem, ..."
echo "    See README for full list or run: source ~/.bashrc (or ~/.zshrc)"
echo ""
echo "  Location: $AS_HOME"
echo ""
echo "  Next steps:"
echo "    1. source ~/.bashrc  (or open a new terminal)"
echo "    2. cd /path/to/your/project"
echo "    3. readmem           # Build initial project memory"
echo "    4. logmem            # Log your first session"
echo "    5. loadmem           # Load memory into CLAUDE.md"
echo ""

