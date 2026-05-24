import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import {
  buildDashboardConfluencePayload,
  type SourceVerdict
} from "../../modules/signals/confluenceEngine.js";
import { sourceConfigRegistry } from "../../modules/signals/sourceConfig.js";

interface DashboardQuery {
  instruments?: string;
  timeframe?: string;
}

function buildFallbackSources() {
  return [
    { id: "technical", name: "technical", category: "TECHNICAL" as const, enabled: true, weight: 0.3 },
    { id: "options", name: "options", category: "OPTIONS" as const, enabled: true, weight: 0.25 },
    { id: "flow", name: "flow", category: "FLOW" as const, enabled: true, weight: 0.2 },
    { id: "news", name: "news", category: "NEWS" as const, enabled: true, weight: 0.15 },
    { id: "ai", name: "ai", category: "AI" as const, enabled: true, weight: 0.1 }
  ];
}

function buildMockVerdicts(instrument: string): SourceVerdict[] {
  const seed = instrument.length;

  return [
    {
      sourceId: "technical",
      verdict: seed % 3 === 0 ? "SELL" : "BUY",
      confidence: 0.55,
      rationale: `RSI/MACD con sesgo ${seed % 3 === 0 ? "bajista" : "alcista"}`
    },
    {
      sourceId: "options",
      verdict: "BUY",
      confidence: 0.63,
      rationale: "Call/put skew positivo"
    },
    {
      sourceId: "flow",
      verdict: seed % 2 === 0 ? "BUY" : "HOLD",
      confidence: 0.58,
      rationale: "Flujo institucional en rango favorable"
    },
    {
      sourceId: "news",
      verdict: "HOLD",
      confidence: 0.41,
      rationale: "Sentimiento mixto"
    },
    {
      sourceId: "ai",
      verdict: "BUY",
      confidence: 0.72,
      rationale: "Confirmacion de modelo IA"
    }
  ];
}

export const dashboardOrchestratorRouter = Router();

/**
 * FIC: Consolidated dashboard endpoint for operational confluence monitoring.
 * Returns instrument-filtered cards with confidence and explainability payload.
 *
 * FIC: Endpoint consolidado del dashboard para monitoreo operativo de confluencia.
 * Devuelve tarjetas filtradas por instrumento con payload de confianza y explicabilidad.
 */
dashboardOrchestratorRouter.get("/orchestrator", authContextMiddleware, (req, res) => {
  const { instruments, timeframe } = req.query as DashboardQuery;

  const parsedInstruments = (instruments ?? "AAPL,MSFT,NVDA,SPY")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 20);

  const sources = sourceConfigRegistry.listEnabled();
  const activeSources = sources.length > 0 ? sources : buildFallbackSources();

  const payload = buildDashboardConfluencePayload(
    activeSources,
    parsedInstruments.map((instrument) => ({
      instrument,
      verdicts: buildMockVerdicts(instrument)
    }))
  );

  res.status(200).json({
    timeframe: timeframe ?? "1d",
    ...payload
  });
});
