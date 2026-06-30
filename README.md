
```text
█████╗      ██╗ █████╗ ██╗  ██╗
██╔══██╗     ██║██╔══██╗╚██╗██╔╝
███████║     ██║███████║ ╚███╔╝ 
██╔══██║██   ██║██╔══██║ ██╔██╗ 
██║  ██║╚█████╔╝██║  ██║██╔╝ ██╗
╚═╝  ╚═╝ ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝

███████╗██████╗ ███████╗ █████╗ ██╗  ██╗███████╗
██╔════╝██╔══██╗██╔════╝██╔══██╗██║ ██╔╝██╔════╝
███████╗██████╔╝█████╗  ███████║█████╔╝ ███████╗
╚════██║██╔═══╝ ██╔══╝  ██╔══██║██╔═██╗ ╚════██║
███████║██║     ███████╗██║  ██║██║  ██╗███████║
╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

┌───────────────────────────────────────────────────────────────────┐
│        AI Context Management Toolkit  ◆  v1.0                    │
│    96% compression · Structured shorthand · One command          │
│                   Created by AjaxBeats                           │
└───────────────────────────────────────────────────────────────────┘
```


Never repeat project context to your AI assistant again. AjaxSpeaks
distills your project knowledge into lightweight `.mem` files and
loads them into any AI tool — Claude, Cline, Cursor, Copilot,
Continue, and more. One command to save, one command to load.

**What would cost ~70,000 tokens as raw source code fits in ~3,000
tokens as a rendered `.mem` file — 96% compression.** Instead of
dumping entire files that burn through your context window, AjaxSpeaks
uses a structured shorthand language designed for LLM tokenization.
Every character earns its place.

---


## 📦 Quick Install

### Prerequisites

- **Node.js ≥ 14** installed and on your system PATH
- Verify with: `node --version`

### Linux

```bash
bash ~/AjaxSpeaks\ 1.0/install-ajaxspeaks.sh
```

The installer will:
1. Make all scripts executable
2. Create `~/.local/bin/` symlinks so commands work from any directory
3. Optionally save AjaxSpeaks commands as a persistent AI tool rule
4. Add `~/.local/bin` to your PATH if needed (may require relogin)

### macOS

**Option 1 — Terminal:**
```bash
bash ~/AjaxSpeaks\ 1.0/install-ajaxspeaks.sh
```

**Option 2 — Double-click:**
Double-click `install-ajaxspeaks.command` in Finder.
If you get an "unidentified developer" warning, see Troubleshooting below.

### Windows

**Option 1 — Command Prompt (recommended):**
```cmd
AjaxSpeaks 1.0\install-ajaxspeaks.bat
```

**Option 2 — Double-click:**
Double-click `install-ajaxspeaks.bat` in File Explorer.

The installer creates `.bat` wrapper scripts in a directory added to your
system PATH, making commands available from any terminal.

---

## 🎮 Commands at a Glance

| Command | Description |
|---|---|
| `_AJAXREADS` | Scan project for context files, build/update `.mem` |
| `_AJAXLOADS` | Load `.mem` into current AI tool session |
| `_AJAXLOGS` | Log a session entry to `.mem` (auto-archives old sessions) |
| `_AJAXFORGETS` | Wipe the `.mem` file to a minimal template |
| `_AJAXHIDE` | Scan `.mem` for secrets (API keys, tokens, passwords) |
| `_AJAXSEEK` | Fill `{{PLACEHOLDER}}` values in a shared `.mem` |
| `_AJAXRULE` | Save or remove AjaxSpeaks as persistent rule in AI tools |
| `_AJAXBEATS` | Open the AjaxBeats coding playlist on Spotify |

> **Tip:** After installing, open a **new terminal window** (or restart
> your terminal) so the PATH updates take effect, then run:
> ```bash
> _AJAXRULE --save
> ```
> This makes all AjaxSpeaks commands available as a persistent rule in
> your AI tools — so the AI knows them too. (Run this in your terminal,
> not inside an AI chat.)

---

## 🎤 Voice-Friendly Commands

AjaxSpeaks includes two sets of aliases designed for text-to-speech
users, voice dictation, or anyone who finds `_AJAXREADS` hard to say.

After installation, both option sets are available automatically:

### Option 1 — `ajax` prefix

Short, punchy, natural to say:

| Say This | Runs | Description |
|---|---|---|
| `ajaxreads` | `_AJAXREADS` | Scan project, build `.mem` |
| `ajaxloads` | `_AJAXLOADS` | Load `.mem` into AI tool |
| `ajaxlogs` | `_AJAXLOGS` | Log a session entry |
| `ajaxforgets` | `_AJAXFORGETS` | Wipe the `.mem` file |
| `ajaxhide` | `_AJAXHIDE` | Scan for secrets |
| `ajaxseek` | `_AJAXSEEK` | Fill placeholder values |
| `ajaxrule` | `_AJAXRULE` | Manage AI tool rules |
| `ajaxbeats` | `_AJAXBEATS` | Open the coding playlist |

### Option 2 — Verb-first (`*mem`)

Most natural for speech — "read mem", "load mem", "wipe mem":

| Say This | Runs | Description |
|---|---|---|
| `readmem` | `_AJAXREADS` | Scan project, build `.mem` |
| `loadmem` | `_AJAXLOADS` | Load `.mem` into AI tool |
| `logmem` | `_AJAXLOGS` | Log a session entry |
| `wipemem` | `_AJAXFORGETS` | Wipe the `.mem` file |
| `scanmem` | `_AJAXHIDE` | Scan for secrets |
| `fillmem` | `_AJAXSEEK` | Fill placeholder values |
| `rulemem` | `_AJAXRULE` | Manage AI tool rules |
| `playlist` | `_AJAXBEATS` | Open the coding playlist |

### Specifying the File Path Verbally

If you're using text-to-speech and need to tell AjaxSpeaks *where* to
save or load a `.mem` file, the simplest approach is **`cd` first,
then run the alias**:

```bash
cd /path/to/your/project
loadmem                # Auto-detects project name from current folder
```

This works because AjaxSpeaks commands auto-detect the project by the
name of your current directory. No need to say a file path at all.

**If you need a custom path**, use the `-f` or `-o` flags with the
alias (works with both Option 1 and Option 2 aliases):

```bash
readmem -o ~/Desktop/my-project.mem      # Save to desktop
loadmem -f ~/Desktop/my-project.mem      # Load from desktop
```

All command-line flags are passed through to the underlying command,
so any flag that works with `_AJAXREADS` also works with `ajaxreads`
and `readmem`.

---

## 📋 The `.mem` Format


AjaxSpeaks uses a simple, human-readable memory format:

```
!meta
  name = MyProject
  desc = A brief project description

!deps
  npm: express@4.18.2, react@18.2.0
  pip: flask==3.0.0

!arch
  src/index.js        :: Entry point
  src/routes/         :: API route handlers
  src/components/     :: Shared UI components

!rules
  - Always use shared focus components
  - Follow the existing error-handling pattern

!files
  src/app.js          :: Main application
  src/utils/db.js     :: Database connection

!mem 2026-06-30
  feat: added login flow
  fix: resolved timeout in payment handler
  !! Arch: switched from REST to GraphQL
```

### Shorthand Language Reference

The `.mem` format uses a compact notation designed for LLM token efficiency:

| Syntax | Meaning | Example |
|--------|---------|---------|
| `!section` | Section header | `!arch`, `!rules`, `!deps` |
| `key = value` | Key-value assignment | `lang = kotlin,js` |
| `path :: role` | File/component mapping | `Theme.kt :: sole color source` |
| `path::sub` | Namespace separator | `data::repository::StreamRepository` |
| `→` | Depends on / calls | `repository → remote::ApiClient` |
| `name@version` | Dependency with version | `express@^4, react@^18` |
| `!! text` | CRITICAL rule — never violate | `!! No secrets in client bundle` |
| `! text` | IMPORTANT rule — should follow | `! [design] Use theme tokens` |
| `? text` | NOTE — contextual guidance | `? Lazy-load heavy routes` |
| `$alias` | Shorthand variable | `$api = /api/v1` |
| `G/P/Pt/D` | HTTP method shorthand | `G /items → List all` |
| `fix:/add:` | Session log entry tags | `fix: resolved timeout` |
| `# text` | Comment (ignored by parser) | `# Generated by AjaxSpeaks` |

### Rule Severity Markers

| Marker | Meaning | AI Behavior |
|--------|---------|-------------|
| `!!` | CRITICAL | Must never violate |
| `!` | IMPORTANT | Follow unless overridden |
| `?` | NOTE | Be aware of this context |

### Session Log Tags

| Tag | Meaning | Example |
|-----|---------|---------|
| `fix:` | Bug fix | `fix: focus visibility on dark backgrounds` |
| `add:` | Feature addition | `add: PiP support for player` |
| `commit:` | Git reference | `commit: abc123f` |
| `!!` | Critical insight | `!! Switched from REST to GraphQL` |
| (none) | General session note | `Refactored login flow` |

### Compression in Action

The shorthand compresses project context dramatically. Here's a real example
(from the included Android TV app):

| Metric | Traditional Prose (`.md`) | AjaxSpeaks (`.mem`) | Savings |
|--------|--------------------------|---------------------|---------|
| Full project read | ~70,000 tokens raw | ~3,000 tokens rendered | **96%** |
| Dependency listing | 5 lines per dep + full Maven coords | 1 line per group | **80%** |
| File mapping | `Path | Purpose` table with headers | `path :: role` | **60%** |
| Architecture | Full tree with `├──`/`└──` render | Indented with `→` arrows | **67%** |
| Session history | Prose paragraphs | `date-stamped tags` | **72%** |
| Rules | "CRITICAL: Never define colors..." | `!! No ad-hoc colors` | **55%** |

> **Real-world example:** The Android TV app's `before-android-tv.md` is 169 lines
> of prose. The same project as `android-tv.mem` is 133 lines — and the `.mem`
> contains *more* structured information (API endpoints, dependency versions,
> rule severity).

---

## 💡 Usage Examples

### Starting a New Project

```bash
cd /path/to/your/project
_AJAXREADS                          # Scan project, build .mem
_AJAXLOGS "first session — setup"   # Log what you did
_AJAXLOADS                          # Load context into AI tool
```

### Continuing Work After a Break

```bash
cd /path/to/your/project
_AJAXLOADS              # Restore full project context
_AJAXLOGS "feat: added search filters"
```

### Sharing with a Different AI Tool

```bash
_AJAXLOADS --to cursor      # Format for Cursor
_AJAXLOADS --to copilot     # Format for GitHub Copilot
_AJAXLOADS --to claude-code # Format for Claude Code
```

### Include Archived Sessions

```bash
_AJAXLOADS --archive        # Include all historical sessions
_AJAXLOADS --archive --to cline  # Full history for Cline
```

### Manage Persistent Rules

```bash
_AJAXRULE --status              # Check what's installed
_AJAXRULE --save                # Save to ALL detected AI tools
_AJAXRULE --save --to cline     # Save only for Cline
_AJAXRULE --unsave              # Remove from all tools
_AJAXRULE --backup              # Backup all projects + rules
```

### Security Check Before Sharing

```bash
_AJAXHIDE                       # Scan .mem for secrets
_AJAXHIDE --fix                 # Redact secrets in-place
_AJAXHIDE --quiet               # Machine-readable JSON output
```

### Filling Placeholders in a Shared `.mem`

```bash
_AJAXSEEK                       # Interactive mode
_AJAXSEEK --set DB_HOST=localhost --set DB_PORT=5432
_AJAXSEEK --dry-run             # List placeholders only
```

---

## 🗂️ Directory Structure

```
~/AjaxSpeaks 1.0/
├── src/
│   ├── _AJAXREADS.js       # Context discovery
│   ├── _AJAXLOADS.js       # Memory loader
│   ├── _AJAXLOGS.js        # Session logger
│   ├── _AJAXFORGETS.js     # Memory wiper
│   ├── _AJAXHIDE.js        # Secret scanner
│   ├── _AJAXSEEK.js        # Placeholder filler
│   ├── _AJAXRULE.js        # Rule manager CLI
│   ├── _AJAXBEATS.js       # Spotify opener
│   ├── rules.js            # Rule engine (save/unsave logic)
│   ├── loader.js           # .mem parser + AI formatters
│   ├── grammar.js          # Token estimation + validation
│   └── utils.js            # Shared path utilities
├── projects/               # .mem data organized by project
│   └── <ProjectName>/
│       ├── <ProjectName>.mem
│       └── <ProjectName>.archive.mem
├── rules/                  # Master copies of AI tool rules
├── backup/                 # Timestamped uninstall backups
├── install-ajaxspeaks.sh   # Linux / macOS installer
├── install-ajaxspeaks.command  # macOS double-click installer
├── install-ajaxspeaks.bat      # Windows installer
├── uninstall-ajaxspeaks.sh     # Linux / macOS uninstaller
├── uninstall-ajaxspeaks.command # macOS double-click uninstaller
├── uninstall-ajaxspeaks.bat    # Windows uninstaller
└── README.md               # This file
```

---

## 🛠️ Supported AI Tools

| Tool | Rule File Path | Save Method |
|---|---|---|
| **Claude Code** | `~/.claude/CLAUDE.md` | Append |
| **Claude Desktop** | `~/.claude/CLAUDE.md` (or snap path) | Append |
| **Cline** | `~/.clinerules` | Write |
| **Cursor** | `~/.cursor/rules/ajaxspeaks.mdc` | Write |
| **GitHub Copilot** | `~/.github/copilot-instructions.md` | Append |
| **Continue** | `~/.continue/config.json` | JSON Merge |

### Load Targets

`_AJAXLOADS --to <target>` also supports these output formats (no rule
management — just context formatting):

`claude-code`, `claude-desktop`, `cursor`, `cline`, `copilot`,
`continue`, `deepseek`, `gemini`, `grok`, `openai`, `generic`

---

## ⚠️ Troubleshooting

### "command not found: _AJAXREADS" (or any command)

**Linux / macOS:**
The installer adds symlinks to `~/.local/bin/`. Make sure this is in your PATH:

```bash
echo $PATH | grep ~/.local/bin
```

If missing, add this to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then reload: `source ~/.bashrc` (or restart your terminal).

You can also run commands directly without installation:

```bash
node ~/AjaxSpeaks\ 1.0/src/_AJAXREADS.js
node ~/AjaxSpeaks\ 1.0/src/_AJAXLOADS.js
```

**Windows:**
The installer adds a directory to your system PATH. You may need to
restart Command Prompt or your terminal for the change to take effect.

### "No .mem file found" Error

You need to build a `.mem` file first:

```bash
_AJAXREADS
```

Or specify a file directly with `-f`:

```bash
_AJAXLOADS -f ~/AjaxSpeaks\ 1.0/projects/MyProject/MyProject.mem
```

### "ERR_MODULE_NOT_FOUND" / Import Errors

Make sure you're running commands from the correct directory, or use the
installed symlinks (which handle paths automatically).

Ensure Node.js ≥ 14 is installed:

```bash
node --version
```

If running directly from the `src/` directory, use the absolute path:

```bash
cd ~/AjaxSpeaks\ 1.0 && node src/_AJAXRULE.js --status
```

### Permission Denied on `.sh` Scripts (Linux / macOS)

Make the script executable:

```bash
chmod +x ~/AjaxSpeaks\ 1.0/*.sh
chmod +x ~/AjaxSpeaks\ 1.0/*.command
```

### macOS "unidentified developer" Warning for `.command` Files

macOS may block unsigned scripts. Either:

**Option 1 — Right-click → Open:**
Right-click the `.command` file in Finder and select "Open" from the
context menu, then click "Open" in the dialog.

**Option 2 — Remove quarantine attribute:**
```bash
xattr -d com.apple.quarantine ~/AjaxSpeaks\ 1.0/*.command
```

**Option 3 — Use Terminal instead:**
```bash
bash ~/AjaxSpeaks\ 1.0/install-ajaxspeaks.command
```

### Windows PowerShell Execution Policy

If PowerShell blocks the script, you have several options:

**Option 1 — Use Command Prompt (cmd.exe)** instead of PowerShell.

**Option 2 — Bypass for the current session:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Option 3 — Unblock the file:**
```powershell
Unblock-File -Path "AjaxSpeaks 1.0\install-ajaxspeaks.bat"
```

### Rule Not Appearing in AI Tool After Installing

Check the current status:

```bash
_AJAXRULE --status
```

If it shows "not installed," save the rule:

```bash
_AJAXRULE --save --to claude-code    # Replace with your tool
```

Some AI tools (like Cursor) require restarting the editor for rule
changes to take effect.

### "SyntaxError: Unexpected token" When Running Scripts

Make sure you're using Node.js, not a different runtime:

```bash
node --version     # Should be v14 or higher
which node         # Should point to your Node.js installation
```

### `.mem` File Became Corrupted / Wiped Accidentally

Don't panic — `.mem` files are disposable:

1. Run `_AJAXREADS` to rebuild from your project's existing files
2. Check `projects/<ProjectName>/<ProjectName>.archive.mem` for
   archived sessions that may still have content
3. Run `_AJAXLOGS` to log any missing context from memory

### Installation Failed — No Write Permission

If the installer can't create symlinks or directories:

```bash
# Run installer with explicit paths
cd ~/AjaxSpeaks\ 1.0
bash install-ajaxspeaks.sh
```

Or manually symlink the commands:

```bash
mkdir -p ~/.local/bin
ln -s ~/AjaxSpeaks\ 1.0/src/_AJAXREADS.js ~/.local/bin/_AJAXREADS
ln -s ~/AjaxSpeaks\ 1.0/src/_AJAXLOADS.js ~/.local/bin/_AJAXLOADS
# ... repeat for each command
```

### Windows Antivirus Flags the Installer

The `.bat` files are simple batch scripts that create wrapper launchers.
They are safe. If your antivirus quarantines them, you can:

1. Restore the file from quarantine
2. Run commands directly with Node.js:
   ```cmd
   node "AjaxSpeaks 1.0\src\_AJAXREADS.js"
   ```

### Still Having Issues?

Open an issue at:
**https://github.com/ajaxbeats/ajaxspeaks/issues**

Include:
- Your operating system and version
- Node.js version (`node --version`)
- The exact command you ran and the full error output
- What you expected to happen

---

## ♻️ Uninstall

### Linux / macOS

```bash
bash ~/AjaxSpeaks\ 1.0/uninstall-ajaxspeaks.sh
```

**macOS double-click:**
Double-click `uninstall-ajaxspeaks.command` in Finder.

### Windows

Double-click `uninstall-ajaxspeaks.bat` in File Explorer, or run:

```cmd
AjaxSpeaks 1.0\uninstall-ajaxspeaks.bat
```

### What the Uninstaller Does

1. 📦 Creates a timestamped backup in `backup/`:
   - All project `.mem` files
   - All AI tool rule files
   - Current AI tool configs (snapshots)
2. 🗑️ Removes AjaxSpeaks rules from all detected AI tools
3. 🔗 Removes command symlinks / wrappers
4. ❓ Asks before deleting the AjaxSpeaks 1.0 directory

To restore from a backup:

```bash
ls ~/AjaxSpeaks\ 1.0/backup/
cp -r ~/AjaxSpeaks\ 1.0/backup/ajaxspeaks-backup-<date>/* ~/AjaxSpeaks\ 1.0/
```

---

## ⭐ Support the Project

If AjaxSpeaks saves you tokens, time, or sanity — a star helps others find it.

**[⭐ Star on GitHub](https://github.com/ajaxbeats/AjaxSpeaksV1.0)**

---

## 📄 License

**MIT License**

Copyright (c) 2026 Ajaxbeats

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
