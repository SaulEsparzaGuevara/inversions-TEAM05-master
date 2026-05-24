# Spec: 007-team-05-frontend-cobertura

## Resumen

Feature para TEAM-05 (TurboPapus): construir el frontend PWA que consume los endpoints REST de análisis institucional, estrategias de cobertura y Chat IA desarrollados en el backend (006-team-05-institucional-cobertura). Incluye nuevas páginas, sistema de routing con React Router, servicios API, nuevos endpoints REST para exponer los motores de cobertura, y tests unitarios/de integración frontend.

Esta spec deriva de la fuente canónica: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md`

## Clarifications

### Session 2026-05-20
- Q: Implement graphic payoff charts instead of tables? → A: Graphic charts using `lightweight-charts`
- Q: AI Chat failure degradation behavior? → A: Display an error message with a "Retry" button to manually attempt reconnection
- Q: Input constraints for Institutional Analysis period and horizon? → A: Predefined dropdown selectors with fixed values matching backend contracts
- Q: Handling unavailable option chains in Coverage simulator? → A: Display an explicit warning/empty state explaining options are unavailable and disable visualization
- Q: AI Chat history persistence during navigation? → A: Preserve in memory tab session using `src/store/chat.ts` with `useSyncExternalStore` (like `signals.ts`)

## Identificadores de backlog (rango propuesto)

- T300..T315 (ver `tasks.md` para contexto y dependencias)

## Objetivo

Entregar una interfaz web funcional que consuma los 4 endpoints REST de TEAM-05 más 3 nuevos endpoints REST de cobertura, con navegación entre páginas, visualización de datos institucionales, comparación de estrategias de cobertura, chat IA con polling, y trazabilidad completa desde el frontend.

## Alcance Funcional

- Exponer motores de cobertura como endpoints REST nuevos (RF-301).
- Implementar página de Análisis Institucional con zonas S/R, tendencias y métricas (RF-302).
- Implementar página de Posiciones Regulatorias con tabla 13F y flujos (RF-303).
- Implementar página de Estrategias de Cobertura con comparador, payoff charts con `lightweight-charts` y simulación (RF-304).
- Implementar página de Chat IA con interfaz de preguntas, polling y narrativa (RF-305).
- Agregar sistema de navegación con React Router entre páginas (RF-306).
- Implementar servicios API frontend para cada grupo de endpoints (RF-307).
- Soportar degradación funcional: si IA falla, mostrar `ai_unavailable` sin bloquear (RF-308).

## Alcance No Funcional

- La IA no ejecuta operaciones y no sustituye el juicio humano (RNF-301).
- Routing del frontend sin recarga de página (RNF-302).
- Estilos consistentes con el design system existente (CSS variables, dark theme) (RNF-303).
- Las páginas deben ser responsive para escritorio (RNF-304).
- Cobertura de tests mínima 80% en servicios API y componentes críticos (RNF-305).
- Tiempo de carga inicial < 2s en entorno dev (RNF-306).
- Polling del Chat IA cada 2s con timeout de 30s y máximo 15 intentos (RNF-307).

## Indicadores Cost/Risk — Semántica

Los indicadores de costo y riesgo en las tarjetas de estrategia de cobertura (panel derecho de `CoverageStrategiesPage`) representan conceptos financieros específicos. Es crucial entender qué significa cada campo para interpretar correctamente los resultados.

### Confianza: ALTA / MEDIA / BAJA

Son **niveles de confianza de la estrategia**, no montos de costo. Se derivan de un score compuesto 0-1:

| Nivel | Score mínimo | Significado |
|-------|-------------|-------------|
| ALTA | ≥ 0.70 | Fuerte confluencia entre indicadores; baja probabilidad de falsos positivos |
| MEDIA | ≥ 0.40 | Señales mixtas o acuerdo moderado entre indicadores |
| BAJA | < 0.40 | Alta incertidumbre o señales débiles/contradictorias |

El score se compone de tres factores ponderados en `coverageStrategyAdapter.ts`:
- **40%** `protectionScore` — qué tanto downside cubre la estrategia
- **30%** `costEfficiencyScore` — qué tan eficiente es el costo (`costBenefitRatio`)
- **30%** `riskScore` — perfil de riesgo (limited = 0.8, unlimited = 0.3)

### Montos en dólares

Cada campo monetario en `RiskMetrics` tiene una semántica específica:

| Label en UI | Campo backend | Semántica | Zero-Cost Collar |
|-------------|--------------|-----------|------------------|
| **Prima neta** | `netPremium` | **Flujo neto de caja** para abrir la posición. Long = pagas (positivo), Short = recibes crédito (negativo). NO es comisión ni margen. | **$0.00** |
| **Downside** | `downsideRisk` | **Pérdida máxima posible** en el peor escenario de mercado. | Precio - put strike |
| **Protección** | `protectionFloorPrice` | **Precio piso** — precio donde termina la protección del put. | Put strike |
| **Tope** | `protectionCeilingPrice` | **Precio techo** — solo en Collar, donde el upside queda limitado por el call corto. | Call strike |
| **Margen** | `marginRequirement` | **Colateral requerido** por el broker para mantener la posición abierta. | Depende del broker |
| **Break-even** | `breakevenPrice` | **Precio donde PnL = $0** — la estrategia no gana ni pierde. | Precio actual - prima neta |
| **Max Profit** | `maxProfit` | **Ganancia máxima** posible (null/∞ si es ilimitada). | (call strike - precio actual) + prima neta recibida |
| **Max Loss** | `maxLoss` | **Pérdida máxima** posible (null/∞ si es ilimitada). | (precio actual - put strike) + prima neta pagada |

> **Regla de oro**: `netPremium` = sumatoria de (prima × signo) para todas las legs, donde long = +1, short = -1, escalado por multiplicador del contrato y shares. Si el resultado es ~$0.00, la estrategia es "zero-cost".

### Zero-Cost Collar

No existe un tipo de estrategia "ZeroCostCollar" separado. Es un **Collar normal** (`collar_put`) donde la prima de la put que compras (long, pagas) y la prima del call que vendes (short, recibes crédito) se cancelan mutuamente, resultando en `netPremiumPerShare ≈ 0.0`. Esto ocurre naturalmente en el cálculo de `collarEngine.ts` cuando el usuario ingresa strikes y primas que se equilibran.

### Diferencia clave

```
ALTA $20.00  ≠  "El nivel ALTA cuesta $20"
ALTA         =  Confianza alta en la estrategia (score ≥ 0.70)
$20.00       =  Prima neta (costo total de abrir la posición)
```

Son dos conceptos independientes que aparecen en distintas secciones de la UI:
- El badge **ALTA/MEDIA/BAJA** está en el encabezado de la tarjeta (confianza)
- Los montos en dólares están en el panel derecho de métricas

## Data Source Matrix

Estado actual de las fuentes de datos que alimentan las páginas de Institutional Analysis y Regulatory Positions:

| Fuente | Tier | Estado | URL base | Implementada en |
|--------|------|--------|----------|-----------------|
| SEC EDGAR 13F | free | ✅ REAL | `https://efts.sec.gov` | T334 |
| FINRA Short Interest | free | ✅ REAL | `https://api.finra.org` | T333 |
| Yahoo Finance Options Flow | free | ✅ REAL | `https://query2.finance.yahoo.com/v7/finance/options` | T338 |
| Yahoo Finance Institutional | free | ✅ REAL | `https://query2.finance.yahoo.com/v10/finance/quoteSummary` | T339 |

> **Nota**: Unusual Whales y Finviz Institutional fueron reemplazados por fuentes gratuitas de Yahoo Finance (T338-T340) e implementados completamente. Las fuentes Coverage Strategies y AI Chat no dependen de fuentes externas.

## Restricciones

- No modificar artefactos canónicos globales: `001-inv-spec.md`, `001-inv-plan.md` ni `001-inv-tasks.md`.
- No modificar backend existente de TEAM-05; solo agregar nuevos endpoints REST para cobertura.
- Usar `fetch` nativo (sin axios) consistente con el patrón existente en `services/signals/signalApi.ts`.
- Usar CSS variables existentes (no Tailwind, no Material UI).
- React Router v6 para navegación SPA.

## Entregables

### Backend (nuevos endpoints REST)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/coverage/analyze` | Ejecuta los 4 motores (Protective Put, Married Put, Collar Put, Covered Straddle) y retorna resultados estructurados |
| POST | `/api/coverage/compare` | Ejecuta el comparador y retorna ranking con estrategia recomendada |
| POST | `/api/coverage/simulate` | Ejecuta simulación Monte Carlo sobre una estrategia dada |

### Frontend (páginas nuevas)

1. **Página de Análisis Institucional** (`/institutional/analysis`)
   - Input de ticker
   - Dropdown selectors cerrados para período y horizonte (alineados al contrato backend API)
   - Visualización de zonas S/R (tabla con precio, fuerza, confianza, volumen)
   - Resumen de tendencia (dirección, score, confidence)
   - Métricas de posicionamiento
   - Reportes de fuentes (SEC 13F, FINRA, Yahoo Finance Options Flow, Yahoo Finance Institutional)

2. **Página de Posiciones Regulatorias** (`/institutional/positions`)
   - Tabla de posiciones 13F por fondo
   - Gráfico de flujos (inflows, outflows, netFlow)
   - Indicador de ownership como porcentaje
   - Cache hit indicator

3. **Página de Estrategias de Cobertura** (`/coverage/strategies`)
   - Formulario: ticker, precio, strikes, capital, tolerancia
   - Tabla comparativa de las 4 estrategias (Protective Put, Married Put, Collar Put, Covered Straddle)
   - Payoff simulation chart para cada estrategia
   - Risk metrics por estrategia
   - Ranking con estrategia recomendada

4. **Página de Chat IA** (`/ai/chat`)
   - Selector de contexto (ticker + precio)
   - Input de pregunta
   - Historial de preguntas/respuestas
   - Indicador de polling (spinner + tiempo transcurrido)
   - Narrativa renderizada
   - ScenarioAnalysis cards
   - Degradación: mostrar estado de error `ai_unavailable` con explicación y botón de Reintento manual.
   - Evidencia IDs y traceability footer

### Frontend (servicios API)

- `src/services/institutional/institutionalApi.ts` — funciones para `/api/institutional/analysis` y `/api/institutional/positions`
- `src/services/coverage/coverageApi.ts` — funciones para `/api/coverage/analyze`, `/api/coverage/compare`, `/api/coverage/simulate`
- `src/services/ai/aiChatApi.ts` — funciones para `POST /api/ai/institutional-chat` y `GET /api/ai/institutional-chat/poll/:responseId`

### Frontend (routing y layout)

- Instalar `react-router-dom` en `projects/pwa/inversions_app/`
- Actualizar `main.tsx` para usar `BrowserRouter`
- Layout compartido con sidebar de navegación
- Navbar existente se mantiene pero con links de navegación

### Frontend (tests)

- Tests unitarios para cada página (render, estados loading/error/data)
- Tests para servicios API (con fetch mockeado en tests unitarios)
- Tests para polling del Chat IA

## Criterios de Aceptación

- Los 3 endpoints REST de cobertura responden con datos válidos y contratos consistentes.
- Las 4 páginas se renderizan sin errores y consumen datos reales del backend.
- La navegación entre páginas es SPA sin recarga de página.
- El Chat IA muestra polling visual y degradación `ai_unavailable` cuando falla Gemini.
- Todos los servicios API usan `getAuthHeaders()` consistente con el patrón existente.
- Tests frontend pasan con Vitest + testing-library.
- `npm run lint` (tsc --noEmit) pasa sin errores en el frontend.

## Dependencias

- Backend TEAM-05 operativo en `localhost:3000` con endpoints `/api/institutional/*` y `/api/ai/institutional-chat/*`.
- Motores de cobertura en `src/modules/strategies/coverage/*` compilados y funcionales.
- Proxy de Vite configurado para `/api` → `http://localhost:3000` (ya existe).
- `react-router-dom` como nueva dependencia npm en el frontend.
- Token JWT en localStorage (`inversions.dev.token`) o `VITE_DEV_BEARER_TOKEN` para auth.

## Riesgos y Mitigaciones

- Riesgo: Los motores de cobertura no tienen endpoints REST → Mitigación: crear routes POST delgadas que invocan los engines existentes sin duplicar lógica.
- Riesgo: Cadenas de opciones no disponibles para un ticker → Mitigación: Mostrar advertencia/estado vacío explícito y deshabilitar renderizado de simulación. Si la data es parcial (algunos strikes disponibles y otros no), el backend ya tiene `partialDataHandler.ts` (T208) que lo resuelve; el frontend muestra lo que llegó con nota aclaratoria.
- Riesgo: El polling del Chat IA expira en 30s → Mitigación: mostrar timeout claro al usuario con opción de reintentar.
- Riesgo: Diseños inconsistentes con el dashboard existente → Mitigación: reusar `className="card"`, `className="btn-primary"`, CSS variables del `index.css`.
- Riesgo: react-router-dom rompe tests existentes → Mitigación: envolver tests en `MemoryRouter` y mantener `MainDashboard` exportado para tests.

## Trazabilidad

- Fuente canónica de entrada: `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-05/spec.md`
- Backend consumido: `projects/rest-api/inversions_api/src/routes/institutional/`, `projects/rest-api/inversions_api/src/routes/ai/`, `projects/rest-api/inversions_api/src/modules/strategies/coverage/`
- Frontend existente: `projects/pwa/inversions_app/src/features/dashboard/`, `projects/pwa/inversions_app/src/services/signals/signalApi.ts`

## Notas de Implementación

- Nuevos endpoints REST de cobertura deben ser archivos delgados en `routes/coverage/` que llaman a los engines existentes.
- Los servicios API frontend deben seguir el patrón exacto de `signalApi.ts`: funciones `async`, `getAuthHeaders()`, tipado fuerte con interfaces exportadas.
- El layout compartido debe ser un wrapper que renderiza el sidebar + navbar + `Outlet` de React Router.
- El Chat IA debe persistir el `responseId` y mostrar el estado del polling con barra de progreso visual.
- El historial del Chat IA debe persistirse en memoria mientras la pestaña esté abierta usando un nuevo store `src/store/chat.ts` que implemente el patrón `useSyncExternalStore` (similar a `src/store/signals.ts`), evitando `localStorage` por redundancia con el backend y límites de tamaño.
- Los payoff charts deben implementarse como gráficos interactivos utilizando `lightweight-charts` (librería ya disponible en el proyecto), en lugar de simples tablas numéricas.

## Próximos pasos

1. ~~Revisar spec con stakeholders de TEAM-05 y dar aprobación.~~ **Hecho**
2. ~~Ejecutar `/speckit.clarify` para resolver preguntas abiertas.~~ **Hecho**
3. Ejecutar `/speckit.checklist` para validar calidad de spec.
4. Ejecutar `/speckit.plan` para diseño de ejecución.
5. Ejecutar `/speckit.tasks` para derivar backlog ejecutable.
