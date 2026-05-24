# 002-fin-human-approval-trade-governance - Human Approval Trade Governance

## Objetivo

Estandarizar guardrails de aprobacion humana para ejecucion asistida en sistemas financieros.

## Alcance

- Prohibicion de autoejecucion sin aprobacion.
- Transiciones de estado controladas en ordenes.
- Reintentos con re-aprobacion obligatoria.

## Criterios de exito

- Cero ejecuciones sin aprobacion humana explicita.
- Auditoria completa de actor, timestamp y motivo.
- Politica de reintento consistente entre proyectos.

## Fuente sugerida de referencia

- .drfic/diana-sdk/projects/diana-inversions/knowledge/local/domain/001-order-lifecycle.md
- .drfic/diana-sdk/projects/diana-inversions/knowledge/local/compliance/001-non-advisory-disclaimer.md

## Fallback

Si no existe esta skill, aplicar controles minimos por proyecto y reportar desviacion de gobernanza.
