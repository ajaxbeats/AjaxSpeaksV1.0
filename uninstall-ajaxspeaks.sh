#!/usr/bin/env bash
set -e

# ────────────────────────────────────────────────────────────────────────────
# AjaxSpeaks 1.0 — Linux/macOS Uninstaller
# ────────────────────────────────────────────────────────────────────────────
# Creates a backup of projects/ + rules/ + AI tool config snapshots,
# then removes AjaxSpeaks rules from all AI tools,
# and optionally deletes the AjaxSpeaks 1.0 directory.
# ────────────────────────────────────────────────────────────────────────────

AS_HOME="$HOME/AjaxSpeaks 1.0"
AS_BIN="/usr/local/bin"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║      AjaxSpeaks 1.0 — Uninstall           ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""

if [ ! -d "$AS_HOME" ]; then
  echo "  ℹ  AjaxSpeaks 1.0 is not installed at $AS_HOME"
  exit 0
fi

# ─── Step 1: Backup ─────────────────────────────────────────────────────────

echo "  Step 1: Creating backup..."
BACKUP_DIR="$HOME/ajaxspeaks-uninstall-backup-$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

# Backup projects/
if [ -d "$AS_HOME/projects" ] && [ "$(ls -A "$AS_HOME/projects" 2>/dev/null)" ]; then
  cp -r "$AS_HOME/projects" "$BACKUP_DIR/projects"
  echo "  ✓ Projects backed up to $BACKUP_DIR/projects/"
fi

# Backup rules/
if [ -d "$AS_HOME/rules" ] && [ "$(ls -A "$AS_HOME/rules" 2>/dev/null)" ]; then
  cp -r "$AS_HOME/rules" "$BACKUP_DIR/rules"
  echo "  ✓ Rules backed up to $BACKUP_DIR/rules/"
fi

# ─── Step 2: Remove rules from AI tools ─────────────────────────────────────

echo ""
echo "  Step 2: Removing AjaxSpeaks rules from AI tools..."
node "$AS_HOME/src/_AJAXRULE.js" --unsave 2>/dev/null || echo "  ⚠  Could not remove rules from some tools"

# ─── Step 3: Remove symlinks ────────────────────────────────────────────────

echo ""
echo "  Step 3: Removing symlinks..."

COMMANDS="_AJAXREADS _AJAXLOADS _AJAXLOGS _AJAXFORGETS _AJAXHIDE _AJAXSEEK _AJAXRULE _AJAXBEATS"
for CMD in $COMMANDS; do
  # System-wide
  if [ -L "$AS_BIN/$CMD" ]; then
    sudo rm -f "$AS_BIN/$CMD" 2>/dev/null || rm -f "$AS_BIN/$CMD" 2>/dev/null
    echo "  ✓ Removed $AS_BIN/$CMD"
  fi
  # User local
  if [ -L "$HOME/.local/bin/$CMD" ]; then
    rm -f "$HOME/.local/bin/$CMD"
    echo "  ✓ Removed $HOME/.local/bin/$CMD"
  fi
done

# ─── Step 4: Ask about deletion ─────────────────────────────────────────────

echo ""
echo "  Step 4: Cleanup"
read -p "  Delete $AS_HOME? (y/N): " CONFIRM
if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
  rm -rf "$AS_HOME"
  echo "  ✓ Deleted $AS_HOME"
else
  echo "  ℹ  Kept $AS_HOME"
fi

# ─── Done ───────────────────────────────────────────────────────────────────

echo ""
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║     AjaxSpeaks 1.0 — Uninstalled          ║"
echo "  ╚═══════════════════════════════════════════╝"
echo ""
echo "  Backup saved: $BACKUP_DIR"
echo "  To restore, copy projects/ and rules/ back to $AS_HOME"
echo ""
