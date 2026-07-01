---
name: ajaxspeaks
description: "Use for any request to load, save, or manage project context for AI tools — including loading memory, scanning a project, logging a session, hiding secrets, filling placeholders, or managing rules. Trigger: /ajaxspeaks"
---

# AjaxSpeaks — AI Context Management

Distills project knowledge into `.mem` files and loads them into any AI tool. 96% token compression.

## Commands

| Command | What it does |
|---|---|
| `_AJAXREADS` | Scan project, build/update `.mem` |
| `_AJAXREADS --init` | Create a blank `.mem` template for a new project |
| `_AJAXLOADS` | Load `.mem` into current AI tool session |
| `_AJAXLOADS --to TARGET` | Load for specific tool (claude-code, cursor, cline, copilot, continue) |
| `_AJAXLOGS "text"` | Append a session entry to `.mem` |
| `_AJAXFORGETS` | Wipe `.mem` to minimal template |
| `_AJAXHIDE` | Scan `.mem` for secrets |
| `_AJAXHIDE --fix` | Redact secrets in-place |
| `_AJAXSEEK` | Interactively fill `{{PLACEHOLDER}}` values |
| `_AJAXRULE --save` | Install AjaxSpeaks as persistent rule in AI tools |
| `_AJAXRULE --status` | Check which tools have the rule installed |

## Natural Language Triggers

When a user says any of the following, run the mapped command:

| User says | Run |
|---|---|
| "load my project context" / "load memory" / "load context" | `_AJAXLOADS` |
| "load context for cursor" / "load for copilot" etc. | `_AJAXLOADS --to <tool>` |
| "scan my project" / "build my mem file" / "read my project" | `_AJAXREADS` |
| "create a mem file" / "init ajaxspeaks" / "start a new mem" | `_AJAXREADS --init` |
| "log this session" / "save session notes" / "log what we did" | `_AJAXLOGS "<summary>"` |
| "forget my context" / "wipe my mem" / "reset context" | `_AJAXFORGETS` |
| "check for secrets" / "scan for leaks" / "hide secrets" | `_AJAXHIDE` |
| "fill placeholders" / "set up shared mem" | `_AJAXSEEK` |
| "save ajaxspeaks rule" / "install rule" | `_AJAXRULE --save` |

## Typical Workflows

**New project:**
```bash
cd /path/to/project
_AJAXREADS        # scan → build project.mem
_AJAXLOADS        # load into current AI tool
```

**Resume work:**
```bash
cd /path/to/project
_AJAXLOADS        # restore context
_AJAXLOGS "feat: added auth flow"
```

**Share with teammate:**
```bash
_AJAXHIDE --fix   # redact secrets
# send the .mem file
# recipient runs:
_AJAXSEEK         # fill in local env values
_AJAXLOADS        # load into their AI tool
```

## Install

```bash
npm install -g ajaxspeaks
```

GitHub: https://github.com/ajaxbeats/AjaxSpeaksV1.0
