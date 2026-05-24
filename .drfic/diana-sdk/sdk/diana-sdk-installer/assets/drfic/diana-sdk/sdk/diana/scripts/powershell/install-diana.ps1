#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [string]$TargetPath = ".",
    [switch]$Force,
    [switch]$SkipActions
)

$ErrorActionPreference = "Stop"

function Resolve-AbsolutePath {
    param([string]$Path)
    $resolved = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
    if ($resolved) { return $resolved.Path }
    $full = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $Path))
    return $full
}

function Ensure-Directory {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Copy-Tree {
    param(
        [string]$Source,
        [string]$Destination,
        [switch]$Overwrite
    )

    Ensure-Directory -Path $Destination

    Get-ChildItem -LiteralPath $Source -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($Source.Length).TrimStart('\\', '/')
        $destFile = Join-Path $Destination $relative
        $destDir = Split-Path -Parent $destFile
        Ensure-Directory -Path $destDir

        if ((-not (Test-Path -LiteralPath $destFile)) -or $Overwrite) {
            Copy-Item -LiteralPath $_.FullName -Destination $destFile -Force
        }
    }
}

function Copy-ByPattern {
    param(
        [string]$SourceDir,
        [string]$DestinationDir,
        [string]$Pattern,
        [switch]$Overwrite
    )

    if (-not (Test-Path -LiteralPath $SourceDir -PathType Container)) {
        return
    }

    Ensure-Directory -Path $DestinationDir

    Get-ChildItem -LiteralPath $SourceDir -File -Filter $Pattern | ForEach-Object {
        $dest = Join-Path $DestinationDir $_.Name
        if ((-not (Test-Path -LiteralPath $dest)) -or $Overwrite) {
            Copy-Item -LiteralPath $_.FullName -Destination $dest -Force
        }
    }
}

$scriptRoot = Resolve-AbsolutePath -Path $PSScriptRoot
$sourceDianaRoot = Resolve-AbsolutePath -Path (Join-Path $scriptRoot "../..")
$sourceRepoRoot = Resolve-AbsolutePath -Path (Join-Path $sourceDianaRoot "../../../..")
$targetRoot = Resolve-AbsolutePath -Path $TargetPath

Ensure-Directory -Path $targetRoot

$targetDrfic = Join-Path $targetRoot ".drfic"
$targetDianaSdk = Join-Path $targetDrfic "diana-sdk"
$targetSdkDiana = Join-Path $targetDianaSdk "sdk/diana"
$targetProjects = Join-Path $targetDianaSdk "projects"
$targetMemory = Join-Path $targetDianaSdk "memory"

Ensure-Directory -Path $targetDrfic
Ensure-Directory -Path $targetDianaSdk
Ensure-Directory -Path $targetProjects
Ensure-Directory -Path $targetMemory
Ensure-Directory -Path $targetSdkDiana

$drficReadme = Join-Path $targetDrfic "readme.md"
if ((-not (Test-Path -LiteralPath $drficReadme)) -or $Force) {
    @"
# DR.FIC Workspace

Estructura base de Diana SDK instalada.
"@ | Set-Content -LiteralPath $drficReadme -Encoding UTF8
}

$sourceDianaNormalized = [System.IO.Path]::GetFullPath($sourceDianaRoot)
$targetDianaNormalized = [System.IO.Path]::GetFullPath($targetSdkDiana)

if ($sourceDianaNormalized -ne $targetDianaNormalized) {
    Copy-Tree -Source $sourceDianaRoot -Destination $targetSdkDiana -Overwrite:$Force
}

$radarDir = Join-Path $targetProjects "knowledge/indexes"
Ensure-Directory -Path $radarDir
$radarFile = Join-Path $radarDir "projects-knowledge-radar.yaml"
if ((-not (Test-Path -LiteralPath $radarFile)) -or $Force) {
    @"
version: 1.0.0
scope: projects-root
last_updated: 2026-04-29

policy:
  always_on_radar:
    - projects-root
    - project-active
  optional_layers:
    - sdk-shared

projects: []
"@ | Set-Content -LiteralPath $radarFile -Encoding UTF8
}

if (-not $SkipActions) {
    $sourcePrompts = Join-Path $sourceRepoRoot ".github/prompts"
    $sourceAgents = Join-Path $sourceRepoRoot ".github/agents"
    $targetPrompts = Join-Path $targetRoot ".github/prompts"
    $targetAgents = Join-Path $targetRoot ".github/agents"

    Copy-ByPattern -SourceDir $sourcePrompts -DestinationDir $targetPrompts -Pattern "diana.*.prompt.md" -Overwrite:$Force
    Copy-ByPattern -SourceDir $sourceAgents -DestinationDir $targetAgents -Pattern "diana.*.agent.md" -Overwrite:$Force
}

Write-Host "Diana SDK instalado correctamente en: $targetRoot"
Write-Host "- Core SDK: .drfic/diana-sdk/sdk/diana"
Write-Host "- Radar base: .drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml"
if (-not $SkipActions) {
    Write-Host "- Acciones Diana: .github/prompts y .github/agents"
}
