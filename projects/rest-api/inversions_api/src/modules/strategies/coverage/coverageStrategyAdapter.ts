import crypto from "node:crypto";
import {
  ConfidenceLevel,
  RecommendationType,
  StrategySource,
  createStrategyOutput,
  type EvidenceMetadata,
  type ScoreBreakdown,
  type StrategyOutput,
} from "../standards/strategyOutputStandard.js";
import type { CoverageStrategyResult } from "./coverageTypes.js";

function kindToRecommendationType(kind: string): RecommendationType {
  switch (kind) {
    case "protective_put":
    case "married_put":
    case "collar_put":
    case "covered_straddle":
      return RecommendationType.COBERTURAS;
    default:
      return RecommendationType.MANTENER;
  }
}

function buildEvidence(result: CoverageStrategyResult): EvidenceMetadata[] {
  const evidence: EvidenceMetadata[] = [];

  for (const alert of result.alerts) {
    evidence.push({
      tipo: alert.code,
      datos: {
        severity: alert.severity,
        message: alert.message,
        recommendation: alert.recommendation,
        triggerPrice: alert.triggerPrice,
        triggerPct: alert.triggerPct,
      },
      fuente: result.engineId,
      capturada_en: new Date(result.generatedAt),
      confianza: alert.severity === "critical" ? 0.9 : alert.severity === "warning" ? 0.7 : 0.5,
    });
  }

  evidence.push({
    tipo: "payoff_simulation",
    datos: {
      baselinePrice: result.payoff.baselinePrice,
      breakevenPrice: result.payoff.breakevenPrice,
      maxProfit: result.payoff.maxProfit,
      maxLoss: result.payoff.maxLoss,
      pointCount: result.payoff.points.length,
    },
    fuente: result.engineId,
    capturada_en: new Date(result.generatedAt),
    confianza: 1,
  });

  return evidence;
}

function buildScoreBreakdown(result: CoverageStrategyResult): ScoreBreakdown {
  const rm = result.riskMetrics;
  const protectionScore = Math.min(1, rm.maxProtection / (result.currentPrice * result.shares) / 0.5);
  const costEfficiencyScore = Math.min(1, Math.max(0, 1 - rm.costBenefitRatio / 0.5));
  const riskScore = rm.riskProfile === "limited" ? 0.8 : 0.3;

  return {
    total: Math.round((protectionScore * 0.4 + costEfficiencyScore * 0.3 + riskScore * 0.3) * 1000) / 1000,
    componentes: {
      [StrategySource.TECNICO]: 0,
      [StrategySource.FUNDAMENTAL]: 0,
      [StrategySource.CONFLUENCE]: 0,
      [StrategySource.MECANICO]: protectionScore,
      [StrategySource.MACHINE_LEARNING]: 0,
    },
    razon: `${result.strategyKind}: protection=$${rm.maxProtection}, costBenefit=${rm.costBenefitRatio}, risk=${rm.riskProfile}`,
    num_estrategias_coincidentes: 1,
    num_estrategias_conflictivas: 0,
  };
}

function confidenceFromScore(score: number): ConfidenceLevel {
  if (score >= 0.7) return ConfidenceLevel.ALTA;
  if (score >= 0.4) return ConfidenceLevel.MEDIA;
  return ConfidenceLevel.BAJA;
}

export function coverageResultToStrategyOutput(result: CoverageStrategyResult, traceId?: string): StrategyOutput {
  const breakdown = buildScoreBreakdown(result);
  const evidence = buildEvidence(result);

  return createStrategyOutput(
    StrategySource.MECANICO,
    result.ticker,
    kindToRecommendationType(result.strategyKind),
    breakdown.total,
    confidenceFromScore(breakdown.total),
    breakdown,
    evidence,
    traceId ?? `trace-${crypto.randomUUID()}`,
  );
}
