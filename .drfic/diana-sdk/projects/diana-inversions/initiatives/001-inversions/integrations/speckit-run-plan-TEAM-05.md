# Diana Integrate Run Report
## action="run" engine="speckit" run_only="plan" team="TEAM-05"

Identificador: 001-INV-RUN-SPECKIT-PLAN-TEAM-05
Proyecto: diana-inversions
Iniciativa: 001-inversions
Equipo: TEAM-05
Fecha: 2026-05-19
Idioma: es

---

## Ejecución

- Comando objetivo: `/diana.integrate action="run" engine="speckit" project="diana-inversions" initiative="001-inversions" team="TEAM-05" run_only="plan" language="es"`
- Etapa ejecutada: `speckit.plan` (única)
- Topología activa: `multi_team`
- Política de autoridad: `diana_canon_strict`

---

## Entradas Canónicas Obligatorias Verificadas

- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md` ✅
- `specs/006-team-05-institucional-cobertura/spec.md` ✅
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml` ✅
- `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml` ✅
- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/integration-profile.md` ✅

---

## Artefacto Generado

- `specs/006-team-05-institucional-cobertura/plan.md`

---

## Cobertura Canónica (`preserved|expanded|merged|dropped`)

### preserved

- Objetivo de TEAM-05: análisis institucional + estrategias de cobertura.
- Fases técnicas canónicas: contexto institucional, estrategias, chat IA/API, validación.
- Restricciones: semi-automático, no auto-trading, no alterar canon global.

### expanded

- Requisitos aclarados en clarify: trazabilidad completa IA, latencia p95<=5s con fallback asíncrono, control de acceso por rol, degradación `ai_unavailable`, retención 365 días.
- Estrategia de pruebas y validaciones no funcionales explícitas.
- Secuenciación por flujos para habilitar `tasks` posterior.

### merged

- Integración de plan canónico TEAM-05 con spec de feature 006 (RF/RNF + criterios de éxito) en un plan técnico único para Speckit.
- Alineación de skills requeridas desde `engines.speckit.plan.required_skills`.

### dropped

- Ninguno detectado.

---

## Readiness por Stage/Engine

- `speckit.plan`: READY ✅
- `speckit.tasks`: READY_WITH_MINOR_GAPS ⚠️
  - Gap 1: definir catálogo final de escenarios extremos para pruebas de estrategia.
  - Gap 2: acordar SLO operativo de polling (intervalo/timeout).
- `speckit.implement`: PENDING_TASKS

---

## Lista de Artefactos Diana a Consumir sin Reinterpretar

1. `.drfic/diana-sdk/projects/diana-inversions/inv-constitution.md`
2. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md`
3. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md`
4. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/tasks.md` (próxima etapa)
5. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/sdd-engine-matrix.yaml`
6. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/skills-manifest.yaml`
7. `.drfic/diana-sdk/projects/diana-inversions/knowledge/indexes/agent-skill-matrix.yaml`
8. `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/integrations/integration-profile.md`

---

## Estado

Ejecución `run_only="plan"` completada para TEAM-05 sin omisiones canónicas.
