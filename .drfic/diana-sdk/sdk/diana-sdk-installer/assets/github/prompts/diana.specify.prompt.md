---
agent: diana.specify
description: Genera, valida o regenera la especificacion canonica de una iniciativa Diana, usando como fuente principal la constitucion del proyecto, el UCC y el meta, enriquecida por skills y knowledge.
---

# /diana.specify — Generador de Especificacion Canonica Diana

## Uso

/diana.specify action="generate"
/diana.specify action="validate"
/diana.specify action="regenerate"
/diana.specify project="diana-inversions"

Con entrada explicita:

/diana.specify action="generate" --input ".drfic/diana-sdk/projects/diana-inversions/governance/change-requests/001-inv-ucc.md"

Con iniciativa especifica:

/diana.specify project="diana-inversions" initiative="001-inversions" title="Plataforma de Inversiones con IA"

## Argumentos

| Argumento | Valores | Default | Descripcion |
|-----------|---------|---------|-------------|
| action | generate \| validate \| regenerate | generate | Operacion sobre la spec |
| project | id en projects-knowledge-radar | diana-inversions | Proyecto objetivo |
| alias | string corto lowercase | auto (radar -> derivado) | Alias para nombres de archivo (`NNN-<alias>-spec.md`) |
| initiative | id de iniciativa | auto-detect | Iniciativa objetivo; se auto-detecta si se omite |
| input | ruta de archivo markdown | null | Override de fuente primaria para la spec |
| title | string | null | Titulo de la spec si no hay fuente disponible |
| description | string | null | Descripcion base si no hay fuente disponible |

## Comportamiento por default (si omites argumentos)

- Si omites `action`, se usa `action="generate"`.
- Si omites `project`, se usa `project="diana-inversions"`.
- Si omites `alias`, se resuelve desde el radar del proyecto; si no existe en radar, se autoderiva desde `<project-sin-prefijo>` (primeras 3 letras alfanumericas).
- Si omites `initiative`, se auto-detecta la iniciativa activa leyendo las carpetas en `initiatives/` y seleccionando la de mayor prefijo numerico `NNN-*`.
- Si no existe ninguna iniciativa, crear directorio `001-<alias>/` y usar `initiative="001-<alias>"`.

## Resolucion de Alias por Default

Orden de resolucion de `alias`:
1. Si se pasa `alias`, usarlo.
2. Si no se pasa, buscar `alias` persistido del proyecto en `.drfic/diana-sdk/projects/knowledge/indexes/projects-knowledge-radar.yaml`.
3. Si no existe en radar, autoderivar desde `<project-sin-prefijo>`.

## Objetivo

Producir una especificacion funcional canonica, trazable y validable para una iniciativa del proyecto Diana, derivada principalmente de la constitucion y el UCC, enriquecida por knowledge y skills, coherente con la spec operativa en `specs/`.

## Regla de Fuentes (obligatoria, en orden de prioridad)

> La **constitucion canonica siempre se carga**, independientemente de si se pasa `--input` o no.
> `--input` reemplaza unicamente la resolucion automatica del UCC, no elimina la lectura de la constitucion.

**Fuente arquitectonica (siempre obligatoria)**:
- `.drfic/diana-sdk/projects/<project>/<alias>-constitution.md` — base constitucional del proyecto.
  - Si no existe constitucion, detener con error y recomendar `/diana.constitution` primero.

**Fuente de cambio/alcance (en orden)**:
1. Si se pasa `--input`, usar ese archivo como el documento de cambio/contexto principal (en lugar del UCC auto-detectado).
2. Si no hay `--input`, auto-resolver el UCC mas reciente:
   - `.drfic/diana-sdk/projects/<project>/governance/change-requests/NNN-<alias>-ucc.md`
   - Seleccionar por mayor prefijo numerico `NNN-*.md`.
3. Si no existe ni input ni UCC, continuar solo con constitucion + meta (degradado, reportar el gap).

**Contexto de iniciativa**:
- `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/meta.md` — siempre como complemento si existe.

**Fallback minimo**:
- Si no hay constitucion ni input ni UCC, usar `title` + `description` como contenido base.
- Si no hay suficiente informacion ni para esto, detener con error accionable.

## Fuentes de Enriquecimiento (no sustituyen fuente primaria)

Cargar como contexto adicional para mayor precision:

- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/skills-manifest.yaml`
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/agent-skill-matrix.yaml`
- `.drfic/diana-sdk/projects/knowledge/indexes/master-index.md`
- `.drfic/diana-sdk/projects/<project>/knowledge/indexes/master-index.md`
- `specs/*/spec.md` — spec operativa existente (si hay) para validacion cruzada y coherencia.

Si falta knowledge o skills, continuar con metodologia estandar y reportar gap.

## Reglas de Numeracion de Iniciativa

1. Buscar carpetas en `.drfic/diana-sdk/projects/<project>/initiatives/`.
2. Si ya existe la iniciativa indicada, usar ese directorio.
3. Si no existe `initiative` especificado, detectar el directorio con mayor prefijo `NNN-*`.
4. Si no existe ninguna iniciativa, crear `001-<alias>/` como primera iniciativa.
5. El archivo de spec resultante: `NNN-<alias>-spec.md` dentro del directorio de la iniciativa.

## Salidas Obligatorias

1. Spec canonica de la iniciativa:
   - `.drfic/diana-sdk/projects/<project>/initiatives/<initiative>/NNN-<alias>-spec.md`

2. Reporte de trazabilidad constitucion/UCC → Spec (en salida):
   - Principios constitucionales reflejados en la spec.
   - Cambios del UCC incorporados como requisitos.
   - Gaps detectados y decision tomada.

3. Reporte de validacion (solo en `action=validate`):
   - `OK: [n]` — secciones consistentes.
   - `GAPS: [n]` — secciones con discrepancias.
   - Acciones sugeridas.

4. Reporte de coherencia con spec operativa (si existe `specs/*/spec.md`):
   - Divergencias detectadas entre spec canonica y spec operativa.
   - Recomendacion: alinear operativa o actualizar canonica.

## Plantilla Minima de Spec (resultado esperado)

El resultado debe incluir al menos:

```markdown
# Especificacion: <titulo>

**Iniciativa**: <NNN>-<alias>
**Proyecto**: <project>
**Version**: 1.0
**Estado**: Draft
**Fuente**: <fuente primaria utilizada>

## Objetivo

<objetivo principal de la iniciativa>

## Alcance Funcional

- RF-001: <requisito funcional>

## Alcance No Funcional

- RNF-001: <requisito no funcional>

## Restricciones

- <restriccion derivada de constitucion o UCC>

## Supuestos

- <supuesto clave>

## Criterios de Exito

- <criterio medible>

## Trazabilidad

- Principios constitucionales: <lista>
- UCC de origen: <NNN-alias-ucc.md>
```

## Flujo de Integracion Diana

```
/diana.new       → Bootstrap de estructura del proyecto
/diana.change    → Crear UCC + ticket relacionado
/diana.constitution → Generar constitucion desde UCC
/diana.specify   ← (estas aqui) → Generar spec canonica desde constitucion + UCC
/diana.skills    → Generar skills desde constitucion + spec
/diana.knowledge → Enriquecer knowledge base
/diana.plan      → Generar plan tecnico desde spec + skills + knowledge
/speckit.plan    → Plan operativo de implementacion
```

## Errores Comunes y Soluciones

| Error | Causa | Solucion |
|-------|-------|----------|
| "Constitucion no encontrada" | No existe `<alias>-constitution.md` | Ejecutar `/diana.constitution` primero |
| "UCC no encontrado" | No existe ningun UCC en `change-requests/` | Ejecutar `/diana.change` primero |
| "Iniciativa ambigua" | Multiples iniciativas y no se especifico `initiative` | Pasar `initiative="NNN-alias"` explicitamente |
| "Spec ya existe" | Existe `NNN-<alias>-spec.md` y `action=generate` | Usar `action="regenerate"` para sobrescribir |
