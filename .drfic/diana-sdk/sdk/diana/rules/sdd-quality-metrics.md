# DIANA‑SDK by DRFIC
## Métricas Oficiales de Calidad SDD

---

## 1. Propósito

Este documento define las **métricas oficiales de calidad de Spec‑Driven Development (SDD)**
en proyectos que adoptan DIANA‑SDK by DRFIC.

Su objetivo es:
- Medir la calidad del canon (no solo del código)
- Detectar riesgos tempranos de inferencia o ambigüedad
- Evaluar la efectividad del uso de IA
- Garantizar trazabilidad, claridad y estabilidad del sistema
- Proveer criterios objetivos para aprobación y evolución

Estas métricas son **obligatorias** para evaluación de iniciativas SDD.

---

## 2. Principio Rector de Calidad

> **Un sistema SDD es de calidad cuando el código es consecuencia natural del canon.**  
> **Si la IA necesita adivinar, la calidad es baja.**

La calidad se mide **antes del código**, durante la especificación y planificación.

---

## 3. Dimensiones de Calidad SDD

DIANA‑SDK mide la calidad en **cinco dimensiones**:

1. Calidad del Canon
2. Claridad y No‑Ambigüedad
3. Trazabilidad
4. Ejecución con IA
5. Estabilidad Evolutiva

---

## 4. Métricas de Calidad del Canon

### 4.1 Completitud de la Especificación

Mide si la spec define explícitamente el comportamiento esperado.

Indicadores:
- Requisitos funcionales definidos
- Requisitos no funcionales explícitos
- Fuera de alcance declarado
- Criterios de aceptación presentes

Evaluación:
- ✅ Alta: ningún requisito crítico implícito
- ⚠️ Media: supuestos menores implícitos
- ❌ Baja: comportamiento clave no definido

Agente responsable:
- PICCOLO

---

### 4.2 Estabilidad del Canon

Mide qué tan seguido cambia la spec sin causa funcional real.

Indicadores:
- Cambios de spec por refactors
- Cambios por bugs
- Reversiones frecuentes

Evaluación:
- ✅ Alta: la spec cambia solo por cambios funcionales
- ❌ Baja: la spec se toca por implementación

Agente responsable:
- VEGETA

---

## 5. Métricas de Claridad y No‑Ambigüedad

### 5.1 Índice de Ambigüedad

Mide cuántas decisiones quedan abiertas a interpretación.

Indicadores:
- Uso de términos vagos (“rápido”, “intuitivo”, “flexible”)
- Reglas no medibles
- Requisitos no verificables

Evaluación:
- ✅ Baja ambigüedad: criterios medibles
- ⚠️ Media: lenguaje parcialmente subjetivo
- ❌ Alta: múltiples interpretaciones posibles

Agente responsable:
- PICCOLO / VEGETA

---

### 5.2 Inferencias Detectadas

Mide cuántas veces la IA requiere inferir información faltante.

Indicadores:
- Preguntas recurrentes de agentes
- Detenciones de Speckit por falta de contexto
- Suposiciones no documentadas

Evaluación:
- ✅ Óptimo: cero inferencias
- ⚠️ Aceptable: inferencias menores
- ❌ Riesgoso: inferencias estructurales

Agente responsable:
- VEGETA

---

## 6. Métricas de Trazabilidad

### 6.1 Trazabilidad Origen → Canon

Mide si cada iniciativa tiene origen claro.

Indicadores:
- meta.md completo
- Referencias explícitas a tickets / CR
- Tipo de iniciativa declarado

Evaluación:
- ✅ Completa
- ⚠️ Parcial
- ❌ Ausente

Agente responsable:
- GOKU (copiloto)
- VEGETA (revisión)

---

### 6.2 Trazabilidad Canon → Implementación

Mide si el plan y las tareas reflejan fielmente la spec.

Indicadores:
- Relación clara spec → plan
- Tareas mapeadas a fases
- Ausencia de tareas fuera del canon

Evaluación:
- ✅ Directa
- ⚠️ Parcial
- ❌ Rota

Agente responsable:
- BULMA / KRILIN

---

## 7. Métricas de Ejecución con IA

### 7.1 Determinismo de Ejecución

Mide si distintos agentes o ejecuciones producen resultados consistentes.

Indicadores:
- Regeneración de artefactos coherente
- Mínima variabilidad no justificada

Evaluación:
- ✅ Alta
- ⚠️ Media
- ❌ Baja

Agente responsable:
- VEGETA

---

### 7.2 Dependencia de Intervención Humana

Mide cuánta intervención manual requiere la IA por falta de definición.

Indicadores:
- Correcciones frecuentes
- Re‑explicaciones
- Re‑generaciones completas

Evaluación:
- ✅ Baja dependencia (SDD maduro)
- ⚠️ Media
- ❌ Alta (SDD inmaduro)

Agente responsable:
- GOKU

---

## 8. Métricas de Estabilidad Evolutiva

### 8.1 Impacto de Cambios Funcionales

Mide qué tanto un cambio funcional rompe el sistema existente.

Indicadores:
- Cambios localizados
- Cambios transversales
- Reescrituras

Evaluación:
- ✅ Bajo impacto
- ⚠️ Impacto medio
- ❌ Alto impacto

Agente responsable:
- TRUNKS (si aplica)

---

### 8.2 Reutilización del Canon

Mide cuánto del canon se reutiliza entre iniciativas.

Indicadores:
- Specs referenciadas
- Patrones repetidos
- Contratos estables

Evaluación:
- ✅ Alta reutilización
- ⚠️ Media
- ❌ Baja

Agente responsable:
- BULMA / PICCOLO

---

## 9. Umbrales de Calidad Recomendados

Para considerar una iniciativa **lista para ejecución**:

- Canon: ✅ Alto
- Ambigüedad: ✅ Baja
- Inferencias: ✅ Cero o mínimas
- Trazabilidad: ✅ Completa
- Determinismo IA: ✅ Alto

Si uno de estos falla, **la iniciativa no debe ejecutarse**.

---

## 10. Uso de Métricas en el Ciclo de Vida

Las métricas deben evaluarse:
- Antes de `/speckit.plan`
- Antes de `/speckit.tasks`
- Antes de implementación
- Después de cambios funcionales

No son métricas post‑mortem, son **preventivas**.

---

## 11. Regla Final de Calidad SDD

Si el sistema no puede explicarse sin código, la calidad es baja.  
Si la IA puede ejecutarlo sin adivinar, la calidad es alta.  
El canon es el principal indicador de salud del sistema.

---

## 12. Estado

Este documento define las **Métricas Oficiales de Calidad SDD**
en DIANA‑SDK by DRFIC y es vinculante para todos los proyectos.

---
``