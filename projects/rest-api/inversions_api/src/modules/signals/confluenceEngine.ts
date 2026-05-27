import type { SourceConfig } from "./sourceConfig.js";

export type SignalDirection = "BUY" | "SELL" | "HOLD";

export interface SourceVerdict {
  sourceId: string;
  verdict: SignalDirection;
  confidence: number;
  rationale: string;
}

export interface ConfluenceResult {
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
}

export interface DashboardSignalCard {
  signalId: string;
  instrument: string;
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  activeCores: string[];
  updatedAt: string;
  evidence: SourceVerdict[];
  metadata: {
    timing_d: string;
    timing_h: string;
    pre_senal: string;
    senal_real_activada: boolean;
    stop: number;
    objetivo: number;
    divergencia: string;
    z_extrema: number;
    cantidad_sugerida: number;
    vencimiento: string;
    precio_ejercicio: number;
    tipo_opcion: "call" | "put";
    duracion: number;
    bid: number;
    ask: number;
    zona_apertura: string;
    zona_cierre: string;
    stoploss_sugerido: number;
    alerta_configurada: boolean;
    referencia_maximos: number;
    referencia_minimos: number;
    variantes_ataque: string;
    recolocacion_stoploss: string;
    liquidez: string;
    riesgo: string;
    retorno_maximo: number;
    perdida_maxima: number;
  };
}

export interface DashboardConfluencePayload {
  generatedAt: string;
  instruments: string[];
  cards: DashboardSignalCard[];
}

function buildOperationalMetadata(index: number, direction: SignalDirection): DashboardSignalCard["metadata"] {
  const bullish = direction !== "SELL";

  return {
    timing_d: bullish ? "bullish" : "bearish",
    timing_h: index % 2 === 0 ? "confirm" : "watch",
    pre_senal: bullish ? "alcista" : "bajista",
    senal_real_activada: index % 3 === 0,
    stop: Number((96 + index * 0.3).toFixed(2)),
    objetivo: Number((107 + index * 0.4).toFixed(2)),
    divergencia: index % 4 === 0 ? "RSI" : "none",
    z_extrema: Number((1.1 + index * 0.05).toFixed(2)),
    cantidad_sugerida: 1 + (index % 4),
    vencimiento: new Date(Date.now() + (index + 10) * 86_400_000).toISOString(),
    precio_ejercicio: Number((100 + index).toFixed(2)),
    tipo_opcion: bullish ? "call" : "put",
    duracion: 3 + (index % 10),
    bid: Number((99.5 + index * 0.25).toFixed(2)),
    ask: Number((100 + index * 0.25).toFixed(2)),
    zona_apertura: "100-101",
    zona_cierre: "104-105",
    stoploss_sugerido: Number((97 + index * 0.2).toFixed(2)),
    alerta_configurada: index % 2 === 0,
    referencia_maximos: Number((112 + index * 0.4).toFixed(2)),
    referencia_minimos: Number((91 - index * 0.2).toFixed(2)),
    variantes_ataque: "breakout/retest",
    recolocacion_stoploss: "trail 1R",
    liquidez: index % 2 === 0 ? "alta" : "media",
    riesgo: bullish ? "bajo" : "medio",
    retorno_maximo: Number((8 + index * 0.3).toFixed(2)),
    perdida_maxima: Number((3 + index * 0.15).toFixed(2))
  };
}

const verdictWeights: Record<SignalDirection, number> = {
  BUY: 1,
  HOLD: 0,
  SELL: -1
};

export function evaluateConfluence(sources: SourceConfig[], verdicts: SourceVerdict[]): ConfluenceResult {
  const activeWeights = new Map(sources.filter((source) => source.enabled).map((source) => [source.id, source.weight]));

  let weightedScore = 0;
  let totalWeight = 0;

  for (const verdict of verdicts) {
    const weight = activeWeights.get(verdict.sourceId) ?? 0;
    weightedScore += verdictWeights[verdict.verdict] * weight * verdict.confidence;
    totalWeight += weight;
  }

  if (totalWeight === 0) {
    return { signal: "HOLD", confidence: 0, confluenceScore: 0 };
  }

  const normalized = weightedScore / totalWeight;
  const confidence = Math.min(1, Math.abs(normalized));
  const signal: SignalDirection = normalized > 0.15 ? "BUY" : normalized < -0.15 ? "SELL" : "HOLD";

  return {
    signal,
    confidence,
    confluenceScore: Math.round((normalized + 1) * 50)
  };
}

function resolveRiskLevel(confidence: number, confluenceScore: number): "LOW" | "MEDIUM" | "HIGH" {
  if (confidence >= 0.75 && confluenceScore >= 70) {
    return "LOW";
  }

  if (confidence >= 0.45 && confluenceScore >= 45) {
    return "MEDIUM";
  }

  return "HIGH";
}

/**
 * FIC: Build dashboard payload from confluence inputs for instrument-level monitoring.
 * Produces a deterministic response schema for the dashboard orchestrator route.
 *
 * FIC: Construye payload del dashboard desde entradas de confluencia para monitoreo por instrumento.
 * Produce un esquema de respuesta determinístico para la ruta orquestadora del dashboard.
 */
export function buildDashboardConfluencePayload(
  sources: SourceConfig[],
  input: Array<{ instrument: string; verdicts: SourceVerdict[] }>
): DashboardConfluencePayload {
  const cards = input.map((item, index) => {
    const confluence = evaluateConfluence(sources, item.verdicts);

    return {
      signalId: `sig-${index + 1}`,
      instrument: item.instrument,
      signal: confluence.signal,
      confidence: confluence.confidence,
      confluenceScore: confluence.confluenceScore,
      riskLevel: resolveRiskLevel(confluence.confidence, confluence.confluenceScore),
      activeCores: sources.filter((source) => source.enabled).map((source) => source.name),
      updatedAt: new Date().toISOString(),
      evidence: item.verdicts,
      metadata: buildOperationalMetadata(index, confluence.signal)
    } satisfies DashboardSignalCard;
  });

  return {
    generatedAt: new Date().toISOString(),
    instruments: cards.map((card) => card.instrument),
    cards
  };
}

