# TEAM-05 "TurboPapus" — Resumen para el equipo
## Rol del equipo
Análisis institucional y estrategias de cobertura (Protective Put, Married Put, Collar Put, Covered Straddle) con apoyo de un Chat IA explicativo.
**Todo el alcance está definido en:**
- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md`
- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md`
- `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/tasks.md`
---
## Estado actual
| Tarea | Descripción | Estado |
|-------|-------------|--------|
| T030 | Adaptador Alpaca (`backend/src/modules/brokers/alpacaAdapter.ts`) | ✅ Completado |
| T054 | Reporte cobertura MFA (`backend/src/observability/mfaCoverageReport.ts`) | ✅ Completado |
| T106 | Contrato de parámetros para análisis institucional | ❌ Pendiente |
| T107 | Servicio integración fuentes externas institucionales (SEC EDGAR 13F, FINRA, Unusual Whales, Finviz) | ❌ Pendiente |
| T108 | Motor de zonas institucionales (soportes/resistencias de fondos) | ❌ Pendiente |
| T109 | Motor de tendencias institucionales (MA 50/200, cruces) | ❌ Pendiente |
| T110 | Motor de análisis de vencimientos (opciones y futuros) | ❌ Pendiente |
| T111 | API de análisis institucional (zonas S/R, tendencias, métricas) | ❌ Pendiente |
| T112 | API de posiciones y reportes regulatorios (13F, flujos) | ❌ Pendiente |
| T113 | Contrato base de estrategias de cobertura | ❌ Pendiente |
| T114 | Core Protective Put / Married Put | ❌ Pendiente |
| T115 | Core Collar Put | ❌ Pendiente |
| T116 | Core Covered Straddle | ❌ Pendiente |
| T117 | Motor de simulación avanzada (Monte Carlo, backtesting, payoff) | ❌ Pendiente |
| T118 | Servicio de alertas y gestión de riesgos (stop-loss, márgenes) | ❌ Pendiente |
| T119 | Módulo de reporting de cobertura | ❌ Pendiente |
| T120 | Comparador de estrategias de cobertura | ❌ Pendiente |
| T121 | Chat IA de análisis institucional y estrategias (solo lectura) | ❌ Pendiente |
| T173 | Ajuste al estándar transversal | ❌ Pendiente |
| T184 | Tests unitarios — institutionalZonesEngine, institutionalTrendEngine, expirationAnalysisEngine | ❌ Pendiente |
| T185 | Tests unitarios — protectivePutEngine, collarEngine, coveredStraddleEngine, coverageComparator | ❌ Pendiente |
| T186 | Tests de integración — routes institucionales | ❌ Pendiente |
---
## Lo que NO dicen las tareas (pero hay que saberlo)
**Las tareas asignadas son 100% backend** — todas apuntan a `backend/src/modules/...` y `backend/src/routes/...`.
Sin embargo, el **frontend actual no tiene nada** de lo que vamos a construir:
| Feature | Backend (en tareas) | Frontend |
|---------|-------------------|----------|
| Zonas S/R institucionales, tendencias, posiciones 13F | T111, T112 ✅ | ❌ No existe UI |
| Visualización de estrategias de cobertura (payoff, risk/reward) | T114-T120 ✅ | ❌ No existe UI |
| Chat IA explicativo | T121 ✅ | ❌ No existe UI |
El `spec.md` del equipo lo requiere explícitamente:
- **RF-004**: Integrar un Chat IA para explicar escenarios de cobertura y protección
- **RF-005**: Publicar salidas estructuradas para consumo por otros equipos y Speckit
**Conclusión:** Vamos a necesitar componentes frontend nuevos en `projects/pwa/inversions_app/src/features/` (institucional, coberturas, chat). Las tareas no lo reflejan aún.
---
## APIs que vamos a exponer (para referencia del equipo)
Basado en las tareas, estos son los endpoints que implementaremos:
| Endpoint | Tarea | Propósito |
|----------|-------|-----------|
| `GET /api/institutional/analysis` | T111 | Zonas S/R institucionales, tendencias MAs, métricas de posicionamiento |
| `GET /api/institutional/positions` | T112 | Posiciones abiertas de fondos, flujos, datos 13F |
| `POST /api/coverage/simulate` | T117 | Simulación Monte Carlo y escenarios determinísticos |
| `POST /api/coverage/compare` | T120 | Comparador de estrategias |
| `POST /api/ai/institutional-chat` | T121 | Chat IA explicativo (solo lectura) |
---
## Flujo de implementación sugerido
```
Fase 1 — Base institucional
  T106 (contrato) → T107 (fuentes externas) → T108 (zonas) → T109 (tendencias) → T110 (vencimientos)
Fase 2 — APIs institucionales
  T111 (API analysis) → T112 (API positions)
Fase 3 — Estrategias de cobertura
  T113 (contrato base) → T114 (Protective/Married Put) → T115 (Collar) → T116 (Covered Straddle)
Fase 4 — Simulación, alertas, reporting
  T117 (simulación) → T118 (alertas/riesgos) → T119 (reporting) → T120 (comparador)
Fase 5 — Chat IA
  T121
Fase 6 — Calidad
  T173 (ajuste estándar) → T184 (unit tests institucional) → T185 (unit tests coberturas) → T186 (integration tests)
```
---
## Referencias útiles
- **Spec del equipo**: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md`
- **Plan del equipo**: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/plan.md`
- **Tasks del equipo**: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/tasks.md`
- **Backend**: `projects/rest-api/inversions_api/src/`
- **Frontend**: `projects/pwa/inversions_app/src/`
- **App corriendo en**: Frontend `http://localhost:5173` | Backend `http://localhost:3000`