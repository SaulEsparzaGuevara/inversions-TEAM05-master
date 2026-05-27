#!/usr/bin/env node
/**
 * Script simplificado que añade cabeceras JSDoc a archivos TypeScript/TSX.
 * Solo añade comentarios al inicio del archivo si no tiene uno.
 * NO modifica ninguna línea de código existente.
 * 
 * Uso: node scripts/add-jsdoc.mjs <file1> <file2> ...
 */

import fs from 'fs';
import path from 'path';

const FILE_KNOWLEDGE = {
  // === BACKEND - INSTITUTIONAL ===
  'institutionalContract.ts': 'T106: Institutional analysis contract — Zod-validated request/response types for institutional analysis, source observations, zones, trends, and multi-source degradation.',
  'institutionalDataService.ts': 'T107: Institutional Data Service — orchestrates 4 real sources (SEC, FINRA, Yahoo Options, Yahoo Inst) with caching, rate limiting, parallel resolution, and graceful degradation (overallStatus).',
  'institutionalZonesEngine.ts': 'T108: Institutional Zones Engine — detects support/resistance zones from synthetic sinusoidal candles with volume-weighted clustering and multi-source confidence scoring.',
  'institutionalTrendEngine.ts': 'T108b: Institutional Trend Engine — computes bull/bear/neutral trend combining EMA crossover, RSI, institutional flows, zone strength, and options expiration analysis.',
  'expirationAnalysisEngine.ts': 'T108c: Expiration Analysis Engine — computes put/call ratio, max pain, gamma exposure, and implied S/R levels from options chain data.',
  'yahooOptionsParser.ts': 'T338: Yahoo Options Parser — fetches v7 options chain API with crumb auth, detects unusual volume signals (>2x OI), computes put/call ratio, synthetic fallback at confidence 0.3.',
  'yahooInstitutionalParser.ts': 'T339: Yahoo Institutional Parser — fetches v10 quoteSummary institutionOwnership API with crumb auth, extracts holders, breakdown, net flows, synthetic fallback.',
  'realSourceParsers.ts': 'T107b: Real Source Parsers — SEC EDGAR 13F (EFTS + XML) and FINRA Short Interest (REST) parsing with CUSIP mapping and cache preloading.',
  
  // === BACKEND - ROUTES ===
  'bootstrap.ts': 'T340: Bootstrap — singleton factory creating InstitutionalDataService with 4 real sources, zones/trend/expiration engines, and source configs (priorities, rate-limits, TTLs).',
  'institutionalAnalysis.ts': 'T111: Institutional Analysis Route — GET /api/institutional/analysis returning zones, trends, metrics, catalyst windows and per-source sourceReports.',
  'regulatoryPositions.ts': 'T112: Regulatory Positions Route — GET /api/institutional/positions returning 13F data, institutional flows, holdings and sourceReports.',
  'institutionalCopilotChat.ts': 'T121: Institutional Copilot Chat — Gemini 2.5 Flash integration with contextual system prompt, async polling, and graceful degradation.',
  'institutionalCopilot.ts': 'T121b: Institutional Copilot Route — POST /api/ai/institutional-chat and GET /poll/:id with Zod validation and async polling.',

  // === BACKEND - COVERAGE ===
  'coverageTypes.ts': 'T113/T120: Coverage types — Zod schemas and TypeScript types for coverage strategies, simulation, risk, report, and comparison results.',
  'coverageStrategyContract.ts': 'T113: Coverage Strategy Contract — CoverageStrategyEngine interface with analyze() method implemented by all engines.',
  'coverageStrategyAdapter.ts': 'T173: Coverage Strategy Adapter — transforms engine results into standard StrategyOutput format.',
  'protectivePutEngine.ts': 'T114/T114b: Protective Put and Married Put Engines — computes payoff (simplified BS), risk metrics, and alerts for put-protected long positions.',
  'collarEngine.ts': 'T115: Collar Engine — computes capped payoff, net premium (debit/credit), risk metrics, and alerts for collar strategies (long put + short call).',
  'coveredStraddleEngine.ts': 'T116: Covered Straddle Engine — computes unlimited-risk payoff, margin metrics, and stress alerts for straddle on owned shares.',
  'coverageSimulationEngine.ts': 'T117: Coverage Simulation Engine — Monte Carlo (10K iterations) and backtest with deterministic scenarios, VaR, Expected Shortfall.',
  'coverageRiskService.ts': 'T118: Coverage Risk Service — evaluates stop-loss, margin stress, generates recommendations and notifications.',
  'coverageReportService.ts': 'T119: Coverage Report Service — combines strategy result, simulation, risk into reports with winRate, R/R ratio.',
  'coverageComparator.ts': 'T120: Coverage Comparator — ranks 4 strategies (protective put, married put, collar, covered straddle) by composite score and recommends best.',
  'strategyOutputStandard.ts': 'T173: Strategy Output Standard — cross-module standard format for strategy outputs with unified payoff, risk metrics, and alerts.',
  
  // === BACKEND - RESILIENCE ===
  'retryWithBackoff.ts': 'T208: Retry with Backoff — exponential backoff retry utility with jitter (max 5 attempts, 10s cap).',
  'staleInput.ts': 'T208: Stale Input Detection — checks if data timestamp exceeds threshold (default 1 day), triggers onStale callback.',
  'partialDataHandler.ts': 'T208: Partial Data Handler — merges partial objects with full defaults, replacing null/undefined.',
  
  // === BACKEND - JOBS, OBSERVABILITY, TOOLS, DB ===
  'purgeEvidenceJob.ts': 'T202: Purge Evidence Job — scheduled task to purge analysis evidence older than 90 days.',
  'coverageMetrics.ts': 'T203: Coverage Metrics — telemetry for coverage module: trackAnalysis, trackComparison, getMetrics.',
  'reconstruct_explanation.ts': 'T205: Reconstruct Explanation — audit tool generating detailed textual explanations of coverage strategy results.',
  '008_institutional_copilot.sql': 'T201: Copilot DB Migration — SQL migration creating chat_sessions and chat_messages tables with RLS policies.',
  'index.ts': 'Entry point — Express app with JSON/CORS/auth middleware, institutional/coverage/AI routers, FINRA cache preload.',
  'validate-contract-compat.sh': 'T206: Contract Compatibility Validator — bash script validating TypeScript contract consistency across modules.',
  
  // === FRONTEND ===
  'main.tsx': 'React entry point with React Router v7, 4 routes, and MainLayout wrapper.',
  'MainLayout.tsx': 'Main layout with responsive sidebar navigation linking to Dashboard + 4 pages.',
  'InstitutionalAnalysisPage.tsx': 'Institutional analysis page — S/R zones table, trend card, metrics, catalyst windows, source reports.',
  'RegulatoryPositionsPage.tsx': 'Regulatory positions page — 13F table, institutional flow cards, holdings %, source reports with cache indicator.',
  'CoverageStrategiesPage.tsx': 'Coverage simulation page — 4 strategy cards with Recharts payoff chart, metrics, alerts, ranked recommendations.',
  'AIChatPage.tsx': 'AI chat page — message history bubbles, context inputs (ticker/price), polling states, degradation banner.',
  'ChatHistory.tsx': 'Chat history component — user/assistant message bubbles with roles and timestamps.',
  'ScenarioAnalysisCards.tsx': 'Scenario analysis cards — renders Gemini markdown response as visual cards.',
  'PayoffChart.tsx': 'Payoff chart using Recharts — P&L line, break-even marker, color-coded (green=profit, red=loss).',
  'aiChatApi.ts': 'AI chat API service — sendMessage (POST) and pollResponse (GET) for async Gemini integration.',
  'coverageApi.ts': 'Coverage API service — analyzeCoverage POST /api/coverage/analyze.',
  'institutionalApi.ts': 'Institutional API service — getInstitutionalAnalysis and getRegulatoryPositions GET functions.',
  'signalApi.ts': 'Signal API placeholder — getSignals GET /api/signals for future trading signal integration.',
  'chat.ts': 'Zustand store for AI chat — messages[], status (idle/processing/success/error), sendMessage with polling.',
  'signals.ts': 'Zustand store for trading signals — signals[], fetchSignals() placeholder.',
};

for (const filePath of process.argv.slice(2)) {
  const filename = path.basename(filePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ No encontrado: ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Skip if already has a JSDoc block at start
  if (content.trimStart().startsWith('/**')) {
    console.log(`   ⏭️  ${filename} — ya tiene cabecera JSDoc`);
    continue;
  }
  
  const fic = FILE_KNOWLEDGE[filename];
  if (!fic) {
    console.log(`   ⏭️  ${filename} — sin metadata en knowledge base`);
    continue;
  }
  
  const header = `/**\n * ============================================================================\n * ${filename}\n * ============================================================================\n *\n * FIC: ${fic}\n */\n\n`;
  content = header + content;
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`   ✅ ${filename} — cabecera JSDoc añadida`);
}
