#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────
# AjaxSpeaks 1.0 — macOS Installer (double-click friendly)
# ────────────────────────────────────────────────────────────────────────────
# This script opens Terminal and runs the Linux installer.
# ────────────────────────────────────────────────────────────────────────────

cd "$(dirname "$0")"
bash install-ajaxspeaks.sh

echo ""
echo "  Press Enter to close this window..."
read
