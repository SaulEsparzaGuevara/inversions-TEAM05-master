param(
    [Parameter(Mandatory = $true)]
    [string]$Team,

    [Parameter(Mandatory = $true)]
    [string]$Feature,

    [ValidateSet("dry-run", "apply")]
    [string]$Mode = "dry-run",

    [string]$Project = "diana-inversions",
    [string]$Initiative = "001-inversions",

    [switch]$CloseOnly
)

if (-not $CloseOnly.IsPresent) {
    $CloseOnly = $true
}

$repoRoot = Get-Location
$teamTasksPath = Join-Path $repoRoot ".drfic/diana-sdk/projects/$Project/initiatives/$Initiative/teams/$Team/tasks.md"

if ($Feature -like "specs/*") {
    $featureTasksPath = Join-Path $repoRoot "$Feature/tasks.md"
} else {
    $featureTasksPath = Join-Path $repoRoot "specs/$Feature/tasks.md"
}

if (-not (Test-Path $teamTasksPath)) {
    throw "No se encontro archivo de team tasks: $teamTasksPath"
}

if (-not (Test-Path $featureTasksPath)) {
    throw "No se encontro archivo de feature tasks: $featureTasksPath"
}

$teamLines = Get-Content $teamTasksPath
$featureLines = Get-Content $featureTasksPath

# Speckit tasks status map: Tnnn -> bool completed
$speckitStatus = @{}
foreach ($line in $featureLines) {
    if ($line -match '^- \[( |x)\] T(\d{3})\b') {
        $id = "T$($matches[2])"
        $isDone = ($matches[1] -eq 'x')
        $speckitStatus[$id] = $isDone
    }
}

# Mapping rows in team tasks file:
# - Speckit T046 -> Diana T027, T033
$speckitToCanonical = @{}
$canonicalToSpeckit = @{}
$mappingConflicts = @()

foreach ($line in $teamLines) {
    if ($line -match '^- Speckit T(\d{3}) -> Diana (.+)$') {
        $speckitId = "T$($matches[1])"
        $rhs = $matches[2]
        $canonIds = [regex]::Matches($rhs, 'T\d{3}') | ForEach-Object { $_.Value }

        if ($canonIds.Count -eq 0) {
            $mappingConflicts += "Fila de mapeo sin ID canonico valido: $line"
            continue
        }

        $speckitToCanonical[$speckitId] = @($canonIds)
        foreach ($canon in $canonIds) {
            if (-not $canonicalToSpeckit.ContainsKey($canon)) {
                $canonicalToSpeckit[$canon] = @()
            }
            $canonicalToSpeckit[$canon] += $speckitId
        }
    }
}

$unmappedSpeckit = @()
foreach ($sid in $speckitStatus.Keys) {
    if (-not $speckitToCanonical.ContainsKey($sid)) {
        $unmappedSpeckit += $sid
    }
}

$syncCandidates = @()
$syncClosed = @()
$syncPending = @()

# Index team task lines by canonical ID
$teamTaskLineIndex = @{}
for ($i = 0; $i -lt $teamLines.Count; $i++) {
    if ($teamLines[$i] -match '^- \[( |x)\] (T\d{3})\b') {
        $teamTaskLineIndex[$matches[2]] = $i
    }
}

foreach ($canon in $canonicalToSpeckit.Keys) {
    $mappedSpeckit = @($canonicalToSpeckit[$canon] | Sort-Object -Unique)
    $missingInFeature = @()
    $completedCount = 0

    foreach ($sid in $mappedSpeckit) {
        if (-not $speckitStatus.ContainsKey($sid)) {
            $missingInFeature += $sid
            continue
        }
        if ($speckitStatus[$sid]) {
            $completedCount++
        }
    }

    $allDone = ($mappedSpeckit.Count -gt 0 -and $completedCount -eq $mappedSpeckit.Count -and $missingInFeature.Count -eq 0)
    $syncCandidates += [pscustomobject]@{
        canonical = $canon
        mappedSpeckit = ($mappedSpeckit -join ', ')
        completed = $completedCount
        total = $mappedSpeckit.Count
        missing = ($missingInFeature -join ', ')
        allDone = $allDone
    }

    if ($missingInFeature.Count -gt 0) {
        $mappingConflicts += "Mapeo $canon con tareas Speckit ausentes en feature: $($missingInFeature -join ', ')"
    }

    if (-not $teamTaskLineIndex.ContainsKey($canon)) {
        $mappingConflicts += "ID canonico $canon no existe en tasks de $Team"
        continue
    }

    $idx = $teamTaskLineIndex[$canon]
    $currentLine = $teamLines[$idx]
    $isClosedInTeam = ($currentLine -match '^- \[x\]')

    if ($allDone) {
        $syncClosed += $canon
        if ($Mode -eq "apply" -and -not $isClosedInTeam) {
            $teamLines[$idx] = $currentLine -replace '^- \[ \]', '- [x]'
        }
    } else {
        $syncPending += $canon
        if ($Mode -eq "apply" -and -not $CloseOnly -and $isClosedInTeam) {
            $teamLines[$idx] = $currentLine -replace '^- \[x\]', '- [ ]'
        }
    }
}

if ($Mode -eq "apply") {
    Set-Content -Path $teamTasksPath -Value $teamLines
}

$summary = [pscustomobject]@{
    mode = $Mode
    team = $Team
    feature = $Feature
    teamTasksPath = $teamTasksPath
    featureTasksPath = $featureTasksPath
    synchronized_closed = @($syncClosed | Sort-Object -Unique)
    synchronized_pending = @($syncPending | Sort-Object -Unique)
    conflicts = @($mappingConflicts | Sort-Object -Unique)
    unmapped_speckit_tasks = @($unmappedSpeckit | Sort-Object)
    candidates = $syncCandidates
}

$summary | ConvertTo-Json -Depth 6
