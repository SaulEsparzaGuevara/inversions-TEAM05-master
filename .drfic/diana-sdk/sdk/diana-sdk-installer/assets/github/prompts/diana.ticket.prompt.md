---
agent: diana.ticket
description: Crea tickets de servicio canonicos por proyecto con numeracion secuencial automatica, en modo independiente o vinculados a un UCC existente.
---

# /diana.ticket - Ticket de Servicio

## Uso

/diana.ticket project="demo-project" title="Validar flujo de pago" description="Revisar errores 500 en checkout"
/diana.ticket project="demo-project" --input "docs/tickets/incidente-checkout.md"
/diana.ticket project="demo-project" relation_mode="linked" ucc_ref="001-demo-ucc" title="Implementar MFA"
/diana.ticket project="demo-project" relation_mode="standalone" title="Actualizar dashboard"
/diana.ticket project="demo-project" relation_mode="reuse" ucc_ref="001-demo-ucc" title="Fase 2 de MFA"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | create | validate | create | Crea o valida tickets |
| project | string | requerido | Proyecto objetivo; se normaliza a `diana-<project>` |
| alias | string corto lowercase | auto (radar -> derivado) | Alias para nombres (`NNN-<alias>-tkt.md`) |
| input | ruta markdown | null | Fuente completa de contenido |
| title | string | null | Titulo del ticket (si no hay `input`) |
| description | string | null | Descripcion del ticket (si no hay `input`) |
| content | string | null | Cuerpo completo inline del ticket |
| relation_mode | standalone | linked | reuse | standalone | Modo de relacion con UCC |
| ucc_ref | string | null | Referencia UCC (`001-demo-ucc`) cuando aplique |
| priority | high | medium | low | medium | Prioridad del ticket |

## Objetivo

Crear tickets de servicio canonicos en `governance/tickets` permitiendo:
- tickets independientes,
- tickets vinculados a un UCC,
- tickets adicionales que reutilizan un UCC ya existente.

## Resolucion de Alias por Default

Orden de resolucion de `alias`:
1. Si se pasa `alias`, usarlo.
2. Si no se pasa, buscar `alias` persistido del proyecto en `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`.
3. Si no existe en radar, autoderivar desde `<project-sin-prefijo>`.

## Modos de Relacion

1. `standalone`:
- No requiere UCC.
- Ticket autonomo.

2. `linked`:
- Requiere `ucc_ref`.
- Ticket referencia explicitamente al UCC.

3. `reuse`:
- Requiere `ucc_ref`.
- Permite multiples tickets para el mismo UCC.

## Reglas de Resolucion de Contenido

Prioridad para contenido del ticket:

1. Si existe `--input`, usar el contenido completo del archivo.
2. Si no hay `input` y existe `content`, usar `content`.
3. Si no hay `input` ni `content`, usar plantilla minima con `title`, `description`, `priority`.
4. Si falta informacion minima, detener con error accionable.

## Reglas de Numeracion

1. Buscar en `.drfic/diana-sdk/projects/<project>/governance/tickets/`.
2. Detectar mayor prefijo numerico `NNN-*.md`.
3. Crear nuevo ticket con `NNN+1`.
4. Ticket resultante: `NNN-<alias>-tkt.md`.

Nota: Solo `/diana.change` puede forzar mismo `NNN` entre UCC y ticket para trazabilidad directa de alta.

## Estructura de Salida

- `.drfic/diana-sdk/projects/<project>/governance/tickets/NNN-<alias>-tkt.md`

## Plantilla Minima Ticket (si no hay input)

```markdown
# Ticket de Servicio
## NNN-<alias>-tkt

## Titulo
<title>

## Solicitud
<description>

## Prioridad
<priority>

## Relacion UCC
<ucc_ref or "N/A">

## Estado
- OPEN
```

## Action=create

- Resolver `project` y `alias`.
- Validar `relation_mode` y `ucc_ref` cuando aplique.
- Resolver contenido.
- Crear ticket secuencial.
- Reportar ruta e ID.

## Action=validate

Verificar:
- Naming correcto `NNN-<alias>-tkt.md`.
- Si hay `relation_mode in (linked,reuse)`, referencia UCC presente.
- Numeracion sin colision.

Devolver:
- `OK: [n]`
- `GAPS: [n]`
- Acciones sugeridas.

## Hooks de Extension

Antes de crear, revisar `.specify/extensions.yml` en `hooks.before_ticket`.
Despues de crear, revisar `.specify/extensions.yml` en `hooks.after_ticket`.
Aplicar politica `optional/enabled` equivalente a otras acciones Diana.
