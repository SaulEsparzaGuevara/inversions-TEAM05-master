# TEAM-05 — Sesión de Clarificación (speckit.clarify)

**Spec**: `specs/006-team-05-institucional-cobertura/spec.md`
**Fecha**: 2026-05-19

---

## Pregunta 1 — Trazabilidad del Chat IA

**Pregunta**: ¿Qué nivel de trazabilidad deben tener las respuestas del Chat IA?

**Opción recomendada**: A

| Opción | Descripción |
|--------|-------------|
| **A** ✅ | Registrar trazabilidad completa por respuesta IA: `context_id`, estrategia, evidencia usada, timestamp, versión de modelo y hash de salida |
| B | Registrar solo prompt/respuesta y timestamp |
| C | Registrar únicamente un resumen final de la recomendación |

**Justificación**: Alineado con RF-006 (trazabilidad entre contexto, estrategia y evidencia), RNF-002 (reproducibilidad y auditabilidad) y RNF-004 (salida defendible).

**Respuesta**: A

---

## Pregunta 2 — Latencia del fl completo (cálculo + IA)

**Pregunta**: ¿Cuál debe ser el objetivo de latencia para el flujo completo de análisis institucional + explicación IA?

**Opción recomendada**: B

| Opción | Descripción |
|--------|-------------|
| A | p95 <= 2s para respuesta completa |
| **B** ✅ | p95 <= 5s para respuesta completa; si excede, devolver estado asíncrono con polling |
| C | Sin objetivo de latencia; solo best effort |

**Justificación**: 2s es demasiado agresivo considerando dependencias externas (SEC EDGAR, FINRA, Unusual Whales) + Monte Carlo + LLM. 5s con async permite diseño realista de timeouts y colas.

**Respuesta**: B

---

## Pregunta 3 — Control de acceso al módulo

**Pregunta**: ¿Qué roles deben tener acceso al análisis institucional y estrategias de cobertura?

**Opción recomendada**: A

| Opción | Descripción |
|--------|-------------|
| **A** ✅ | Solo roles `analyst` y `risk_manager` pueden consultar/explicar; ningún rol puede ejecutar órdenes desde este módulo |
| B | Cualquier usuario autenticado puede consultar/explicar |
| C | Acceso público de lectura para explicaciones |

**Justificación**: Refuerza RNF-001 (IA no ejecuta operaciones ni sustituye juicio humano) y RNF-005 (no invadir otros dominios). Evita exponer capacidades de ejecución por error.

**Respuesta**: A

---

## Pregunta 4 — Degradación ante falla del Chat IA

**Pregunta**: ¿Cómo debe comportarse el sistema si el Chat IA falla?

**Opción recomendada**: B

| Opción | Descripción |
|--------|-------------|
| A | Si falla IA, devolver error y no entregar respuesta de cobertura |
| **B** ✅ | Si falla IA, devolver cálculo/estrategia estructurada sin narrativa IA + flag `ai_unavailable` |
| C | Reintentar indefinidamente hasta obtener narrativa IA |

**Justificación**: El core de análisis y estrategias no debe depender del Chat IA (RNF-003). B es resiliente: entregas el cálculo funcional con un flag de degradación.

**Respuesta**: B

---

## Pregunta 5 — Retención de trazas y evidencias

**Pregunta**: ¿Por cuánto tiempo deben retenerse las trazas y evidencias?

**Opción recomendada**: B

| Opción | Descripción |
|--------|-------------|
| A | Retener trazas y evidencias por 90 días |
| **B** ✅ | Retener trazas y evidencias por 365 días |
| C | Retener trazas y evidencias por 730 días |

**Justificación**: 90 días es muy corto para auditoría financiera. 730 días es sobredimensionado para MVP. 365 días es el balance justo: cubre ciclos fiscales completos.

**Respuesta**: B

---

## Resumen

| # | Aspecto | Decisión |
|---|---------|----------|
| 1 | Trazabilidad IA | Completa (`context_id`, estrategia, evidencia, timestamp, versión modelo, hash) |
| 2 | Latencia | p95 <= 5s con fallback asíncrono |
| 3 | Control de acceso | Solo `analyst` y `risk_manager`; nadie ejecuta órdenes |
| 4 | Degradación IA | Devolver cálculo + flag `ai_unavailable` |
| 5 | Retención de datos | 365 días |
