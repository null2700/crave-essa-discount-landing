<#
Run this script from the project root to start the app on Windows.
Usage (PowerShell):
  powershell -ExecutionPolicy Bypass -File .\run-windows.ps1
or (interactive):
  .\run-windows.ps1
#>

Write-Host "Running Craveessa runner (PowerShell)..."

$projRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projRoot

if (Test-Path .env) {
  Write-Host "Loading environment variables from .env"
  Get-Content .env | ForEach-Object {
    if (-not [string]::IsNullOrWhiteSpace($_) -and -not $_.TrimStart().StartsWith('#')) {
      $parts = $_ -split '=', 2
      if ($parts.Count -ge 2) {
        $k = $parts[0].Trim()
        $v = $parts[1].Trim()
        if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Trim('"') }
        Write-Host "  $k=`"$v`""
        [System.Environment]::SetEnvironmentVariable($k, $v, 'Process')
      }
    }
  }
}

# Check Node
try {
  $node = Get-Command node -ErrorAction Stop
} catch {
  Write-Error "Node.js not found in PATH. Install Node.js (https://nodejs.org/) and try again."
  exit 1
}

if (-not (Test-Path node_modules)) {
  Write-Host "Installing npm dependencies (this may take a while)..."
  $npm = Get-Command npm -ErrorAction SilentlyContinue
  if ($null -eq $npm) {
    Write-Error "npm not found. Make sure Node.js is installed with npm."
    exit 1
  }
  & npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed (exit code $LASTEXITCODE)."
    exit $LASTEXITCODE
  }
}

Write-Host "Starting app: npm start"
& npm start
