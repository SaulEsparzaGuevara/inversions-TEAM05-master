# 009-inv-execution-governance-human-control — Execution Governance Human Control

## Objetivo

Garantizar que la IA no ejecute operaciones y que toda ejecución requiera aprobación humana explícita.

## Fuentes canonicas

- 001-inv-spec.md#0
- 001-inv-spec.md#2.1
- spec.md#FR-004
- spec.md#FR-005

## Knowledge docs

- local/domain/001-order-lifecycle.md
- local/compliance/001-non-advisory-disclaimer.md

## Criterios de exito

- Cero autoejecución en v1.
- Evidencia de aprobación humana por operación.
- Trazabilidad completa de decisiones.

## Fallback

Si falta esta skill, mantener guardrails mínimos del engine y reportar gap 009-inv-execution-governance-human-control.
