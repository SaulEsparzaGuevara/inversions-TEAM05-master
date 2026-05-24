# Diana SDK Installers

Estos instaladores preparan un proyecto para usar Diana sin depender de `.specify`.

## PowerShell

```powershell
pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/install-diana.ps1
```

Opciones:
- `-TargetPath <ruta>`: destino del proyecto (default: `.`)
- `-Force`: sobrescribe archivos existentes del setup Diana
- `-SkipActions`: no copia `.github/prompts` y `.github/agents` de Diana

## Bash

```bash
bash .drfic/diana-sdk/sdk/diana/scripts/bash/install-diana.sh
```

Opciones:
- `--target <ruta>`: destino del proyecto (default: `.`)
- `--force`: sobrescribe archivos existentes del setup Diana
- `--skip-actions`: no copia `.github/prompts` y `.github/agents` de Diana

## Resultado minimo esperado

- `.drfic/readme.md`
- `.drfic/diana-sdk/sdk/diana/` (core)
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
- `.github/prompts/diana.*.prompt.md` (si no se usa skip)
- `.github/agents/diana.*.agent.md` (si no se usa skip)

## Sync Speckit -> Diana TEAM

Script utilitario para reconciliar estado de tareas Speckit hacia tasks canonicos del team:

```powershell
pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode dry-run
pwsh .drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1 -Team TEAM-01 -Feature 002-team-01-dashboard-brokers -Mode apply
```

Notas:
- No elimina tareas extendidas de Speckit.
- Solo sincroniza cierre de IDs canonicos existentes via mapeo explicito `Speckit Txxx -> Diana Tyyy`.
