$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot "projects/rest-api/inversions_api"
$logPath = Join-Path $repoRoot ".tmp-ai-drfic\backend-dev.out.log"

if (Test-Path $logPath) {
  Remove-Item $logPath -Force
}

Set-Location $backendDir
npx ts-node src/index.ts 2>&1 | Tee-Object -FilePath $logPath

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}
