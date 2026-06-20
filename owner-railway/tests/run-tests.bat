@echo off
REM Craveessa API Test Runner - Windows Batch Script
REM This script runs the comprehensive API test suite

echo.
echo ════════════════════════════════════════════════════════════
echo  Craveessa API Integration Test Suite
echo ════════════════════════════════════════════════════════════
echo.

REM Check if server is running
echo Checking if server is running on localhost:3000...
timeout /t 2 /nobreak >nul

REM Run the test suite
echo.
echo Starting test suite...
echo.

node "%~dp0api.test.js"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Tests completed successfully!
    echo.
    echo Check the test-reports folder for detailed HTML and JSON reports.
    echo.
) else (
    echo.
    echo ✗ Tests encountered an error!
    echo Please check the error message above.
    echo.
)

pause
