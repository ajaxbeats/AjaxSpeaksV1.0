@echo off
REM ────────────────────────────────────────────────────────────────────────────
REM AjaxSpeaks 1.0 — Windows Installer
REM ────────────────────────────────────────────────────────────────────────────
REM This script installs AjaxSpeaks commands and adds them to your PATH.
REM ────────────────────────────────────────────────────────────────────────────

setlocal enabledelayedexpansion

echo.
echo   ============================================
echo          AjaxSpeaks 1.0 — Install
echo   ============================================
echo.

REM ─── Check Node.js ──────────────────────────────────────────────────────────

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo   ^✗ Node.js is not installed.
  echo     Install Node.js from https://nodejs.org
  pause
  exit /b 1
)

for /f "tokens=1,2,3 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%b
if %NODE_MAJOR% LSS 14 (
  echo   ^✗ Node.js v%NODE_MAJOR% detected, need v14+
  pause
  exit /b 1
)
echo   ^✓ Node.js v%NODE_MAJOR%

REM ─── Set paths ──────────────────────────────────────────────────────────────

set "AS_HOME=%USERPROFILE%\AjaxSpeaks 1.0"
set "AS_BIN=%AS_HOME%\bin"
set "PATH=%AS_BIN%;%PATH%"

REM ─── Create directories ─────────────────────────────────────────────────────

if not exist "%AS_HOME%\src" mkdir "%AS_HOME%\src"
if not exist "%AS_HOME%\projects" mkdir "%AS_HOME%\projects"
if not exist "%AS_HOME%\rules" mkdir "%AS_HOME%\rules"
if not exist "%AS_HOME%\backup" mkdir "%AS_HOME%\backup"
if not exist "%AS_BIN%" mkdir "%AS_BIN%"

REM ─── Create batch wrappers for each command ─────────────────────────────────

echo.
echo   Installing commands...

set COMMANDS=_AJAXREADS _AJAXLOADS _AJAXLOGS _AJAXFORGETS _AJAXHIDE _AJAXSEEK _AJAXRULE _AJAXBEATS

for %%C in (%COMMANDS%) do (
  set "SRC=%AS_HOME%\src\%%C.js"
  set "BAT=%AS_BIN%\%%C.bat"
  if exist "!SRC!" (
    echo @echo off > "!BAT!"
    echo node "!SRC!" %%* >> "!BAT!"
    echo   ^✓ %%C
  ) else (
    echo   ^⚠ !SRC! not found, skipping
  )
)

REM ─── Add to PATH ────────────────────────────────────────────────────────────

setx PATH "%AS_BIN%;%PATH%" >nul
echo   ^✓ Added %AS_BIN% to PATH

REM ─── Voice-friendly DOSKEY macros (Option 1 - ajax prefix) ──────────────────

echo.
echo   Adding voice-friendly aliases...

set MACRO_FILE=%APPDATA%\Microsoft\Command Processor\AjaxSpeaksAliases.txt
if not exist "%APPDATA%\Microsoft\Command Processor" mkdir "%APPDATA%\Microsoft\Command Processor"

REM Option 1: "ajax" prefix
echo ; AjaxSpeaks voice-friendly aliases (Option 1 - ajax prefix) > "%MACRO_FILE%"
echo ajaxreads=_AJAXREADS $*>> "%MACRO_FILE%"
echo ajaploads=_AJAXLOADS $*>> "%MACRO_FILE%"
echo ajaxlogs=_AJAXLOGS $*>> "%MACRO_FILE%"
echo ajaxforgets=_AJAXFORGETS $*>> "%MACRO_FILE%"
echo ajaxhide=_AJAXHIDE $*>> "%MACRO_FILE%"
echo ajaxseek=_AJAXSEEK $*>> "%MACRO_FILE%"
echo ajaxrule=_AJAXRULE $*>> "%MACRO_FILE%"
echo ajaxbeats=_AJAXBEATS $*>> "%MACRO_FILE%"

REM Option 2: verb-first
echo ; AjaxSpeaks voice-friendly aliases (Option 2 - verb-first) >> "%MACRO_FILE%"
echo readmem=_AJAXREADS $*>> "%MACRO_FILE%"
echo loadmem=_AJAXLOADS $*>> "%MACRO_FILE%"
echo logmem=_AJAXLOGS $*>> "%MACRO_FILE%"
echo wipemem=_AJAXFORGETS $*>> "%MACRO_FILE%"
echo scanmem=_AJAXHIDE $*>> "%MACRO_FILE%"
echo fillmem=_AJAXSEEK $*>> "%MACRO_FILE%"
echo rulemem=_AJAXRULE $*>> "%MACRO_FILE%"
echo playlist=_AJAXBEATS $*>> "%MACRO_FILE%"

REM Register DOSKEY auto-load via registry
reg add "HKCU\Software\Microsoft\Command Processor" /v Autorun /t REG_SZ /d "doskey /macrofile=\"%MACRO_FILE%\"" /f >nul 2>nul
echo   ^✓ Voice-friendly aliases added
echo     Option 1: ajaxreads, ajaploads, ajaxlogs, ajaxforgets, ajaxhide, ajaxseek, ajaxrule, ajaxbeats
echo     Option 2: readmem, loadmem, logmem, wipemem, scanmem, fillmem, rulemem, playlist

REM ─── Auto-save rule to AI tools ─────────────────────────────────────────────

echo.
echo   Saving AjaxSpeaks rule to AI tools...
node "%AS_HOME%\src\_AJAXRULE.js" --save


REM ─── Done ───────────────────────────────────────────────────────────────────

echo.
echo   ============================================
echo      AjaxSpeaks 1.0 — Installed!
echo   ============================================
echo.
echo   Commands available:
echo     _AJAXREADS      Discover context and build .mem
echo     _AJAXLOADS      Load .mem into project
echo     _AJAXLOGS       Log a session entry
echo     _AJAXFORGETS    Wipe the .mem file
echo     _AJAXHIDE       Scan .mem for secrets
echo     _AJAXSEEK       Fill placeholder values
echo     _AJAXRULE       Manage persistent AI tool rules
echo     _AJAXBEATS      Open AjaxBeats playlist
echo.
echo   Voice-friendly aliases also available:
echo     Option 1: ajaxreads, ajaploads, ajaxlogs, ...
echo     Option 2: readmem, loadmem, logmem, ...
echo     Restart terminal to activate DOSKEY macros.
echo.
echo   Location: %AS_HOME%
echo.
echo   You may need to restart your terminal for PATH changes to take effect.

echo.
pause
