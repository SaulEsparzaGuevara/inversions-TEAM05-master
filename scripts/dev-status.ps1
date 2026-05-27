Param(
  [int[]]$Ports = @(3000, 5173),
  [string]$HealthUrl = "http://localhost:3000/health",
  [int]$TailLines = 30,
  [string]$LogsDir = ".tmp-ai-drfic"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedLogsDir = Join-Path $repoRoot $LogsDir

Write-Host "== Service Health =="
try {
  $response = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 2
  if ($response.status -eq "ok") {
    Write-Host "health: UP ($HealthUrl)"
  }
  else {
    Write-Host "health: UNEXPECTED ($HealthUrl)"
    Write-Host "response: $($response | ConvertTo-Json -Compress)"
  }
}
catch {
  Write-Host "health: DOWN ($HealthUrl)"
}

Write-Host ""
Write-Host "== Port Status =="
Write-Host "[debug bypass] Skipping port status checks..."

Write-Host ""
Write-Host "== Recent Logs =="
if (-not (Test-Path $resolvedLogsDir)) {
  Write-Host "logs dir missing: $resolvedLogsDir"
  exit 0
}

$logFiles = @(
  "backend-dev.out.log",
  "backend-dev.err.log",
  "frontend-dev.out.log",
  "frontend-dev.err.log"
)

foreach ($logFile in $logFiles) {
  $logPath = Join-Path $resolvedLogsDir $logFile
  Write-Host ""
  Write-Host "-- $logFile --"

  if (-not (Test-Path $logPath)) {
    Write-Host "[missing] $logPath"
    continue
  }

  $lines = Get-Content -Path $logPath -Tail $TailLines -ErrorAction SilentlyContinue
  if (-not $lines) {
    Write-Host "[empty]"
    continue
  }

  $lines | Out-Host
}
