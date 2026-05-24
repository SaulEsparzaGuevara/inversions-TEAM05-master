# Quickstart: Plataforma de Inversiones con IA

## Proposito

Secuencia minima para iniciar implementacion tecnica sobre la base del plan de esta feature.

## 1. Preparar estructura base

Estructura esperada:

```text
frontend/
backend/
tests/
specs/001-plataforma-inversiones-ia/
```

## 2. Levantar cimientos de backend primero

1. Implementar middleware JWT + resolucion de usuario activo (`FR-012`).
2. Implementar RBAC por roles (`viewer`,`trader`,`admin`) (`FR-017`).
3. Implementar challenge MFA para aprobacion/ejecucion (`FR-019`).
4. Definir entidades operativas en Supabase y politicas de retencion (`FR-007`).
5. Definir auditoria estructurada para auth, aprobacion y ejecucion (`FR-006`,`FR-011`).

## 3. Implementar contratos de dominio y flujo operativo

1. Ciclo `PENDING_APPROVAL -> APPROVED -> SUBMITTED -> ...` con optimistic locking (`FR-016`).
2. Regla fail-fast: `FAILED -> PENDING_APPROVAL` con nueva aprobacion obligatoria (`FR-009`).
3. Validacion de tipos de orden `MARKET` y `LIMIT` (`FR-014`).
4. Rate limiting por usuario/endpoint con `429` y cooldown (`FR-015`).

## 4. Integrar brokers y market data

1. Implementar adaptadores internos IBKR y Alpaca (`FR-008`).
2. Normalizar estados de orden broker a estado canonico interno.
3. Implementar pipeline realtime con contrato normalizado de market data (`SC-006`).
4. Instrumentar metricas p95 de frescura y alertas de degradacion.

## 5. Completar frontend PWA

1. Vista de evaluacion de senales y evidencia (`FR-001`,`FR-002`).
2. Configuracion de fuentes analiticas (`FR-003`).
3. Flujo de aprobacion/rechazo con MFA para roles sensibles (`FR-004`,`FR-005`,`FR-019`).
4. Historial trazable de senales, decisiones e intentos (`FR-011`).
5. Mostrar disclaimer de no asesoria en puntos de decision/ejecucion (`FR-013`).

## 6. Verificaciones operativas y de resiliencia

1. Probar simulacros de recovery contra objetivos `RTO<=30m` y `RPO<=5m` (`FR-018`).
2. Verificar cobertura de auditoria al 100% en acciones de aprobacion/ejecucion (`SC-008`).
3. Validar disponibilidad mensual objetivo >=99.5% (`SC-005`).

## 7. Comandos base de calidad

```bash
npm run lint
npm test
```

## 8. Evidencia de validacion ejecutada (T048)

Fecha de ejecucion: 2026-05-02.

### 8.1 Verificacion de estructura minima

Se verifico la presencia de las raices requeridas:

- `frontend/`
- `backend/`
- `specs/001-plataforma-inversiones-ia/`

Nota:

- La raiz `tests/` existe como carpeta top-level y cumple el criterio de conformidad estructural de fase 6 (`T055`/`T056`).
- Las pruebas de implementacion siguen distribuidas por paquete (`frontend` y `backend`) y actualmente estan en modo placeholder.

### 8.2 Resultado de calidad

Comando:

```bash
npm run lint
```

Resultado:

- `lint:fic` OK (`FIC comment convention OK`)
- `frontend` TypeScript check OK (`tsc --noEmit`)
- `backend` TypeScript check OK (`tsc --noEmit`)

Comando:

```bash
npm test
```

Resultado:

- `frontend tests pending`
- `backend tests pending`

Conclusiones de validacion:

- Quality gate de lint: PASS.
- Pipeline de test: ejecuta correctamente, pero con suites placeholder pendientes de implementacion.

## 9. Runbook de simulacro RTO/RPO (T051)

Objetivo:

- Validar capacidad de recuperacion operativa ante caida parcial del backend de ejecucion asistida.

Precondiciones:

- Ambiente de prueba aislado (no productivo).
- Acceso a logs de backend y eventos de auditoria.
- Responsable de incidente asignado (Incident Commander).

Escenario de simulacro:

- Falla controlada del servicio de ejecucion (`/execution/execute`) manteniendo lectura operativa.

Pasos:

1. Declarar inicio del simulacro y registrar `start_utc`.
2. Forzar condicion de falla controlada (tabletop o corte de dependencia simulada).
3. Detectar incidente y activar protocolo de contencion.
4. Aplicar recuperacion segun runbook tecnico (reinicio controlado/failover operativo).
5. Verificar salud de endpoints criticos y consistencia de auditoria.
6. Registrar `restore_utc` y calcular RTO observado.
7. Estimar RPO observado por brecha maxima de datos recuperables.
8. Documentar hallazgos, acciones correctivas y responsables.

Criterios de aceptacion:

- `RTO <= 30m`
- `RPO <= 5m`

## 10. Evidencia de simulacro controlado (T052)

Tipo de simulacro ejecutado:

- `tabletop-dry-run` (controlado, no productivo).

Evidencia registrada (UTC):

- `executedAtUtc`: `2026-05-02T21:15:44.4259086Z`
- Fases:
	- `detect`: 4 minutos
	- `contain`: 5 minutos
	- `restore`: 8 minutos
- `measuredRtoMinutes`: 17
- `measuredRpoMinutes`: 3
- `targetRtoMinutes`: 30
- `targetRpoMinutes`: 5
- `rtoPass`: true
- `rpoPass`: true

Conclusiones del simulacro:

- Cumplimiento de umbral RTO: PASS (17 <= 30).
- Cumplimiento de umbral RPO: PASS (3 <= 5).
- Se recomienda repetir simulacro en modalidad tecnica no-tabletop en siguiente iteracion para evidencia operacional de mayor fidelidad.
