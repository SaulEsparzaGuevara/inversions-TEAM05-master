param(
  [string]$MigrationPath = "projects/rest-api/inversions_api/src/database/supabase/migrations/003_canonical_schema.sql"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $MigrationPath)) {
  Write-Error "Migration file not found: $MigrationPath"
  exit 1
}

$content = Get-Content -LiteralPath $MigrationPath -Raw

$requiredTables = @(
  "team_members",
  "senal_confluente",
  "decision_humana",
  "intento_ejecucion",
  "evento_auditoria"
)

$requiredPolicies = @(
  "team_members_read",
  "signal_read_team",
  "decision_read_parent_team",
  "intento_read_parent_team",
  "audit_read_team"
)

$missing = New-Object System.Collections.Generic.List[string]

foreach ($table in $requiredTables) {
  $pattern = [regex]::Escape("ALTER TABLE public.$table ENABLE ROW LEVEL SECURITY;")
  if (-not [regex]::IsMatch($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
    $missing.Add("RLS not enabled for table: $table")
  }
}

foreach ($policy in $requiredPolicies) {
  $pattern = [regex]::Escape("CREATE POLICY $policy")
  if (-not [regex]::IsMatch($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
    $missing.Add("Missing policy: $policy")
  }
}

if (-not ($content -match "auth\.uid\(\)")) {
  $missing.Add("No auth.uid() usage found in policies")
}

if (-not ($content -match "auth\.role\(\)\s*=\s*'service_role'")) {
  $missing.Add("No service_role safeguard found in policies")
}

Write-Host "RLS static validation report"
Write-Host "- Migration: $MigrationPath"
Write-Host "- Required tables checked: $($requiredTables -join ', ')"
Write-Host "- Required policies checked: $($requiredPolicies -join ', ')"

if ($missing.Count -gt 0) {
  Write-Host "[FAIL] RLS static validation detected gaps:"
  foreach ($item in $missing) {
    Write-Host "  - $item"
  }
  exit 2
}

Write-Host "[PASS] Required RLS enablement and policy signatures detected."
Write-Host "Note: This is a static SQL check and does not replace runtime JWT-role E2E validation."
exit 0
