Param(
  [int[]]$PortsToClean = @(3000, 5173, 5174, 5175),
  [bool]$StreamLogs = $false
)

$ErrorActionPreference = "Stop"

function Stop-ListenersOnPorts {
  Param([int[]]$Ports)

  foreach ($port in $Ports) {
    $listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($listener in $listeners) {
      try {
        Stop-Process -Id $listener.OwningProcess -Force -ErrorAction Stop
        Write-Host "[clean] Closed process $($listener.OwningProcess) on port $port"
      }
      catch {
        Write-Warning "[clean] Could not stop PID $($listener.OwningProcess) on port ${port}: $($_.Exception.Message)"
      }
    }
  }
}

function Wait-BackendHealth {
  Param(
    [string]$HealthUrl = "http://localhost:3000/health",
    [int]$TimeoutSeconds = 45
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 2
      if ($response.status -eq "ok") {
        return $true
      }
    }
    catch {
      # Keep polling until timeout.
    }

    Start-Sleep -Milliseconds 500
  }

  return $false
}

function Start-DetachedProcess {
  Param(
    [string]$WorkingDirectory,
    [string]$Command,
    [string]$StdOutPath,
    [string]$StdErrPath
  )

  if (Test-Path $StdOutPath) {
    Remove-Item $StdOutPath -Force
  }

  if (Test-Path $StdErrPath) {
    Remove-Item $StdErrPath -Force
  }

  return Start-Process -FilePath "cmd.exe" -ArgumentList "/d", "/s", "/c", $Command -WorkingDirectory $WorkingDirectory -PassThru -RedirectStandardOutput $StdOutPath -RedirectStandardError $StdErrPath
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "projects/rest-api/inversions_api"
$frontendDir = Join-Path $repoRoot "projects/pwa/inversions_app"

if (-not (Test-Path $backendDir)) {
  throw "Backend directory not found: $backendDir"
}

if (-not (Test-Path $frontendDir)) {
  throw "Frontend directory not found: $frontendDir"
}

Write-Host "[1/3] Skipping port cleaning (debug bypass)..."
# Stop-ListenersOnPorts -Ports $PortsToClean

Write-Host "[2/3] Syncing development token to frontend .env.local..."
Push-Location $backendDir
try {
  npm run dev:token:sync | Out-Host
}
finally {
  Pop-Location
}

$logsDir = Join-Path $repoRoot ".tmp-ai-drfic"
if (-not (Test-Path $logsDir)) {
  New-Item -Path $logsDir -ItemType Directory | Out-Null
}

$combinedLog = Join-Path $logsDir "dev-combined.out.log"
$backendOutLog = Join-Path $logsDir "backend-dev.out.log"
$backendErrLog = Join-Path $logsDir "backend-dev.err.log"
$frontendOutLog = Join-Path $logsDir "frontend-dev.out.log"
$frontendErrLog = Join-Path $logsDir "frontend-dev.err.log"

if (Test-Path $combinedLog) {
  Remove-Item $combinedLog -Force
}

if ($StreamLogs) {
  Write-Host "[3/3] Starting backend and frontend (interactive + log)..."
} else {
  Write-Host "[3/3] Starting backend and frontend (background + file logs)..."
}
Write-Host "- Backend: http://localhost:3000"
Write-Host "- Frontend: http://localhost:5173"
Write-Host "- Logs: $logsDir"
Write-Host ""
if ($StreamLogs) {
  Write-Host "StreamLogs=true: showing live process output in this terminal."
  Write-Host "Press Ctrl+C to stop both services."
} else {
  Write-Host "StreamLogs=false: services start in background and only write logs to disk."
}

$backendCommand = "cd /d $backendDir && npx ts-node src/index.ts"
$frontendCommand = "pwsh -NoProfile -File scripts/dev-frontend-wait-backend.ps1"

if ($StreamLogs) {
  $concurrentlyArgs = @(
    "concurrently",
    "--raw",
    "--kill-others-on-fail",
    "--names", "backend,frontend",
    "--prefix", "[{name}]",
    "--prefix-colors", "blue,magenta",
    $backendCommand,
    $frontendCommand
  )

  & npx @concurrentlyArgs 2>&1 | Tee-Object -FilePath $combinedLog
  exit $LASTEXITCODE
}

$backendProcess = Start-DetachedProcess -WorkingDirectory $backendDir -Command "npx ts-node src/index.ts" -StdOutPath $backendOutLog -StdErrPath $backendErrLog

if (-not (Wait-BackendHealth)) {
  Write-Error "Backend health did not become ready. Revisa $backendOutLog y $backendErrLog"
  try {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
  }
  catch {}
  exit 1
}

$frontendProcess = Start-DetachedProcess -WorkingDirectory $repoRoot -Command "pwsh -NoProfile -File scripts/dev-frontend-wait-backend.ps1" -StdOutPath $frontendOutLog -StdErrPath $frontendErrLog

Write-Host ""
Write-Host "Started in background:"
Write-Host "- Backend PID: $($backendProcess.Id)"
Write-Host "- Frontend PID: $($frontendProcess.Id)"
Write-Host "- Enable live logs with: npm run dev:clean-start:logs"
