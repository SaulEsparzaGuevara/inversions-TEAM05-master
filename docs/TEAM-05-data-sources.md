# TEAM-05 Data Sources — Arquitectura de Fuentes

**Versión**: 1.0 | **Última actualización**: 2026-05-22 | **Autor**: TurboPapus

---

## Índice

1. [Resumen](#1-resumen)
2. [Arquitectura General](#2-arquitectura-general)
3. [SEC EDGAR 13F](#3-sec-edgar-13f)
4. [FINRA Short Interest](#4-finra-short-interest)
5. [Yahoo Finance Options Flow](#5-yahoo-finance-options-flow)
6. [Yahoo Finance Institutional](#6-yahoo-finance-institutional)
7. [Degradación Gradual](#7-degradación-gradual)
8. [Matriz Comparativa](#8-matriz-comparativa)
9. [Mantenimiento](#9-mantenimiento)

---

## 1. Resumen

El backend institucional consume **4 fuentes de datos reales y gratuitas** para alimentar el análisis institucional, las posiciones regulatorias y el motor de zonas S/R. Este documento describe la arquitectura, configuración, rate limits, caché y procedimientos de fallback de cada fuente.

### Principios de diseño

- **Sin dependencias pagas**: todas las fuentes son APIs gratuitas sin necesidad de API key
- **Degradación gradual**: si una fuente falla, el sistema continúa con las restantes
- **Fallback sintético**: cuando una fuente no responde, se genera una observación de baja confianza (0.3)
- **Caché configurable**: cada fuente tiene su propio TTL de caché y rate limiting

---

## 2. Arquitectura General

```
Frontend / API Client
        │
        ▼
┌─────────────────────────────────────────────────────┐
│           InstitutionalDataService                   │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │ SEC     │  │ FINRA   │  │ Yahoo    │  │ Yahoo  │ │
│  │ EDGAR   │  │ Short   │  │ Options  │  │ Inst.  │ │
│  │ 13F     │  │ Interest│  │ Flow     │  │ Hold.  │ │
│  └────┬────┘  └────┬────┘  └────┬─────┘  └───┬────┘ │
│       │            │            │             │      │
│  ┌────▼────────────▼────────────▼─────────────▼───┐  │
│  │           MergeObservations()                   │  │
│  │  → ownership promedio                          │  │
│  │  → flujos sumados                              │  │
│  │  → max volumen                                 │  │
│  │  → max liquidez                                │  │
│  └─────────────────────┬──────────────────────────┘  │
│                        │                             │
│  ┌─────────────────────▼──────────────────────────┐  │
│  │           overallStatus                         │  │
│  │  → "ok" (todas ok)                             │  │
│  │  → "partial" (≥1 fuente ok)                    │  │
│  │  → "all_failed" → HTTP 503                     │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Configuración de fuentes (`bootstrap.ts`)

Cada fuente se define con:

```typescript
interface InstitutionalSourceConfig {
  sourceId: string;          // Identificador único
  kind: string;              // Tipo de fuente
  label: string;             // Nombre legible
  enabled: boolean;          // Activar/desactivar
  tier: "free" | "premium";  // Tier
  baseUrl: string;           // URL base de la API
  path: string;              // Ruta del endpoint
  priority: number;          // Orden de prioridad (menor = más prioritario)
  cacheTtlMs: number;        // TTL de caché en ms
  rateLimitPerMinute: number;// Máximo de requests por minuto
  parser: InstitutionalSourceParser; // Función parser
}
```

---

## 3. SEC EDGAR 13F

### Descripción

Obtiene tenencias institucionales reportadas en filings 13F-HR ante la SEC. Usa el buscador EFTS (SEC Elasticsearch) para encontrar qué instituciones reportaron tener el ticker objetivo, luego extrae las posiciones desde los XML de cada filing.

### Configuración

| Campo | Valor |
|-------|-------|
| `sourceId` | `sec-edgar-13f` |
| `kind` | `sec_edgar_13f` |
| `baseUrl` | `https://efts.sec.gov` |
| `path` | `/LATEST/search-index` |
| `priority` | 1 (más prioritario) |
| `cacheTtlMs` | 600,000 (10 minutos) |
| `rateLimitPerMinute` | 10 |
| Parser | `parseSecEdgar13fReal()` |

### Flujo de ejecución

```
1. searchEfts(ticker, "13F-HR")
   → POST https://efts.sec.gov/LATEST/search-index
   → Body: { "q": ticker, "forms": ["13F-HR"], ... }
   → Retorna: hits[] con cik, formType, filingDate, primaryDoc

2. findXmlWithHoldings(hits[0..4])
   → Para cada filing, lista el directorio SEC
   → Busca el XML que contiene <informationTable>
   → Máximo 5 filings (MAX_FILINGS = 5)

3. extractInfoTableEntries(xmlText)
   → Regex: <infoTable>...<nameOfIssuer>...</nameOfIssuer>...</infoTable>
   → Filtra por nameOfIssuer o CUSIP

4. Parallelizado con Promise.all (~3.4s vs 19s original)
```

### CUSIP Mapping

El mapa `cusipForTicker()` contiene **~60 tickers** del S&P 500 con sus CUSIP de 9 caracteres, organizados por sector:

| Sector | Tickers |
|--------|---------|
| Technology | AAPL, MSFT, GOOGL, GOOG, NVDA, META, INTC, CSCO, IBM, QCOM, AMD, ADBE, ORCL, CRM, NOW, INTU |
| Consumer | AMZN, WMT, HD, COST, MCD, DIS, KO, SBUX, BKNG, LOW, TGT, NKE |
| Healthcare | UNH, JNJ, ABBV, MRK, LLY, TMO, ABT, PFE, MDT |
| Energy & Industrial | XOM, CVX, BA, GE, CAT, UPS, UNP, HON, LMT |
| Financial | JPM, V, MA, BAC, C, BRK.A, BRK.B, GS, MS |
| Telecom & Media | VZ, T, CMCSA |
| Other | SPY, QQQ, NEE, AVGO, ACN, LIN, AMT, TROW, SBUX |

Si un ticker no está en el mapa, la función retorna `null` y esa fuente no produce datos para ese ticker.

### Fallback

Si un ticker no se encuentra en los filings 13F, el parser retorna `null`. El `InstitutionalDataService` lo registra como `sourceReport.status = "error"` y continúa con las fuentes restantes.

---

## 4. FINRA Short Interest

### Descripción

Obtiene posiciones cortas consolidadas desde la API REST de FINRA. Usa un cache perezoso que carga el dataset completo al arrancar el servidor.

### Configuración

| Campo | Valor |
|-------|-------|
| `sourceId` | `finra-short-interest` |
| `kind` | `finra_short_interest` |
| `baseUrl` | `https://api.finra.org` |
| `path` | `/data/group/otcmarket/name/consolidatedShortInterest` |
| `priority` | 2 |
| `cacheTtlMs` | 300,000 (5 minutos) |
| `rateLimitPerMinute` | 30 |
| Parser | `parseFinraShortInterestReal()` |

### Flujo de ejecución

```
1. ensureFinraCache() (eager preload al arrancar)
   → POST https://api.finra.org/data/group/otcmarket/name/consolidatedShortInterest
   → Body: { "limit": 5000, "offset": 0, ... }
   → Parsea CSV de respuesta
   → Hasta 6 páginas (30,000 registros total)
   → Almacena en Map<string, FinraRecord[]> a nivel de módulo

2. parseFinraShortInterestReal(payload, request, source)
   → Busca ticker en finraCache
   → Extrae: avgDailyVolume, shortParVolume, shortParMarketPercent
   → Calcula: shortRatio (días para cubrir)

3. Rendimiento:
   → Primer llamado (carga completa): ~4.6s
   → Llamados subsecuentes: ~0.06ms
```

### Cache

```typescript
// Module-level cache en realSourceParsers.ts
const finraCache = new Map<string, FinraRecord[]>();
let finraCachePromise: Promise<void> | null = null;
```

Promise compartida para deduplicar inicios concurrentes:
```typescript
export async function ensureFinraCache(): Promise<void> {
  if (finraCache.size > 0) return;
  if (finraCachePromise) return finraCachePromise;
  finraCachePromise = doLoad();
  // ...
}
```

### Fallback

Si el ticker no está en la caché, retorna observación sintética:
```typescript
{
  sourceReports: [{ status: "error", error: "Ticker not found in FINRA cache" }],
  analysis: {
    ownership: 0,
    inflows: 0,
    outflows: 0,
    volume: 0,
    liquidity: "low",
    confidence: 0.3  // Baja confianza
  }
}
```

---

## 5. Yahoo Finance Options Flow

### Descripción

Reemplaza **Unusual Whales** (API paga). Obtiene la cadena de opciones desde la API no oficial v7 de Yahoo Finance, detecta actividad "unusual" (volumen > 2× OI) y calcula señales de flujo direccional.

### Configuración

| Campo | Valor |
|-------|-------|
| `sourceId` | `yahoo-options-flow` |
| `kind` | `yahoo_options_flow` |
| `baseUrl` | `https://query2.finance.yahoo.com` |
| `path` | `/v7/finance/options/{ticker}` |
| `priority` | 3 |
| `cacheTtlMs` | 120,000 (2 minutos) |
| `rateLimitPerMinute` | 30 |
| Parser | `parseYahooOptionsFlow()` (en `yahooOptionsParser.ts`) |

### Autenticación (Crumb)

Yahoo Finance requiere un flujo de autenticación de 3 pasos:

```
1. GET https://fc.yahoo.com/ → set cookie (A3)
2. GET https://query2.finance.yahoo.com/v1/test/getcrumb → crumb token
3. GET https://query2.finance.yahoo.com/v7/finance/options/{ticker}?crumb={crumb}
   → Headers: Cookie, User-Agent
```

El parser maneja este flujo automáticamente. Si falla la autenticación, retorna fallback sintético.

### Señales de Flujo

```typescript
function computeOptionsFlowSignal(options: OptionsChain): OptionsFlowSignal {
  // Por cada strike:
  //   Si volume > 2 × openInterest → "unusual"
  //   Calls inusuales → bullish
  //   Puts inusuales → bearish
  //
  // Retorna:
  //   bullishCount: número de calls inusuales
  //   bearishCount: número de puts inusuales
  //   putCallRatio: putVolume / callVolume
  //   signals: Array<{ strike, type, volumeRatio }>
}
```

### Confidence Scoring

| Factor | Peso | Descripción |
|--------|------|-------------|
| Expiration count | 25% | Más expiraciones = mejor señal |
| Unusual strikes | 35% | Cantidad de strikes con volumen > 2× OI |
| Total volume | 25% | Volumen total de opciones negociado |
| Open Interest | 15% | OI total como medida de profundidad |

### Fallback

Si la API de Yahoo falla (HTTP error, timeout, malformed JSON), retorna observación sintética con `confidence: 0.3`.

---

## 6. Yahoo Finance Institutional

### Descripción

Reemplaza **Finviz Institutional** (API no oficial, scraping frágil). Obtiene tenencias institucionales desde la API no oficial v10 de Yahoo Finance, extrayendo holders individuales, breakdown de major holders y flujos netos.

### Configuración

| Campo | Valor |
|-------|-------|
| `sourceId` | `yahoo-institutional` |
| `kind` | `yahoo_institutional` |
| `baseUrl` | `https://query2.finance.yahoo.com` |
| `path` | `/v10/finance/quoteSummary/{ticker}` |
| `priority` | 4 (menos prioritario) |
| `cacheTtlMs` | 600,000 (10 minutos) |
| `rateLimitPerMinute` | 10 |
| Parser | `parseYahooInstitutional()` (en `yahooInstitutionalParser.ts`) |

### Flujo de ejecución

```
1. fetchYahooInstitutional(ticker)
   → GET https://query2.finance.yahoo.com/v10/finance/quoteSummary/{ticker}
     ?modules=institutionOwnership&crumb={crumb}
   → Extrae quoteSummary.result[0].institutionOwnership

2. Extrae ownershipList (holders individuales):
   → name, shares, change

3. Extrae majorHoldersBreakdown:
   → % held por instituciones

4. Calcula:
   → fundsOwnershipPct = breakdown.total / 100
   → inflows = sum(positive changes)
   → outflows = sum(negative changes)
   → netFlow = inflows - outflows
```

### Confidence Scoring

| Factor | Peso | Descripción |
|--------|------|-------------|
| Holders count | 30% | Más holders = mejor señal |
| Breakdown available | 30% | Si majorHoldersBreakdown existe |
| Net flow | 25% | Flujos calculados desde cambios |
| Stale data penalty | 15% | Penalidad si los datos son viejos |

### Fallback

Si la API de Yahoo falla, retorna observación sintética con `confidence: 0.3`.

---

## 7. Degradación Gradual

El `InstitutionalDataService.resolve()` implementa degradación gradual multi-fuente:

### Source Reports

Cada fuente produce un reporte individual:

```typescript
interface InstitutionalSourceReport {
  sourceId: string;
  status: "ok" | "error" | "cached" | "rate_limited" | "skipped";
  latencyMs: number;
  error?: string;
}
```

### overallStatus

Se computa automáticamente:

| Estado | Significado | HTTP Status |
|--------|-------------|-------------|
| `"ok"` | Todas las fuentes retornaron datos | 200 |
| `"partial"` | ≥1 fuente ok, algunas fallaron | 200 |
| `"all_failed"` | Ninguna fuente retornó datos utilizables | **503** |

### Casos de degradación

| Escenario | Comportamiento |
|-----------|---------------|
| 1 fuente falla (ej. Yahoo) | `overallStatus: "partial"`, sourceReport con status "error" |
| 2 fuentes fallan | `overallStatus: "partial"`, datos de las 2 fuentes restantes |
| Todas fallan | `overallStatus: "all_failed"`, HTTP 503 |
| Rate limit excedido | `sourceReport.status: "rate_limited"`, reintento en próximo ciclo |
| Timeout (>12s) | `sourceReport.status: "error"`, error: "Source timed out" |
| Cache hit | `sourceReport.status: "cached"`, latencyMs ≈ 0 |

---

## 8. Matriz Comparativa

| Característica | SEC EDGAR | FINRA | Yahoo Options | Yahoo Inst. |
|---------------|-----------|-------|---------------|-------------|
| **Tipo de dato** | Holdings 13F | Short interest | Options flow | Institutional ownership |
| **Frecuencia** | Trimestral | Quincenal | Tiempo real | Tiempo real |
| **API Key** | No | No | No (crumb auth) | No (crumb auth) |
| **Caché (TTL)** | 10 min | 5 min | 2 min | 10 min |
| **Rate limit** | 10 req/min | 30 req/min | 30 req/min | 10 req/min |
| **Prioridad** | 1 (alta) | 2 | 3 | 4 (baja) |
| **Timeout** | 12s | 12s | 12s | 12s |
| **Fallback** | null → error | sintético 0.3 | sintético 0.3 | sintético 0.3 |
| **Parser file** | `realSourceParsers.ts` | `realSourceParsers.ts` | `yahooOptionsParser.ts` | `yahooInstitutionalParser.ts` |
| **Tests** | Integración | Integración | 6 unit + integración | 5 unit + integración |
| **Tarea** | T334 | T333 | T338 | T339 |

---

## 9. Mantenimiento

### Monitoreo de fuentes

No hay dashboard automático. Para verificar el estado:
1. Logs del servidor — cada sourceReport se loggea con su status y latencia
2. Endpoint `/api/institutional/analysis?ticker=SPY` — revisar `sourceReports[]` en la respuesta

### Problemas conocidos

| Fuente | Problema | Mitigación |
|--------|----------|------------|
| Yahoo (ambas) | APIs no oficiales — pueden cambiar sin aviso | Fallback sintético con confidence 0.3 |
| Yahoo (ambas) | Rate limiting no documentado | 30 req/min, caché de 2-10 min |
| SEC EDGAR | EFTS puede rate-limit | 10 req/min, MAX_FILINGS = 5 |
| SEC EDGAR | CUSIP incompleto (~60 de 500+ tickers) | Retorna null para tickers sin CUSIP |
| FINRA | Dataset completo tarda ~4.6s en cargar | Eager preload no-bloqueante al arrancar |
| FINRA | Cache en memoria — se pierde al reiniciar | Se recarga automáticamente |

### Cómo agregar una nueva fuente

1. Crear parser en `src/modules/institutional/` (ej. `nuevaFuenteParser.ts`)
2. Implementar función parser que retorne `InstitutionalSourceObservation | null`
3. Agregar source config en `bootstrap.ts` → `buildDefaultSourceConfigs()`
4. Agregar caso en el switch de `InstitutionalDataService.resolve()` si el parser necesita lógica especial
5. Crear tests unitarios (mínimo 5 casos)
6. Actualizar este documento
