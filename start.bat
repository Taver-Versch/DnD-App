@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is not installed or not on PATH.
    echo Download it from https://nodejs.org and try again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies - this only happens once...
    call npm install
    if errorlevel 1 (
        echo npm install failed. See the error above.
        pause
        exit /b 1
    )
)

echo.
echo Starting D^&D Helper...
echo Once it says "Network:", that URL is what other devices on your
echo Wi-Fi / LAN can use to open the same app on their own browser.
echo Press Ctrl+C in this window to stop the server.
echo.

REM "npm run" itself is called directly, not through npm's script runner:
REM npm's run-script mechanism breaks on Windows when the folder path
REM contains "&" (as in "D&D App"), so the build/preview tools are invoked
REM directly via node instead - npm install above is unaffected and fine.
node ./node_modules/typescript/bin/tsc -b
if errorlevel 1 (
    echo Build failed - see the error above.
    pause
    exit /b 1
)
node ./node_modules/vite/bin/vite.js build
if errorlevel 1 (
    echo Build failed - see the error above.
    pause
    exit /b 1
)
node ./node_modules/vite/bin/vite.js preview --host --port 4173
pause
