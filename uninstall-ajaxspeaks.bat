@echo off
REM ────────────────────────────────────────────────────────────────────────────
REM AjaxSpeaks 1.0 — Windows Uninstaller
REM ────────────────────────────────────────────────────────────────────────────
REM Creates a backup, removes rules from AI tools, and optionally deletes files.
REM ────────────────────────────────────────────────────────────────────────────

setlocal enabledelayedexpansion

set "AS_HOME=%USERPROFILE%\AjaxSpeaks 1.0"
set "AS_BIN=%AS_HOME%\bin"

echo.
echo   ============================================
echo      AjaxSpeaks 1.0 — Uninstall
echo   ============================================
echo.

if not exist "%AS_HOME%" (
  echo   ^ℹ AjaxSpeaks 1.0 is not installed at %AS_HOME%
  pause
  exit /b 0
)

REM ─── Step 1: Backup ─────────────────────────────────────────────────────────

echo   Step 1: Creating backup...

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set DT=%%I
set "TIMESTAMP=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%_%DT:~8,2%-%DT:~10,2%-%DT:~12,2%"
set "BACKUP_DIR=%USERPROFILE%\ajaxspeaks-uninstall-backup-%TIMESTAMP%"

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

if exist "%AS_HOME%\projects" (
  xcopy /E /I /Y "%AS_HOME%\projects" "%BACKUP_DIR%\projects" >nul
  echo   ^✓ Projects backed up
)

if exist "%AS_HOME%\rules" (
  xcopy /E /I /Y "%AS_HOME%\rules" "%BACKUP_DIR%\rules" >nul
  echo   ^✓ Rules backed up
)

REM ─── Step 2: Remove rules from AI tools ─────────────────────────────────────

echo.
echo   Step 2: Removing AjaxSpeaks rules from AI tools...
if exist "%AS_HOME%\src\_AJAXRULE.js" (
  node "%AS_HOME%\src\_AJAXRULE.js" --unsave
)

REM ─── Step 3: Remove batch wrappers ──────────────────────────────────────────

echo.
echo   Step 3: Removing commands...

set COMMANDS=_AJAXREADS _AJAXLOADS _AJAXLOGS _AJAXFORGETS _AJAXHIDE _AJAXSEEK _AJAXRULE _AJAXBEATS
for %%C in (%COMMANDS%) do (
  if exist "%AS_BIN%\%%C.bat" (
    del "%AS_BIN%\%%C.bat"
    echo   ^✓ Removed %%C
  )
)

REM ─── Step 4: Ask about deletion ─────────────────────────────────────────────

echo.
echo   Step 4: Cleanup
set /p "CONFIRM=  Delete %AS_HOME%? (y/N): "
if /i "!CONFIRM!"=="y" (
  rmdir /S /Q "%AS_HOME%" 2>nul
  echo   ^✓ Deleted %AS_HOME%
) else (
  echo   ^ℹ Kept %AS_HOME%
)

REM ─── Done ───────────────────────────────────────────────────────────────────

echo.
echo   ============================================
echo      AjaxSpeaks 1.0 — Uninstalled
echo   ============================================
echo.
echo   Backup saved: %BACKUP_DIR%
echo.
pause
