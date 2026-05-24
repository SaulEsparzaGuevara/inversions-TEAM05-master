---
agent: diana.change
description: Crea un archivo de control de cambios (UCC) por proyecto, numeracion secuencial automatica y ticket relacionado opcional/automatico con trazabilidad.
---

# /diana.change - Control de Cambios + Ticket Relacionado

## Uso

/diana.change project="demo-project" title="MFA para accesos criticos" description="Agregar MFA para roles trader/admin"
/diana.change project="demo-project" --input "docs/cambios/mfa-ucc.md"
/diana.change project="demo-project" create_ticket="false" title="Actualizar taxonomia de riesgo" description="Refinar categorias de riesgo"
/diana.change project="demo-project" title="MFA" description="..." ticket_title="Implementar MFA v1"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | create | validate | create | Crea o valida artefactos de cambio |
| project | string | requerido | Proyecto objetivo; se normaliza a `diana-<project>` |
| alias | string corto lowercase | auto (radar -> derivado) | Alias para nombres (`001-<alias>-ucc.md`) |
| input | ruta markdown | null | Fuente principal del contenido del UCC |
| title | string | null | Titulo del cambio (si no hay `input`) |
| description | string | null | Descripcion base (si no hay `input`) |
| content | string | null | Cuerpo completo inline para el UCC |
| create_ticket | true | false | true | Si `true`, crea ticket relacionado automaticamente |
| ticket_title | string | auto | Titulo del ticket derivado |
| ticket_description | string | auto | Descripcion del ticket derivado |

## Objetivo

Crear un UCC canonico del proyecto en `governance/change-requests` y, por defecto, crear tambien el ticket relacionado en `governance/tickets`.

## Resolucion de Alias por Default

Orden de resolucion de `alias`:
1. Si se pasa `alias`, usarlo.
2. Si no se pasa, buscar `alias` persistido del proyecto en `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`.
3. Si no existe en radar, autoderivar desde `<project-sin-prefijo>`.

## Reglas de Resolucion de Contenido

Prioridad para construir el contenido del UCC:

1. Si existe `--input`, usar el contenido completo del archivo.
2. Si no hay `input` y existe `content`, usar `content`.
3. Si no hay `input` ni `content`, usar plantilla minima con `title` + `description`.
4. Si no hay suficiente informacion para (1-3), detener con error accionable.

## Reglas de Numeracion

1. Buscar en `.drfic/diana-sdk/projects/<project>/governance/change-requests/`.
2. Detectar mayor prefijo numerico `NNN-*.md`.
3. Usar `NNN+1` para el nuevo UCC.
4. UCC resultante: `NNN-<alias>-ucc.md`.
5. Si `create_ticket=true`, crear ticket con el mismo `NNN` por trazabilidad: `NNN-<alias>-tkt.md`.

## Estructura de Salida

- UCC:
  - `.drfic/diana-sdk/projects/<project>/governance/change-requests/NNN-<alias>-ucc.md`
- Ticket relacionado (si `create_ticket=true`):
  - `.drfic/diana-sdk/projects/<project>/governance/tickets/NNN-<alias>-tkt.md`

## Plantilla Minima UCC (si no hay input)

```markdown
# Control de Cambios
## NNN-<alias>-ucc

## Titulo
<title>

## Contexto
<description>

## Alcance
- Definir alcance funcional

## Impacto Esperado
- Impacto en procesos, sistema o usuarios

## Riesgos
- Riesgo 1

## Estado
- Draft
```

## Plantilla Minima Ticket Relacionado

```markdown
# Ticket de Servicio
## NNN-<alias>-tkt

## Relacion
- UCC: NNN-<alias>-ucc

## Titulo
<ticket_title or title>

## Solicitud
<ticket_description or description>

## Prioridad
- medium

## Estado
- OPEN
```

## Action=create

- Resolver `project` y `alias`.
- Resolver contenido del UCC con la prioridad definida.
- Crear UCC secuencial.
- Si `create_ticket=true`, crear ticket relacionado con mismo `NNN`.
- Reportar IDs y rutas creadas.

## Action=validate

Verificar:
- UCC existe y cumple naming `NNN-<alias>-ucc.md`.
- Si existe ticket relacionado, referencia el UCC correcto.
- Numeracion no colisiona.

Devolver:
- `OK: [n]`
- `GAPS: [n]`
- Acciones sugeridas.

## Hooks de Extension

Antes de crear, revisar `.specify/extensions.yml` en `hooks.before_change`.
Despues de crear, revisar `.specify/extensions.yml` en `hooks.after_change`.
Aplicar politica `optional/enabled` equivalente a otras acciones Diana.
