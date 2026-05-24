# Diana SDK Installer

Diana SDK Installer: CLI instalable por `uvx` para inicializar Diana SDK en cualquier proyecto desde cero.

## Uso

El paquete está en la raíz del repositorio oficial; no se necesita `#subdirectory`.

```bash
uvx --from "diana-sdk-installer @ git+https://github.com/UltraFIC/ai-dr.fic.git@v0.1.4" diana init
```

Si quieres siempre la última versión de la rama principal:

```bash
uvx --from "diana-sdk-installer @ git+https://github.com/UltraFIC/ai-dr.fic.git@main" diana init
```

La forma con `diana-sdk-installer @ ...` es la más robusta porque le indica a `uv` cuál es el paquete exacto a instalar.

## Comandos

- `diana init` - instala assets base de Diana en el proyecto destino.

## Opciones de `diana init`

- `--target <path>`: ruta destino (default: directorio actual)
- `--force`: sobrescribe archivos instalados por Diana
- `--skip-actions`: omite copia de `.github/prompts` y `.github/agents`

## Estructura instalada

- `.drfic/readme.md`
- `.drfic/diana-sdk/sdk/diana/**`
- `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`
- `.github/prompts/diana.*.prompt.md` (si no se usa `--skip-actions`)
- `.github/agents/diana.*.agent.md` (si no se usa `--skip-actions`)

Incluye soporte de sincronizacion de tareas Speckit -> Diana TEAM:
- Prompt/agent: `diana.sync`
- Script local: `.drfic/diana-sdk/sdk/diana/scripts/powershell/diana-sync-team.ps1`

Incluye centro de ayuda de Diana:
- Prompt/agent: `diana.help`
- Cobertura: sintaxis de comandos, tutorial SDD y guia de sincronizacion.
