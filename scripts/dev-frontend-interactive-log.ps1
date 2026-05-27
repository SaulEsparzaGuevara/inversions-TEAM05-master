$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendDir = Join-Path $repoRoot "projects/pwa/inversions_app"
$logPath = Join-Path $repoRoot ".tmp-ai-drfic\frontend-dev.out.log"

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}

Set-Location $frontendDir
npx vite --port 5173 --strictPort 2>&1 | Tee-Object -FilePath $logPath

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
