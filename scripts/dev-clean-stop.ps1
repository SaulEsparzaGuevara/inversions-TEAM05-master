Param(
  [int[]]$PortsToClean = @(3000, 5173, 5174, 5175)
)

$ErrorActionPreference = "Stop"

Write-Host "[stop] Terminating backend and frontend processes by name..."

# Terminate Node.js processes (backend)
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    Stop-Process -Id $_.Id -Force -ErrorAction Stop
    Write-Host "[stop] Terminated Node.js process (PID: $($_.Id))"
  }
  catch {
    Write-Warning "[stop] Could not terminate Node.js process (PID: $($_.Id)): $($_.Exception.Message)"
  }
}

# Terminate Vite processes (frontend)
Get-Process -Name "vite" -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    Stop-Process -Id $_.Id -Force -ErrorAction Stop
    Write-Host "[stop] Terminated Vite process (PID: $($_.Id))"
  }
  catch {
    Write-Warning "[stop] Could not terminate Vite process (PID: $($_.Id)): $($_.Exception.Message)"
  }
}

Write-Host "Done. Backend and frontend processes terminated."
