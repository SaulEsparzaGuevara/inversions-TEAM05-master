# Especificacion de Funcionalidad: Dashboard de Brokers TEAM-01

**Feature Branch**: `002-team-01-dashboard-brokers`  
**Created**: 2026-05-12  
**Status**: Active  
**Input**: Especificacion canonica en `.drfic/diana-sdk/projects/diana-inversions/initiatives/001-inversions/teams/TEAM-01/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Monitorear confluencia operativa (Priority: P1)

Como operador humano, necesito ver en un solo tablero la confluencia de senales por activo y broker para decidir con rapidez si una recomendacion requiere aprobacion, ajuste o descarte.

**Why this priority**: Es el flujo de mayor valor porque habilita la toma de decision diaria y concentra la visibilidad operacional del equipo.

**Independent Test**: Se valida de forma independiente cuando un operador puede abrir el tablero, revisar estado y evidencia de una recomendacion y emitir una decision humana trazable sin depender de otras historias.

**Acceptance Scenarios**:

1. **Given** que existen recomendaciones activas con evidencia, **When** el operador abre el tablero principal, **Then** visualiza confluencia de senales y estado operativo por broker en una vista consolidada.
2. **Given** que una recomendacion incluye riesgo y explicacion, **When** el operador selecciona el detalle, **Then** puede revisar la evidencia completa antes de decidir.

---

### User Story 2 - Aprobar o rechazar con control humano (Priority: P2)

Como aprobador, necesito aprobar o rechazar recomendaciones de forma explicita para mantener el modelo semi-automatico y evitar ejecuciones no autorizadas.

**Why this priority**: Garantiza cumplimiento constitucional del control humano explicito y reduce riesgo operativo.

**Independent Test**: Se valida cuando un aprobador completa una decision de aprobacion o rechazo y queda registro auditable con motivo y sello temporal.

**Acceptance Scenarios**:

1. **Given** una recomendacion pendiente de decision, **When** el aprobador la autoriza o rechaza, **Then** el estado cambia y queda registro trazable de la decision.
2. **Given** una recomendacion ya decidida, **When** otro usuario intenta volver a decidir sin permisos, **Then** el sistema bloquea la accion e informa la restriccion.

---

### User Story 3 - Auditar ciclo de vida de senal a intento de ejecucion (Priority: P3)

Como auditor operativo, necesito consultar el historial completo desde la senal hasta el intento de ejecucion para verificar cumplimiento, trazabilidad y consistencia.

**Why this priority**: Refuerza la auditabilidad de extremo a extremo y facilita revisiones internas o regulatorias.

**Independent Test**: Se valida cuando el auditor puede recuperar una recomendacion historica y confirmar cadena completa de eventos y responsables.

**Acceptance Scenarios**:

1. **Given** una operacion con historial registrado, **When** el auditor consulta su detalle historico, **Then** obtiene secuencia cronologica completa de senal, evidencia, decision e intento de ejecucion.

---

### Edge Cases

- Que ocurre cuando llega una recomendacion sin evidencia suficiente para justificar la accion propuesta.
- Como se comporta el tablero cuando hay inconsistencia temporal entre estado de broker y estado de decision humana.
- Que sucede si dos aprobadores intentan actuar sobre la misma recomendacion en la misma ventana operativa: se aplica optimistic lock por campo `version`; el segundo intento con version desfasada falla con error de concurrencia y no altera el estado terminal.
- Como se gestiona una recomendacion vencida que no recibio decision dentro del tiempo operativo esperado.
- Como se comporta el dashboard ante caida o latencia critica de broker: activar modo degradado visible, bloquear decisiones nuevas sobre senales afectadas, reintentar sincronizacion automaticamente y emitir alerta operativa.
- Que ocurre en entorno local cuando el token de desarrollo no existe, no coincide con `JWT_SECRET` o vence: el sistema debe dar mensaje accionable (401 explicito) y proveer mecanismo de bootstrap para regenerar/sincronizar token sin ediciones manuales ad-hoc.

## Success Criteria *(mandatory, measurable outcomes)*

- **SC-021**: El superchart (TradingView Lightweight Charts v5.x) mantiene interaccion fluida (zoom/pan/crosshair) con p95 latencia de respuesta visual <= 120 ms en ventanas de 5000 velas.
- **SC-022**: El tiempo de render inicial del tablero (watchlist + chart + tabla confluencia) es <= 2.5 segundos en desarrollo local (CPU i5+, RAM 8GB, red local).
- **SC-023**: La sincronizacion click-fila-tabla a marcador-resaltado-en-chart se completa con p95 latencia <= 300 ms.
- **SC-024**: El selector de temporalidad (1m/5m/15m/1h/4h/1d/1w/1M/ALL) solo muestra granularidades reportadas por `capabilities.granularities` y bloquea selecciones no soportadas (0 errores funcionales en suite de integracion).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE presentar un tablero principal del equipo con confluencia de senales por activo y broker.
- **FR-002**: El sistema DEBE mostrar para cada recomendacion su estado operativo, nivel de riesgo y evidencia asociada.
- **FR-003**: El sistema DEBE permitir que un aprobador autorizado emita una decision humana explicita de aprobacion o rechazo.
- **FR-004**: El sistema DEBE registrar toda decision humana con responsable, motivo y marca temporal.
- **FR-005**: El sistema DEBE mantener trazabilidad completa entre senal, evidencia, decision humana e intento de ejecucion.
- **FR-006**: El sistema DEBE bloquear cualquier intento de ejecucion que no cuente con decision humana valida.
- **FR-007**: El sistema DEBE exponer el estado operativo de integracion con brokers de forma desacoplada del flujo de visualizacion.
- **FR-008**: El sistema DEBE permitir consulta historica por recomendacion para auditoria operacional.
- **FR-009**: El sistema DEBE conservar versionado del contexto de recomendacion para poder reconstruir decisiones pasadas.
- **FR-010**: El sistema DEBE informar de forma clara cuando una accion no puede completarse por restricciones operativas o de permisos.
- **FR-011**: El sistema DEBE conservar evidencia operativa y de auditoria por al menos 365 dias para revisiones de cumplimiento.
- **FR-012**: El sistema DEBE mostrar de forma visible la naturaleza no asesora de las recomendaciones en puntos criticos de decision.
- **FR-013**: El control de acceso por rol (operador, aprobador, auditor) DEBE implementarse mediante Supabase RLS con JWT claims; ninguna logica de permisos custom se duplicara en el frontend ni en middleware separado.
- **FR-014**: El sistema DEBE aplicar control de concurrencia optimistic lock sobre `SenalConfluente` mediante campo `version`; cualquier decision con version no vigente DEBE rechazarse de forma atomica, registrar evento de auditoria y devolver mensaje explicito de conflicto.
- **FR-015**: El sistema DEBE emitir observabilidad estructurada por transicion con `trace_id` y `senal_id`, incluyendo metricas minimas `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms`.
- **FR-016**: Ante degradacion de integracion con broker (caida, timeout o lag critico), el sistema DEBE entrar en modo degradado visible, bloquear temporalmente decisiones nuevas sobre senales afectadas, ejecutar reintentos automaticos y registrar/emitir alerta operativa.
- **FR-017**: El equipo DEBE implementar tests automatizados (unit e integration) para cada servicio backend critico, endpoint y componente React del tablero, con cobertura minima del 80% en rutas de decision, concurrencia y auditoria.
- **FR-018**: Todo codigo nuevo generado en esta feature (servicios, endpoints, componentes React, middlewares y modulos de observabilidad) DEBE incluir comentarios con prefijo `FIC:` en formato bilingue ingles/espanol, cubriendo modulos, hooks publicos, logica critica e integraciones con broker. La ausencia de este estandar bloquea el cierre de cualquier tarea.
- **FR-019**: El sistema DEBE definir un flujo operativo de autenticacion local para desarrollo (JWT dev), incluyendo generacion y sincronizacion automatica del token entre backend y frontend con comandos reproducibles.
- **FR-020**: El sistema DEBE proveer scripts oficiales de arranque/parada para desarrollo local con dos modos: silencioso por defecto (background + logs en archivo) y modo visible bajo demanda para depuracion.
- **FR-021**: El sistema DEBE proveer un comando de estado operativo local que reporte `health`, puertos criticos y ultimas lineas de logs para diagnostico rapido sin abrir modo interactivo.
- **FR-022**: La documentacion de la feature DEBE incluir runbook de inicio local y troubleshooting minimo para `401 AUTH_CONTEXT_*`, desalineacion de JWT y conflictos de puertos.
- **FR-023**: El selector de instrumentos DEBE implementarse como watchlist en estructura de arbol por categorias `Indices`, `Stocks`, `Futures`, `Forex`, `Cripto`, `Bonos` y `References IDX`, permitiendo alta/baja dinamica de simbolos por usuario.
- **FR-024**: El dashboard DEBE incluir un superchart de velas (estilo TradingView) capaz de renderizar historico de alta densidad con overlay de senales, zoom/pan y tooltip enriquecido por vela/senal.
- **FR-025**: El dashboard DEBE soportar selector de temporalidad dinamica (incluyendo `1m`, `5m`, `15m`, `1h`, `4h`, `1d`, `1w`, `1M`, `ALL`) segun capacidades reportadas por la fuente de datos activa.
- **FR-026**: El dashboard DEBE incluir switch `ONLINE/OFFLINE` y switch `DEMO/OPERATIVA REAL`; ambos estados deben gobernar de forma explicita la seleccion de fuentes de datos y credenciales por broker.
- **FR-027**: El sistema DEBE gestionar configuracion multi-broker via catalogo en Supabase, incluyendo como minimo IBKR, Alpaca, Capital.com, BlackBull Markets, Forex.com, Blueberry Markets y TradeStation.
- **FR-028**: El sistema DEBE permitir configurar por separado, por broker, la fuente para instrumentos, historico OHLC, indicadores tecnicos y streaming, con fallback controlado a datos locales en Supabase.
- **FR-029**: El dashboard DEBE incluir menu de indicadores tecnicos con patron `3 visibles + overflow (tres puntos)`, modal de busqueda dinamica y seleccion multi-indicador proveniente de API online u offline.
- **FR-030**: El dashboard DEBE incluir tabla avanzada de confluencia con capacidades de ordenamiento multisorteo por columna, filtrado, exportacion, sincronizacion fila-chart, y render basado en metadatos configurable (column registry).
- **FR-031**: Al seleccionar una fila de la tabla de confluencia, la senal correspondiente DEBE resaltarse en el superchart con marcador visual de alta prioridad (color fluorescente), mostrando precio/fecha y tooltip detallado al hover.
- **FR-032**: La tabla de confluencia DEBE soportar y renderizar el contrato completo de metadatos operativos de entrada/salida y derivados: `timing_d`, `timing_h`, `pre_senal`, `senal_real_activada`, `stop`, `objetivo`, `divergencia`, `z_extrema`, `cantidad_sugerida`, `vencimiento`, `precio_ejercicio`, `tipo_opcion` (call/put), `duracion`, `bid`, `ask`, `zona_apertura`, `zona_cierre`, `stoploss_sugerido`, `alerta_configurada`, `referencia_maximos`, `referencia_minimos`, `variantes_ataque`, `recolocacion_stoploss`, `liquidez`, `riesgo`, `retorno_maximo`, `perdida_maxima`.
- **FR-033**: La tabla de confluencia DEBE ser dinamica y configurable por metadatos (column registry), permitiendo agregar, ocultar, reordenar o retirar campos sin cambios de codigo; los usuarios DEBEN poder guardar vistas/presets por rol o perfil.

### Key Entities *(include if feature involves data)*

- **SenalConfluente**: Representa una recomendacion consolidada con activo, prioridad operativa, nivel de riesgo y evidencia de soporte. Ciclo de vida: `pendiente` -> `en_revision` -> `aprobada` / `rechazada` -> `ejecutada` / `fallida`; transicion lateral a `vencida` desde `pendiente` o `en_revision` al expirar la ventana operativa. Solo un aprobador puede transicionar de `en_revision` a estado terminal (bloqueo de concurrencia).
- **DecisionHumana**: Representa la aprobacion o rechazo emitido por un responsable con motivo, fecha y estado de validez.
- **IntentoEjecucion**: Representa el intento operativo posterior a la decision humana, con resultado y contexto de broker.
- **EvidenciaOperacion**: Representa los datos de explicacion y respaldo usados para justificar una recomendacion y su decision.
- **EventoAuditoria**: Representa un registro cronologico inmutable de cada accion relevante del ciclo de vida.

## UI Architecture & Component Stack *(professional TradingView-like design)*

### 1. Main Dashboard Layout
- **Library**: React 18 + Vite + TailwindCSS
- **Chart Component**: TradingView Lightweight Charts v4.x (candlestick OHLC + overlays)
- **Reference Design**: TradingView, Interactive Brokers, Alpaca Dashboard

### 2. Component Specifications

#### 2.1 Watchlist Tree (Main Control)
- **Type**: Tree component con nodos expandibles por categoria
- **Library**: tree-view component en React (compatible con virtualizacion y multi-select)
- **Data Source**: `instruments_catalog` + `user_watchlist_items` (Supabase) o proveedores externos segun modo
- **Categories**: Indices, Stocks, Futures, Forex, Cripto, Bonos, References IDX
- **Features**:
	- Alta de simbolo a watchlist desde catalogo dinamico
	- Baja de simbolo desde watchlist
	- Persistencia por usuario de expand/collapse y favoritos
	- Busqueda por simbolo o company name
- **Behavior**: On select de un simbolo en el arbol → fetch historico OHLC + overlays + tabla confluencia

#### 2.2 Time Period Selector
- **Type**: Dropdown + Date Range Picker
- **Library**: shadcn/ui select + react-day-picker
- **Options**: 1D, 1W, 1M, 3M, 6M, 1Y, YTD, Custom Range
- **Behavior**: On change → refetch OHLC data for selected period

#### 2.3 Timeframe Selector (Candlestick Granularity)
- **Type**: Button group or segmented control
- **Options**: 1m, 5m, 15m, 1h, 4h, 1d, 1w, 1M, ALL
- **Behavior**: On change → refetch OHLC at new granularity
- **Rule**: opciones visibles dinamicamente segun `capabilities.granularities` del broker/configuracion activa

#### 2.4 Chart Area (OHLC + Signal Overlay)
- **Type**: TradingView Lightweight Charts
- **Content**: Candlestick series + signal marks (colored dots/shapes)
- **Interactivity**:
	- Zoom/pan on chart
	- Crosshair tooltip on hover
	- Double-click to reset zoom
- **Scalability**: soporte para ventanas historicas amplias y render incremental/virtualizado
- **Signal Overlay**: Color-coded marks per core:
	- Green: Bullish/Buy signals
	- Red: Bearish/Sell signals
	- Yellow: Neutral/Hold signals
	- Hover: muestra tooltip con precio, fecha, score, core, estrategia y razon principal

#### 2.5 Cores Selector (Dynamic Checkboxes)
- **Type**: Vertical list of checkboxes (NOT hardcoded)
- **Data Source**: `cores_catalog` table (Supabase) with `active=true`
- **Features**:
	- Each core with colored indicator (matches overlay color)
	- Eye icon toggle to show/hide signals for that core
	- Color legend
- **Behavior**: On toggle → filter/rerender signal overlay

#### 2.6 Confluence Table
- **Type**: shadcn/ui DataTable (sortable, filterable)
- **Columns (base)**: Symbol, Core, Signal Type (Buy/Sell), Price, Timestamp, Week, Delta, Gamma, Theta, Vega, Confidence, Checklist Score, Strategy, Expected Return, Max Loss, Decision Reasons, Source Broker/API
- **Columns (operativas avanzadas)**: Timing D, Timing H, Pre-senal (alcista/bajista), Senal Real Activada, Stop, Objetivo, Divergencia, Z Extrema, Cantidad Sugerida Total, Vencimiento, Precio Ejercicio, Tipo Opcion (Call/Put), Duracion, Bid, Ask, Zona Apertura Exacta, Zona Cierre Exacta, Stoploss Sugerido, Alerta Configurada, Referencias Maximos/Minimos, Variantes de Ataque, Recolocacion Stoploss, Liquidez, Riesgo, Retorno Maximo, Perdida Maxima
- **Behavior**: Show signals for selected instrument + cores/confluencia seleccionada
- **Interaction**: click en fila -> resaltar marcador correspondiente en chart con color fluorescente y foco temporal
- **Dynamic Schema Rules**:
	- Las columnas no son fijas; se cargan desde configuracion (`confluence_column_configs`).
	- Cada columna define: `field_key`, `label`, `data_type`, `visible`, `order_index`, `source_path`, `format_rule`, `color_rule`, `is_filterable`, `is_sortable`, `is_exportable`.
	- Si un campo es retirado, el frontend no falla: simplemente deja de renderizar columna.
	- El usuario puede guardar presets de vista (e.g. "intradia", "swing", "opciones", "riesgo").
	- La vista por defecto se define por rol y puede sobrescribirse por usuario.

#### 2.7 Online/Offline Mode Switch
- **Type**: Toggle switch (labeled "Online" vs "Offline") + toggle secundario "Demo" vs "Operativa Real"
- **Location**: Top toolbar
- **Behavior**: 
	- ON (Live): Use real-time APIs (Alpaca, IBKR, etc.)
	- OFF (Offline): Use cached/local Supabase data
- **Demo/Real**:
	- Demo: usa credenciales/cuentas demo de broker
	- Operativa Real: usa credenciales/cuentas reales segun permisos y controles
- **Status Indicator**: Green dot (connected) or orange dot (offline)

#### 2.8 Indicators/Actions Menu (TradingView-like)
- **Type**: Toolbar con 3 accesos rapidos + menu overflow (tres puntos)
- **Entries minimas**:
	- Indicadores tecnicos (abre modal con buscador y seleccion multiple)
	- Alertas
	- Ordenes
	- Configuracion de Brokers/API
	- Configuracion de Cores/Estrategias
- **Indicators Modal**:
	- Carga dinamica de indicadores disponibles (online u offline)
	- Buscador por nombre/categoria
	- Multi-select con persistencia por usuario
	- Define si indicador se pinta sobre velas o en panel inferior

### 3. UI Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [Logo] | [Instrument Combobox ⭐] | [Period ▼] | [TF ▼] | [●Live] │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │     [TradingView Lightweight Charts]             │   │
│  │     (OHLC candlesticks + signal overlay)        │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│ ☐ Technical    [─] | ☐ Fundamental [─] | ☐ News [─]   │
├─────────────────────────────────────────────────────────┤
│ [Confluence Table with signals for selected cores]      │
└─────────────────────────────────────────────────────────┘
```

## Broker Configuration Architecture *(multi-broker, online/offline)*

### 1. Broker Configuration Model

**Table**: `broker_configurations` (Supabase)

```sql
CREATE TABLE broker_configurations (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL (e.g., 'Alpaca', 'Interactive Brokers', 'Capital.com', 'BlackBull Markets', 'Forex.com', 'Blueberry Markets', 'TradeStation', 'Local'),
	broker_type ENUM ('alpaca', 'ibkr', 'capital', 'blackbull', 'forexcom', 'blueberry', 'tradestation', 'local'),
	is_active BOOLEAN DEFAULT true,
	api_endpoint TEXT,
	api_key_encrypted TEXT,
	api_secret_encrypted TEXT,
	timeout_ms INTEGER DEFAULT 5000,
	priority INTEGER DEFAULT 0 (higher = preferred),
	capabilities JSONB (e.g., { "ohlc": true, "symbols": true, "indicators": true }),
	last_health_check TIMESTAMP,
	health_status ENUM ('healthy', 'degraded', 'offline'),
	created_at TIMESTAMP,
	updated_at TIMESTAMP
)
```

### 2. Capabilities Model

Each broker configuration declares what it can provide:
```json
{
	"ohlc": true,           // Can fetch candlestick data
	"symbols": true,        // Can fetch instrument list
	"indicators": true,     // Can compute technical indicators
	"real_time": true,      // Supports streaming/real-time
	"historical": true,     // Supports historical data
	"granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]
}
```

### 2.1 Broker Accounts Model (Demo/Real)

**Table**: `broker_accounts`

```sql
CREATE TABLE broker_accounts (
	id UUID PRIMARY KEY,
	broker_configuration_id UUID REFERENCES broker_configurations(id),
	account_mode ENUM ('demo', 'real') NOT NULL,
	account_label TEXT NOT NULL,
	api_key_encrypted TEXT,
	api_secret_encrypted TEXT,
	is_default BOOLEAN DEFAULT false,
	is_active BOOLEAN DEFAULT true,
	created_at TIMESTAMP,
	updated_at TIMESTAMP
)
```

### 3. Data Source Priority & Fallback

- **OHLC Data**:
	1. Try broker 1 (highest priority, if active & healthy)
	2. Try broker 2 (if broker 1 fails)
	3. Fall back to local cache (Supabase `ohlc_historical`)
	4. Show offline mode (grayed out, with cached data)

- **Instrument List**:
	1. Try broker 1 for live list
	2. Fall back to cached list (Supabase `instruments_catalog`)

- **Signals/Indicators**:
	1. Computed locally from OHLC + backend logic
	2. Use whichever OHLC source was available

### 4. Recommended APIs & Brokers

| Data Type | Recommended APIs | Alternative |
|-----------|------------------|-------------|
| OHLC (candlesticks) | Alpaca Data v2 API, IBKR API, TradeStation API | Polygon.io (paid) |
| Instruments/Symbols | Alpaca Assets API, IBKR Contracts API, TradeStation Symbols API | Local Supabase catalog |
| Forex/CFD market data | Capital.com API, Forex.com API, BlackBull/Blueberry feeds | Local Supabase catalog |
| Technical Indicators | Computed backend (TA-Lib) from OHLC | TradingView Data (costly) |
| Real-time streaming | Alpaca WebSocket, IBKR TWS | Polling fallback |

### 5. Online/Offline Mode Behavior

- **Online (Switch=ON)**:
	- Poll broker configurations (health check every 30s)
	- Use live APIs if healthy
	- Show green dot in UI
	- If any broker becomes unhealthy → switch to fallback

- **Offline (Switch=OFF)** or **All Brokers Unhealthy**:
	- Show orange dot in UI
	- Use only Supabase cached data
	- Display "Offline Mode - Last updated: [timestamp]"
	- Disable real-time features, show historical only

### 6. Mini-CRUD: Broker Configuration Admin

- **Page**: `settings/broker-configuration` (admin only)
- **Operations**: List, Create, Edit, Delete, Test Connection
- **Test Connection**: Validate API credentials + health check
- **Fields to Configure**:
	- Broker name, type, API endpoint
	- API credentials (encrypted storage)
	- Timeout, priority, capabilities toggle
	- Enable/disable toggle
	- Fuente por dominio: instrumentos, OHLC, indicadores, streaming
	- Cuenta por modo: demo y real

### 7. Confluence Table Configuration Model

**Table**: `confluence_column_configs`

```sql
CREATE TABLE confluence_column_configs (
	id UUID PRIMARY KEY,
	field_key TEXT NOT NULL,
	label TEXT NOT NULL,
	data_type TEXT NOT NULL,
	visible BOOLEAN DEFAULT true,
	order_index INTEGER NOT NULL,
	source_path TEXT NOT NULL,
	format_rule JSONB,
	color_rule JSONB,
	is_filterable BOOLEAN DEFAULT true,
	is_sortable BOOLEAN DEFAULT true,
	is_exportable BOOLEAN DEFAULT true,
	role_scope TEXT,
	created_at TIMESTAMP,
	updated_at TIMESTAMP
)
```

**Table**: `confluence_view_presets`

```sql
CREATE TABLE confluence_view_presets (
	id UUID PRIMARY KEY,
	name TEXT NOT NULL,
	role_scope TEXT,
	user_id UUID,
	columns_order JSONB NOT NULL,
	filters_default JSONB,
	is_default BOOLEAN DEFAULT false,
	created_at TIMESTAMP,
	updated_at TIMESTAMP
)
```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 95% de los operadores completa la revision de una recomendacion prioritaria y emite decision en menos de 3 minutos.
- **SC-002**: El 100% de las recomendaciones decididas conserva trazabilidad verificable desde senal hasta intento de ejecucion.
- **SC-003**: Al menos el 90% de las revisiones de auditoria interna concluye sin hallazgos de informacion faltante en la cadena de eventos.
- **SC-004**: Las incidencias por decisiones no autorizadas se mantienen en 0 por periodo mensual.
- **SC-005**: El 100% de las transiciones de estado de recomendacion registra `trace_id` y `senal_id`, y el tablero operativo expone las metricas `decision_latency_ms`, `decision_conflict_count` y `broker_sync_lag_ms` con actualizacion maxima de 60 segundos.
- **SC-006**: El 100% de eventos de degradacion de broker muestra estado visible en menos de 30 segundos y bloquea decisiones nuevas en senales afectadas hasta recuperacion o timeout operacional definido.
- **SC-007**: El 100% de ejecuciones locales con comando oficial de arranque inicia backend y frontend en un solo comando, y el dashboard orquestador responde sin `401` cuando el token dev fue sincronizado.
- **SC-008**: El comando de estado operativo local reporta en menos de 5 segundos el resultado de `health`, puertos 3000/5173 y tail de logs relevantes.
- **SC-009**: El 100% de los instrumentos seleccionados en dashboard se cargan desde tabla `instruments_catalog` (dinámico, no hardcoded), y el gráfico de velas se renderiza en menos de 2 segundos.
- **SC-010**: El 100% de los cores activos en dashboard se cargan desde tabla `cores_catalog` (dinámico) y se muestran como checkboxes filtrados y ordenados.
- **SC-011**: El 100% de los cambios de período/timeframe/instrumentorefrescan el gráfico con datos reales en menos de 3 segundos (online) o desde cache (offline).
- **SC-012**: El toggle Online/Offline muestra estado visual correcto (verde/naranja) y el dashboard degrada gracefully (cache + "Offline Mode" badge) cuando APIs no están disponibles.
- **SC-013**: El 100% de las configuraciones de brokers se gestionan desde tabla `broker_configurations`, es decir, agregar/editar/eliminar brokers no requiere cambios de código.
- **SC-014**: El watchlist en arbol permite alta/baja de simbolos por categoria y persiste cambios por usuario sin recargar la pagina.
- **SC-015**: El superchart renderiza historico y overlay de senales con interaccion fluida y mantiene respuesta perceptible incluso con volumen alto de velas.
- **SC-016**: El modo DEMO/OPERATIVA REAL conmuta cuentas de broker correctamente y registra en auditoria el modo activo por sesion.
- **SC-017**: La tabla de confluencia permite filtrar por core individual, subconjunto de cores y confluencia total; al seleccionar una fila, el chart resalta la senal correspondiente.
- **SC-018**: El menu de indicadores (3 visibles + overflow) permite busqueda y seleccion dinamica de indicadores, reflejando su render sobre el chart o panel inferior segun configuracion.
- **SC-019**: El 100% de las senales mostradas en la tabla de confluencia incluye los campos operativos avanzados requeridos (timings, entrada/salida exacta, derivados, riesgo/liquidez, alertas y referencias), con consistencia entre tabla y tooltip del chart.
- **SC-020**: El 100% de cambios de configuracion de columnas (agregar/quitar/reordenar/ocultar) se refleja sin redeploy ni cambios de codigo, y los presets de vista por rol/usuario se aplican correctamente.

## Assumptions

- TEAM-01 actua como equipo integrador del dominio operativo principal para este slice.
- Las recomendaciones operativas llegan con identificador unico y metadatos minimos de contexto.
- Existen roles definidos para operador, aprobador y auditor dentro del entorno del proyecto.
- La ejecucion automatica sin aprobacion humana permanece fuera de alcance por politica constitucional.
- El alcance de esta especificacion se limita al dashboard principal y su trazabilidad operativa, sin invadir responsabilidades de otros equipos.
- El desarrollo local usa JWT de entorno no productivo firmado con el mismo `JWT_SECRET` del backend y sincronizado automaticamente al frontend por scripts versionados.
- El dashboard utiliza TradingView Lightweight Charts como librería de gráficos, no D3.js o similares.
- Los datos OHLC se obtienen de brokers reales (Alpaca, IBKR) en modo online, o de Supabase en modo offline.
- Los datos OHLC e instrumentos pueden provenir de IBKR, Alpaca, Capital.com, BlackBull Markets, Forex.com, Blueberry Markets y TradeStation segun configuracion activa.
- Las configuraciones de brokers (endpoints, API keys) se almacenan en `broker_configurations` table y no en código.
- El selector de instrumentos se implementa como watchlist tree dinamico por categoria desde catalogo/tabla y no como lista hardcodeada.
- Los cores son dinámicos desde `cores_catalog`, no enum fija en código.
- El sistema mantiene cuentas demo y reales por broker en catalogo separado y conmuta por switch de modo operativo.
- La tabla de confluencia se gobierna por metadata en catalogo (`confluence_column_configs`) y soporta evolucion de campos sin romper UI/API.

## Cobertura de Knowledge Aplicado

- Investigado con knowledge local: gobernanza de ejecucion humana, compliance y retencion, ciclo de vida de orden, frescura de market data, contratos de broker IBKR/Alpaca y confluencia IA.
- Resuelto con metodologia estandar: detalles de metricas UX del tablero y definicion de prioridades de historias para TEAM-01.
- No se detectaron skills requeridas faltantes para la etapa speckit.specify.
- Nuevo en esta iteración: UI Architecture profesional (TradingView-like), Broker Configuration Architecture (multi-broker, online/offline), dinámicas explícitas de componentes.

## Recomendaciones de Knowledge

Los siguientes temas mejorarian el knowledge base con /diana.knowledge:
- /diana.knowledge topic="sdd-lifecycle-sdk" scope="sdk" - El indice SDK muestra estado esqueleto para metodologia SDD y puede mejorar la consistencia inter-proyecto.
- /diana.knowledge topic="speckit-integration-patterns-sdk" scope="sdk" - El patron generico de integracion Speckit en SDK aun aparece como esqueleto y limita estandarizacion transversal.

## Clarifications

### Session 2026-05-12

- Q: ¿Cómo se enforcea la distinción de roles (operador, aprobador, auditor) a nivel técnico? → A: Roles via Supabase RLS + JWT claims, sin tabla de permisos custom.
- Q: ¿Cuáles son los estados del ciclo de vida de SenalConfluente? → A: `pendiente` -> `en_revision` -> `aprobada` / `rechazada` -> `ejecutada` / `fallida`; estado `vencida` alcanzable desde `pendiente` o `en_revision` por expiración de ventana operativa.
- Q: ¿Cómo se resuelve la concurrencia si dos aprobadores deciden la misma señal al mismo tiempo? → A: Optimistic lock con campo `version` en `SenalConfluente`; el segundo intento con version desactualizada falla con conflicto y no sobrescribe la decision valida.
- Q: ¿Cuál es el baseline de observabilidad para operar y auditar el dashboard? → A: Metricas obligatorias (`decision_latency_ms`, `decision_conflict_count`, `broker_sync_lag_ms`), logs estructurados por evento y correlacion por `trace_id`/`senal_id` en cada transicion.
- Q: ¿Cuál es la politica ante caida o latencia critica de broker? → A: Modo degradado visible con bloqueo temporal de decisiones nuevas en senales afectadas, reintento automatico y alerta operativa.
- Q: ¿Que faltaba para que Speckit incluyera JWT dev bootstrap y scripts de arranque/status desde el inicio? → A: Faltaba explicitar requisitos funcionales y criterios medibles de operabilidad local (auth bootstrap, comandos oficiales, diagnostico y troubleshooting), por lo que plan/tasks priorizaron dominio funcional y no runbook de desarrollo.