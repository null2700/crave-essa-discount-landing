@echo off
rem Run this to start the Craveessa app on Windows.
rem It will load environment variables from .env (if present), install deps if needed, then start the server.

setlocal ENABLEDELAYEDEXPANSION

if exist .env (
  echo Loading environment variables from .env via PowerShell
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content .env | Where-Object {\$_ -and -not \$_.StartsWith('#')} | ForEach-Object { \$parts = \$_ -split '=',2; if(\$parts.Count -ge 2){ \$k=\$parts[0].Trim(); \$v=\$parts[1].Trim(); if(\$v.StartsWith('\"') -and \$v.EndsWith('\"')){ \$v=\$v.Trim('\"') }; [System.Environment]::SetEnvironmentVariable(\$k, \$v, 'Process') } }"
  if errorlevel 1 (
    echo Failed to load .env via PowerShell. Continuing without loading.
  )
)

rem Check for Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found in PATH. Please install Node.js (https://nodejs.org/) and try again.
  pause
  exit /b 1
)

rem Install dependencies if node_modules missing
if not exist node_modules (
  echo Installing npm dependencies...
  npm install || (
    echo npm install failed. Exiting.
    pause
    exit /b 1
  )
)

rem Start the app
echo Starting Craveessa server (npm start)...
npm start

endlocal