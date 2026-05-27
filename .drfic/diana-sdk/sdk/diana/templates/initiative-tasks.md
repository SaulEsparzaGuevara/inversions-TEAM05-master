# Diana Initiative Tasks Template
## <nombre-de-la-iniciativa>

Identificador: <NNN-INV-TASKS>
Proyecto:
Iniciativa:
Version de generacion:
Accion: /diana.tasks action="generate"

---

## Autoridad

Este backlog canónico está subordinado a:
1. inv-constitution.md
2. 001-inv-spec.md
3. 001-inv-plan.md

Ante conflicto, prevalece la constitución.

---

## Entradas Oficiales Consumidas

- Constitución del proyecto
- Especificación canónica de la iniciativa
- Plan técnico canónico de la iniciativa
- Skills y knowledge requeridos para la etapa activa
- Artefactos operativos derivados de Speckit (si existen)

---

## Política de Derivación hacia Speckit

- Este archivo es el backlog canónico Diana.
- `specs/.../tasks.md` puede existir como backlog operativo derivado.
- Los IDs de tarea deben permanecer estables cuando ambos artefactos coexistan.
- Si hay divergencias, deben registrarse explícitamente.

---

## Formato de Tareas

`[ID] [P?] [Historia o Stream] Descripción`

- `[P]`: tarea paralelizable
- Incluir referencias a archivos cuando aplique
- Incluir trazabilidad a FR/SC/PL/Constitución cuando aplique

---

## Fases

### Fase 1
- Objetivo:
- Entregables:
- Tareas:

### Fase 2
- Objetivo:
- Entregables:
- Tareas:

### Fase 3
- Objetivo:
- Entregables:
- Tareas:

### Fase N (Configurabilidad y Modos Operativos, cuando aplique)
- Objetivo:
- Entregables:
- Tareas:
	- Registro de configuración dinámica (campos/columnas/opciones)
	- Routing por dominio de datos y fallback
	- Conmutadores de modo (online/offline, demo/real)
	- Renderer metadata-driven en UI
	- Pruebas de cambio de configuración sin redeploy

Ejemplo de tareas mínimas:
- Crear migración de catálogo de columnas dinámicas
- Crear migración de presets por rol/usuario
- Exponer endpoint de runtime mode
- Integrar renderer de tabla por metadata
- Probar add/remove/reorder sin cambios de código

---

## Dependencias

- Dependencias entre fases
- Dependencias críticas entre tareas
- Restricciones de paralelismo

---

## Congruencia con Speckit

- backlog_operativo:
- estado_congruencia:
- diferencias_relevantes:
- accion_recomendada:

---

## Estado

Este documento constituye el **Backlog Canónico de la Iniciativa**.