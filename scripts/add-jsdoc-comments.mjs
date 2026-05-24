#!/usr/bin/env node
/**
 * Script para añadir comentarios JSDoc a archivos TypeScript/TSX
 * sin alterar el código original.
 * 
 * Uso: node scripts/add-jsdoc-comments.mjs <file-patterns...>
 * 
 * Este script agrega comentarios JSDoc antes de:
 * - export function / export async function
 * - export class
 * - export interface
 * - export type
 * - export default
 * - export const (con función flecha)
 * 
 * También agrega un comentario de cabecera al archivo si no tiene uno.
 * 
 * El script preserva TODAS las líneas de código original sin modificación.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Configuración ────────────────────────────────────────────

const FILE_HEADER_TEMPLATE = `/**
 * ============================================================================
 * ARCHIVO: {filename}
 * ============================================================================
 *
 * PROPÓSITO:
 *   {purpose}
 *
 * UBICACIÓN EN EL PROYECTO:
 *   {location}
 *
 * FIC: {fic}
 */

// ═══════════════════════════════════════════════════════════════
// DEPENDENCIAS
// ═══════════════════════════════════════════════════════════════
`;

// ─── Knowledge base para generar descripciones ────────────────
const FILE_KNOWLEDGE = {
  // === INSTITUTIONAL MODULE ===
  'institutionalContract.ts': {
    purpose: 'Define los contratos, interfaces y esquemas Zod para el análisis institucional. Incluye tipos para solicitudes de análisis, observaciones de fuentes, zonas de soporte/resistencia, contexto de tendencia, y configuración de fuentes de datos.',
    location: 'src/modules/institutional/institutionalContract.ts — importado por todos los módulos institucionales (dataService, zonesEngine, trendEngine, parsers, routes)',
    fic: 'T106: Institutional analysis contract — defines Zod-validated request/response types for institutional analysis, source observations, zones, trends, and multi-source degradation.',
  },
  'institutionalDataService.ts': {
    purpose: 'Servicio central orquestador de las 4 fuentes de datos institucionales (SEC EDGAR 13F, FINRA Short Interest, Yahoo Options Flow, Yahoo Institutional). Implementa caché en memoria, rate limiting, resolución paralela, merge de observaciones y degradación gradual (overallStatus: ok/partial/all_failed).',
    location: 'src/modules/institutional/institutionalDataService.ts — invocado desde bootstrap.ts para los endpoints de análisis y posiciones',
    fic: 'T107: Institutional Data Service — orchestrates multi-source data fetching with caching, rate limiting, parallel resolution, and graceful degradation via overallStatus.',
  },
  'institutionalZonesEngine.ts': {
    purpose: 'Motor de detección de zonas de soporte y resistencia basado en velas sintéticas sinusoidales. Clusteriza strikes cercanos dentro de un umbral de precio, asigna fuerza por volumen acumulado y confianza de fuentes, y clasifica en soportes (debajo del precio actual) y resistencias (encima).',
    location: 'src/modules/institutional/institutionalZonesEngine.ts — invocado desde institutionalAnalysis.ts y bootstrap.ts',
    fic: 'T108: Institutional Zones Engine — detects support/resistance zones from synthetic sinusoidal candles with volume-weighted clustering and multi-source confidence scoring.',
  },
  'institutionalTrendEngine.ts': {
    purpose: 'Motor de análisis de tendencia que combina EMA-8/EMA-20, RSI-14, flujo institucional neto, fortaleza de zonas S/R y análisis de expiración de opciones para determinar dirección (alcista/bajista/neutral), score, confianza y justificación.',
    location: 'src/modules/institutional/institutionalTrendEngine.ts — invocado desde institutionalAnalysis.ts y bootstrap.ts',
    fic: 'T108b: Institutional Trend Engine — computes bull/bear/neutral trend combining EMA crossover, RSI, institutional flows, zone strength, and options expiration analysis.',
  },
  'expirationAnalysisEngine.ts': {
    purpose: 'Motor de análisis de expiración de opciones: put/call ratio, max pain (precio de máxima pérdida para compradores), gamma exposure (GEX) con signo (positivo = estabilizador, negativo = acelerador), y niveles de soporte/resistencia implicados por open interest.',
    location: 'src/modules/institutional/expirationAnalysisEngine.ts — invocado desde institutionalTrendEngine.ts',
    fic: 'T108c: Expiration Analysis Engine — computes put/call ratio, max pain, gamma exposure, and implied S/R levels from options chain data.',
  },
  'yahooOptionsParser.ts': {
    purpose: 'Parser de la API v7 de Yahoo Finance (query2.finance.yahoo.com/v7/finance/options) para cadena de opciones. Incluye autenticación crumb (3 pasos: cookie → crumb → request autenticado), detección de strikes unusuales (volumen > 2× OI), put/call ratio, confidence scoring dinámico y fallback sintético con confidence 0.3.',
    location: 'src/modules/institutional/yahooOptionsParser.ts — registrado en bootstrap.ts como parser de la fuente "yahoo-options-flow" (prioridad 3, TTL 120s)',
    fic: 'T338: Yahoo Options Parser — fetches v7 options chain API with crumb auth, detects unusual volume signals, computes put/call ratio, with synthetic fallback at confidence 0.3.',
  },
  'yahooInstitutionalParser.ts': {
    purpose: 'Parser de la API v10 de Yahoo Finance (query2.finance.yahoo.com/v10/finance/quoteSummary) para tenencias institucionales. Extrae ownershipList (holders individuales), majorHoldersBreakdown (% held), calcula flujos netos (inflows/outflows) y confidence scoring dinámico con fallback sintético.',
    location: 'src/modules/institutional/yahooInstitutionalParser.ts — registrado en bootstrap.ts como parser de la fuente "yahoo-institutional" (prioridad 4, TTL 300s)',
    fic: 'T339: Yahoo Institutional Parser — fetches v10 quoteSummary institutionOwnership API with crumb auth, extracts holders, breakdown, net flows, with synthetic fallback.',
  },
  'realSourceParsers.ts': {
    purpose: 'Parsers para fuentes regulatorias reales: SEC EDGAR 13F (vía EFTS + SEC.gov XML) y FINRA Short Interest (vía API REST). Incluye mapeo CUSIP para 12 tickers, precarga de caché FINRA, y normalización a InstitutionalSourceObservation.',
    location: 'src/modules/institutional/realSourceParsers.ts — registrado en bootstrap.ts como parser de las fuentes "sec-edgar-13f" (prioridad 1) y "finra-short-interest" (prioridad 2)',
    fic: 'T107b: Real Source Parsers — SEC EDGAR 13F XML/FTS parsing and FINRA Short Interest REST API parsing with CUSIP mapping and cache preloading.',
  },
  
  // === ROUTES ===
  'bootstrap.ts': {
    purpose: 'Fábrica singleton que construye y expone todos los servicios institucionales: InstitutionalDataService (con 4 fuentes reales), InstitutionalZonesEngine (velas sintéticas), InstitutionalTrendEngine (EMAs/RZSI), y ExpirationAnalysisEngine. Define las source configs con URLs, prioridades, rate limits y TTLs.',
    location: 'src/routes/institutional/bootstrap.ts — invocado por institutionalAnalysis.ts y regulatoryPositions.ts',
    fic: 'T340: Bootstrap — singleton factory creating InstitutionalDataService with 4 real sources (no mocks), zones/trend/expiration engines, and source configs with priorities/rate-limits.',
  },
  'institutionalAnalysis.ts': {
    purpose: 'Endpoint GET /analysis que retorna análisis institucional completo: zonas S/R (zones engine), tendencia (trend engine), métricas, ventanas de catalizadores (expiration engine) y reportes de fuentes con estados individuales.',
    location: 'src/routes/institutional/institutionalAnalysis.ts — montado en src/index.ts como ruta del router institucional',
    fic: 'T111: Institutional Analysis Route — GET /api/institutional/analysis returning zones, trends, metrics, catalyst windows and per-source reports.',
  },
  'regulatoryPositions.ts': {
    purpose: 'Endpoint GET /positions que retorna posiciones regulatorias (13F), flujos institucionales (inflows/outflows/neto), tenencia, y source reports con indicador de caché y fuentes utilizadas.',
    location: 'src/routes/institutional/regulatoryPositions.ts — montado en src/index.ts como ruta del router institucional',
    fic: 'T112: Regulatory Positions Route — GET /api/institutional/positions returning 13F positions, institutional flows, holdings and source reports.',
  },
  'institutionalCopilotChat.ts': {
    purpose: 'Integración con Google Gemini 2.5 Flash para chat contextual. Construye system prompt con datos institucionales, llama a generateContent() de la API Gemini, implementa polling asíncrono con Map<string, ChatSessionState>, y maneja degradación (sin API key → mensaje de no disponible).',
    location: 'src/modules/ai/institutionalCopilotChat.ts — invocado desde institutionalCopilot.ts (routes)',
    fic: 'T121: Institutional Copilot Chat — Gemini 2.5 Flash integration with contextual system prompt, async polling, and graceful degradation when API key is missing.',
  },
  'institutionalCopilot.ts': {
    purpose: 'Rutas del chat IA: POST /chat (inicia sesión, retorna 202 con pollingUrl) y GET /chat/poll/:id (polling de resultado Gemini). Middleware de validación con schemas Zod.',
    location: 'src/routes/ai/institutionalCopilot.ts — montado en src/index.ts',
    fic: 'T121b: Institutional Copilot Route — POST /api/ai/institutional-chat and GET /api/ai/institutional-chat/poll/:id with Zod validation and async polling.',
  },
  
  // === COVERAGE STRATEGIES ===
  'coverageTypes.ts': {
    purpose: 'Define todos los tipos y schemas Zod para estrategias de cobertura: CoverageStrategyKind, CoverageStrategyRequest, CoverageStrategyResult (payoff, riskMetrics, alerts), CoverageComparisonResult, CoverageSimulationResult. Incluye tipos para Monte Carlo y backtest.',
    location: 'src/modules/strategies/coverage/coverageTypes.ts — importado por todos los engines, servicios y el comparador',
    fic: 'T113/T120: Coverage types and comparison contracts — Zod schemas and TypeScript types for coverage strategies, simulation, risk, report, and comparison results.',
  },
  'coverageStrategyContract.ts': {
    purpose: 'Contrato base que implementan todos los engines de cobertura. Define la interfaz CoverageStrategyEngine con método analyze() que todo engine (ProtectivePut, Collar, CoveredStraddle) debe implementar.',
    location: 'src/modules/strategies/coverage/coverageStrategyContract.ts — implementado por protectivePutEngine.ts, collarEngine.ts, coveredStraddleEngine.ts',
    fic: 'T113: Coverage Strategy Contract — base interface CoverageStrategyEngine with analyze() method implemented by all coverage engines.',
  },
  'coverageStrategyAdapter.ts': {
    purpose: 'Adaptador al estándar transversal StrategyOutputStandard (T173). Toma el resultado de cualquier engine de cobertura y lo transforma al formato unificado para reporting y frontend.',
    location: 'src/modules/strategies/coverage/coverageStrategyAdapter.ts',
    fic: 'T173: Coverage Strategy Adapter — transforms engine results into standard StrategyOutput format for cross-module compatibility.',
  },
  'protectivePutEngine.ts': {
    purpose: 'Implementa Protective Put (compra de put para proteger posición larga) y Married Put (compra simultánea de acción + put). Calcula payoff con Black-Scholes simplificado, métricas de riesgo (máx pérdida, break-even, protección), y alertas (prima alta, strike deep OTM/ITM).',
    location: 'src/modules/strategies/coverage/protectivePutEngine.ts — invocado desde coverageComparator.ts',
    fic: 'T114/T114b: Protective Put and Married Put Engines — computes payoff, risk metrics, and alerts for put-protected long positions with simplified Black-Scholes pricing.',
  },
  'collarEngine.ts': {
    purpose: 'Implementa Collar Put (put protectora + call vendida). Genera combinaciones de strikes, calcula prima neta (puede ser crédito), payoff acotado, métricas de riesgo (techo/piso), y alertas (costo neto, rango estrecho).',
    location: 'src/modules/strategies/coverage/collarEngine.ts — invocado desde coverageComparator.ts',
    fic: 'T115: Collar Engine — computes capped payoff, net premium (debit/credit), risk metrics, and alerts for collar strategies combining long put + short call.',
  },
  'coveredStraddleEngine.ts': {
    purpose: 'Implementa Covered Straddle (acciones + short put + short call). Calcula payoff con riesgo ilimitado a la baja, métricas de margen, y alertas de prima total alta o desbalance de primas.',
    location: 'src/modules/strategies/coverage/coveredStraddleEngine.ts — invocado desde coverageComparator.ts',
    fic: 'T116: Covered Straddle Engine — computes unlimited-risk payoff, margin metrics, and stress alerts for straddle on owned shares.',
  },
  'coverageSimulationEngine.ts': {
    purpose: 'Simulación Monte Carlo (10,000 iteraciones con distribución normal) y backtest de estrategias de cobertura. Calcula escenarios deterministas (20 puntos de precio) y métricas: expectedPnL, winRate, VaR 95%, Expected Shortfall.',
    location: 'src/modules/strategies/coverage/coverageSimulationEngine.ts — invocado desde coverageComparator.ts',
    fic: 'T117: Coverage Simulation Engine — Monte Carlo simulation (10K iterations) and backtest with deterministic scenarios, VaR, and Expected Shortfall.',
  },
  'coverageRiskService.ts': {
    purpose: 'Evaluación de riesgos: detecta stop-loss disparado, alertas de margen, genera acciones recomendadas y notificaciones para el usuario.',
    location: 'src/modules/strategies/coverage/coverageRiskService.ts — invocado desde coverageComparator.ts',
    fic: 'T118: Coverage Risk Service — evaluates stop-loss, margin stress, and generates recommendation actions and user notifications.',
  },
  'coverageReportService.ts': {
    purpose: 'Generación de reportes completos: combina resultado de estrategia + simulación + riesgo. Genera summary con winRate, riskRewardRatio, alertCount.',
    location: 'src/modules/strategies/coverage/coverageReportService.ts — invocado desde coverageComparator.ts',
    fic: 'T119: Coverage Report Service — combines strategy result, simulation, and risk into comprehensive reports with winRate and risk-reward metrics.',
  },
  'coverageComparator.ts': {
    purpose: 'Compara y rankea estrategias de cobertura. Genera las 4 variantes (protective put, married put, collar, covered straddle), ejecuta simulación + riesgo + reporte para cada una, asigna score compuesto por PnL/win rate/riesgo, recomienda la mejor estrategia.',
    location: 'src/modules/strategies/coverage/coverageComparator.ts — invocado desde coverageStrategies route handler',
    fic: 'T120: Coverage Comparator — ranks 4 strategies by composite score (PnL, win rate, risk, R/R ratio) and recommends the top performer.',
  },
  'strategyOutputStandard.ts': {
    purpose: 'Define el formato estándar transversal para TODAS las salidas de estrategias. Interfaces: StrategyOutputStandard, StandardPayoff, StandardRiskMetrics. Permite que cualquier frontend consuma cualquier estrategia sin cambios en el contrato.',
    location: 'src/modules/strategies/standards/strategyOutputStandard.ts — usado por coverageStrategyAdapter.ts y reportService',
    fic: 'T173: Strategy Output Standard — cross-module standard format for strategy outputs with unified payoff, risk metrics, and alert types.',
  },
  
  // === RESILIENCE ===
  'retryWithBackoff.ts': {
    purpose: 'Reintentos con backoff exponencial y jitter. Configurable: maxAttempts (default 5), baseMs (200), maxMs (10000), jitter (true). El jitter aleatorio evita el efecto "thundering herd".',
    location: 'src/lib/resilience/retryWithBackoff.ts — usado por institutionalDataService.ts para reintentar requests a fuentes externas',
    fic: 'T208: Retry with Backoff — exponential backoff retry utility with jitter, configurable attempts, and timeout cap at 10s.',
  },
  'staleInput.ts': {
    purpose: 'Detección de datos obsoletos (stale). isStale() verifica si la antigüedad supera el threshold (default 1 día). handleStaleInupt() ejecuta callback onStale cuando los datos están vencidos.',
    location: 'src/lib/resilience/staleInput.ts — usado para decidir si usar datos cacheados o refrescar desde la fuente',
    fic: 'T208: Stale Input Detection — checks if data timestamp exceeds threshold (default 1 day) and triggers optional onStale callback.',
  },
  'partialDataHandler.ts': {
    purpose: 'Merge de datos parciales con defaults. mergePartialWithDefaults() combina un objeto parcial con defaults completos, reemplazando undefined/null con valores por defecto.',
    location: 'src/lib/resilience/partialDataHandler.ts — usado en estrategias de cobertura para mergear configuración parcial del usuario',
    fic: 'T208: Partial Data Handler — merges partial objects with full defaults, replacing null/undefined with default values.',
  },
  
  // === JOBS, OBSERVABILITY, TOOLS ===
  'purgeEvidenceJob.ts': {
    purpose: 'Tarea programada que purga evidencia de análisis con más de 90 días de antigüedad. Previene acumulación de datos obsoletos en la base de datos.',
    location: 'src/jobs/purgeEvidenceJob.ts — ejecutado como cron job o al arrancar el servidor',
    fic: 'T202: Purge Evidence Job — scheduled task to purge analysis evidence older than 90 days from the database.',
  },
  'coverageMetrics.ts': {
    purpose: 'Métricas de monitoreo para el módulo de cobertura. trackCoverageAnalysis() registra análisis, trackStrategyComparison() registra comparaciones, getCoverageMetrics() recupera métricas acumuladas.',
    location: 'src/observability/coverageMetrics.ts — importado por coverageComparator.ts y route handlers',
    fic: 'T203: Coverage Metrics — telemetry and monitoring for coverage module with tracking and retrieval functions.',
  },
  'reconstruct_explanation.ts': {
    purpose: 'Herramienta de auditoría que reconstruye una explicación detallada de estrategia de cobertura a partir de un resultado de análisis. Útil para debugging o reportes legibles.',
    location: 'tools/reconstruct_explanation.ts — herramienta CLI independiente',
    fic: 'T205: Reconstruct Explanation — audit tool that generates detailed textual explanations of coverage strategy results from analysis output.',
  },
  '008_institutional_copilot.sql': {
    purpose: 'Migración SQL para tablas del chat IA institucional. Crea institutional_chat_sessions (id, ticker, precio, contexto, timestamps) e institutional_chat_messages (rol: user/assistant, contenido) con políticas RLS.',
    location: 'src/database/supabase/migrations/008_institutional_copilot.sql — migración de base de datos Supabase/PostgreSQL',
    fic: 'T201: Copilot DB Migration — SQL migration creating chat sessions and messages tables with Row Level Security policies.',
  },
  'index.ts': {
    purpose: 'Punto de entrada del backend Express.js. Configura middleware (JSON, CORS, auth bypass), monta routers institucionales (analysis, positions, coverage) y de AI (chat), inicializa caché FINRA al arrancar.',
    location: 'src/index.ts — entry point del paquete @inversions/rest-api',
    fic: 'Mounts Express app with JSON/CORS/auth middleware, institutional routers (analysis, positions, coverage), AI router (chat, poll), and FINRA cache preload.',
  },
  
  // === FRONTEND ===
  'main.tsx': {
    purpose: 'Punto de entrada de la aplicación React. Configura React Router con rutas para las 4 páginas (Institutional Analysis, Regulatory Positions, Coverage Strategies, AI Chat), renderiza MainLayout como wrapper, monta en #root.',
    location: 'projects/pwa/inversions_app/src/main.tsx — entry point del frontend',
    fic: 'React entry point with React Router v7, 4 routes, and MainLayout wrapper.',
  },
  'MainLayout.tsx': {
    purpose: 'Layout principal con sidebar de navegación. Enlaces a Dashboard y las 4 páginas del módulo institucional. Diseño responsive con sidebar colapsable. Usa React Router Outlet para renderizar páginas hijas.',
    location: 'projects/pwa/inversions_app/src/layouts/MainLayout.tsx',
    fic: 'Main layout with responsive sidebar navigation and React Router Outlet for child pages.',
  },
  'InstitutionalAnalysisPage.tsx': {
    purpose: 'Página de análisis institucional. Formulario con inputs: Ticker, Período (5 opciones), Horizonte (3 opciones). Muestra zonas S/R (soporte/resistencia), tendencia (alcista/bajista/neutral), métricas, catalyst windows y source reports con estados individuales.',
    location: 'projects/pwa/inversions_app/src/pages/institutional/InstitutionalAnalysisPage.tsx',
    fic: 'Institutional analysis page with S/R zones, trend, metrics, catalyst windows and source reports.',
  },
  'RegulatoryPositionsPage.tsx': {
    purpose: 'Página de posiciones regulatorias 13F. Muestra tabla 13F con posiciones (issuer, cusip, value, shares, weight, change), tarjetas de flujos (inflows/outflows/net), tenencia institucional, y source reports con indicador de caché.',
    location: 'projects/pwa/inversions_app/src/pages/institutional/RegulatoryPositionsPage.tsx',
    fic: 'Regulatory positions page with 13F table, institutional flows, holdings percentage and source reports.',
  },
  'CoverageStrategiesPage.tsx': {
    purpose: 'Página de simulación de coberturas. Formulario: Ticker, Precio, Acciones, Strikes. Muestra 4 tarjetas (Protective Put, Married Put, Collar, Covered Straddle) con gráfico de payoff (Recharts), métricas (break-even, win rate, R/R ratio) y alertas.',
    location: 'projects/pwa/inversions_app/src/pages/coverage/CoverageStrategiesPage.tsx',
    fic: 'Coverage simulation page with payoff charts (Recharts), risk metrics, alerts, and ranked strategy recommendations.',
  },
  'AIChatPage.tsx': {
    purpose: 'Página de chat con asistente IA Gemini. Input de mensaje + contexto (ticker, precio). Historial de burbujas, estados (idle/processing/success/error), degradación con banner rojo y botón Reintentar si el servicio no está disponible.',
    location: 'projects/pwa/inversions_app/src/pages/ai/AIChatPage.tsx',
    fic: 'AI chat page with message history, context inputs, polling, and graceful degradation banner.',
  },
  'ChatHistory.tsx': {
    purpose: 'Componente que renderiza el historial de mensajes del chat IA. Burbujas de usuario (azul) y asistente (gris) con roles y timestamps.',
    location: 'projects/pwa/inversions_app/src/components/ai/ChatHistory.tsx',
    fic: 'Chat history component with user/assistant message bubbles and timestamps.',
  },
  'ScenarioAnalysisCards.tsx': {
    purpose: 'Componente que renderiza tarjetas de análisis de escenarios a partir de la respuesta markdown de Gemini. Interpreta y presenta visualmente los escenarios alcista, bajista y neutral.',
    location: 'projects/pwa/inversions_app/src/components/ai/ScenarioAnalysisCards.tsx',
    fic: 'Scenario analysis cards component rendering Gemini markdown response as visual cards.',
  },
  'PayoffChart.tsx': {
    purpose: 'Gráfico de payoff usando Recharts. Línea de P&L vs precio, punto de break-even marcado, colores verde (ganancia) y rojo (pérdida). Responsive y animado.',
    location: 'projects/pwa/inversions_app/src/components/coverage/PayoffChart.tsx',
    fic: 'Payoff chart using Recharts with break-even marker, color-coded P&L, and responsive animation.',
  },
  'aiChatApi.ts': {
    purpose: 'Servicio de llamadas API para el chat IA. sendMessage() → POST /api/ai/institutional-chat (retorna responseId + pollingUrl), pollResponse() → GET /api/ai/institutional-chat/poll/{responseId}.',
    location: 'projects/pwa/inversions_app/src/services/ai/aiChatApi.ts',
    fic: 'AI chat API service with sendMessage and pollResponse functions for async Gemini integration.',
  },
  'coverageApi.ts': {
    purpose: 'Servicio de llamada API para simulación de coberturas. analyzeCoverage() → POST /api/coverage/analyze con body: { ticker, underlyingPrice, shares, strikes, capital, riskTolerancePct }.',
    location: 'projects/pwa/inversions_app/src/services/coverage/coverageApi.ts',
    fic: 'Coverage API service with analyzeCoverage function calling POST /api/coverage/analyze.',
  },
  'institutionalApi.ts': {
    purpose: 'Servicio de llamadas API para datos institucionales. getInstitutionalAnalysis() → GET /api/institutional/analysis, getRegulatoryPositions() → GET /api/institutional/positions.',
    location: 'projects/pwa/inversions_app/src/services/institutional/institutionalApi.ts',
    fic: 'Institutional API service with getInstitutionalAnalysis and getRegulatoryPositions functions.',
  },
  'signalApi.ts': {
    purpose: 'Servicio placeholder para señales de trading (futuro). getSignals() → GET /api/signals. Actualmente preparado para integraciones futuras.',
    location: 'projects/pwa/inversions_app/src/services/signals/signalApi.ts',
    fic: 'Signal API placeholder for future trading signal integration.',
  },
  'chat.ts': {
    purpose: 'Estado global del chat IA usando Zustand. messages[], status (idle/processing/success/error), sendMessage() con polling automático, clearChat().',
    location: 'projects/pwa/inversions_app/src/store/chat.ts',
    fic: 'Zustand store for AI chat state management with messages, status, and polling logic.',
  },
  'signals.ts': {
    purpose: 'Estado global de señales de trading usando Zustand. signals[], fetchSignals(). Actualmente es placeholder.',
    location: 'projects/pwa/inversions_app/src/store/signals.ts',
    fic: 'Zustand store for trading signals state (placeholder for future integration).',
  },
  
  // === SCRIPTS ===
  'validate-contract-compat.sh': {
    purpose: 'Script bash que valida la compatibilidad entre contratos TypeScript. Verifica que los tipos definidos en los contratos sean consistentes y no tengan breaking changes.',
    location: 'scripts/validate-contract-compat.sh — ejecutado como parte del pipeline CI',
    fic: 'T206: Contract Compatibility Validator — bash script that validates TypeScript contract consistency across modules.',
  },
};

// ─── Main logic ───────────────────────────────────────────────
function addComments(filePath) {
  const filename = path.basename(filePath);
  let content = fs.readFileSync(filePath, 'utf-8');
  const ext = path.extname(filePath);
  
  const knowledge = FILE_KNOWLEDGE[filename];
  if (!knowledge) {
    console.log(`   ⏭️  Saltando ${filename} (sin metadata en knowledge base)`);
    return false;
  }
  
  let modified = false;
  
  // Skip if file already has a JSDoc comment block at the start
  const hasExistingHeader = content.startsWith('/**');
  if (!hasExistingHeader) {
    // Add file header
    const header = FILE_HEADER_TEMPLATE
      .replace('{filename}', filename)
      .replace('{purpose}', knowledge.purpose)
      .replace('{location}', knowledge.location)
      .replace('{fic}', knowledge.fic);
    
    content = header + '\n' + content;
    modified = true;
    console.log(`   ✅ ${filename}: comentario de cabecera añadido`);
  } else {
    console.log(`   ⏭️  ${filename}: ya tiene cabecera JSDoc`);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
  
  return modified;
}

// ─── Runner ───────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Uso: node scripts/add-jsdoc-comments.mjs <file-patterns...>');
    console.log('Ejemplo: node scripts/add-jsdoc-comments.mjs "src/**/*.ts"');
    process.exit(1);
  }
  
  // Collect files
  const glob = require('glob');
  const files = [];
  for (const pattern of args) {
    const matched = glob.sync(pattern);
    files.push(...matched);
  }
  
  if (files.length === 0) {
    console.log('❌ No se encontraron archivos');
    process.exit(1);
  }
  
  console.log(`📁 Procesando ${files.length} archivos...\n`);
  
  let count = 0;
  for (const file of files) {
    const changed = addComments(file);
    if (changed) count++;
  }
  
  console.log(`\n✅ ${count}/${files.length} archivos comentados exitosamente`);
}

main();
