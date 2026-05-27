Param(
  [string]$BackendHealthUrl = "http://localhost:3000/health",
  [int]$TimeoutSeconds = 45
)
$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot "projects/pwa/inversions_app"


$ErrorActionPreference = "Stop"
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)

Write-Host "[frontend] Waiting for backend health at $BackendHealthUrl ..."

$healthy = $false
while ((Get-Date) -lt $deadline) {
  try {
    $response = Invoke-RestMethod -Uri $BackendHealthUrl -Method Get -TimeoutSec 2
    if ($response.status -eq "ok") {
      $healthy = $true
      break
    }
  }
  catch {
    # Keep polling until timeout.
  }

  Start-Sleep -Milliseconds 500
}

if (-not $healthy) {
  throw "Backend health endpoint did not become ready in ${TimeoutSeconds}s: $BackendHealthUrl"
}

Write-Host "[frontend] Backend is ready. Starting Vite..."
Set-Location $frontendDir
npx vite --port 5173 --strictPort
