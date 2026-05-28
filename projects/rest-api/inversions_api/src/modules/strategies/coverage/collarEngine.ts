/**
 * ============================================================================
 * collarEngine.ts
 * ============================================================================
 *
 * FIC: T115: Collar Engine — computes capped payoff, net premium (debit/credit), risk metrics, and alerts for collar strategies (long put + short call).
 */

import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";
import {
  clamp01,
  createCoverageStrategyResult,
  round,
  type Alert,
  type CoverageStrategyResult,
  type PayoffPoint
} from "./coverageTypes.js";

export interface CollarEngineOptions {
  stopLossBufferPct?: number;
}

export class CollarEngine {
  private readonly stopLossBufferPct: number;

  constructor(options: CollarEngineOptions = {}) {
    // stopLossBufferPct = 4%. Ligeramente mayor que en protective put (3%)
    // porque el collar tiene DOS bandas (put y call) que requieren más
    // margen antes de activar alertas. 4% evita falsos positivos en ambas
    // direcciones.
    this.stopLossBufferPct = options.stopLossBufferPct ?? 0.04;
  }

  analyze(request: CoverageStrategyContract): CoverageStrategyResult {
    const strategy = createCoverageStrategyContract(request);
    this.assertSupportedKind(strategy);

    const currentPrice = this.resolveCurrentPrice(strategy);
    const putLeg = this.findLeg(strategy, "put", "long");
    const callLeg = this.findLeg(strategy, "call", "short");
    const netPremiumPerShare = this.calculateNetPremiumPerShare(strategy);
    const protectionFloorPrice = putLeg.strike - netPremiumPerShare;
    const protectionCeilingPrice = callLeg.strike - netPremiumPerShare;
    const downsideRisk = Math.max(0, currentPrice - protectionFloorPrice);
    const upsideCap = Math.max(0, protectionCeilingPrice - currentPrice);
    const stopLossLow = putLeg.strike * (1 - this.stopLossBufferPct);
    const stopLossHigh = callLeg.strike * (1 + this.stopLossBufferPct);

    const payoff = this.buildPayoffSimulation(strategy, currentPrice, putLeg.strike, callLeg.strike, netPremiumPerShare);
    const riskMetrics = {
      riskProfile: "limited" as const,
      maxProtection: round(Math.max(0, currentPrice - protectionFloorPrice) * strategy.shares, 2),
      protectionFloorPrice: round(protectionFloorPrice, 2),
      protectionCeilingPrice: round(protectionCeilingPrice, 2),
      netPremium: round(netPremiumPerShare * strategy.shares, 2),
      netPremiumPerShare: round(netPremiumPerShare, 4),
      costBenefitRatio: round(this.calculateCostBenefit(putLeg.strike, callLeg.strike, netPremiumPerShare), 4),
      downsideRisk: round(downsideRisk * strategy.shares, 2),
      upsideCap: round(upsideCap * strategy.shares, 2),
      breakEvenPrice: round(currentPrice + netPremiumPerShare, 2),
      stopLossPrice: round(stopLossLow, 2),
      stopLossLowPrice: round(stopLossLow, 2),
      stopLossHighPrice: round(stopLossHigh, 2),
      marginRequirement: round(strategy.capital * 0.08, 2),
      exerciseRiskScore: round(this.calculateExerciseRisk(currentPrice, putLeg.strike, callLeg.strike), 4),
      volatilityStressLoss: round(this.calculateVolatilityStress(strategy, currentPrice, putLeg.strike, callLeg.strike, netPremiumPerShare), 2)
    };

    const alerts = this.buildAlerts(strategy, currentPrice, putLeg.strike, callLeg.strike, riskMetrics.exerciseRiskScore);

    return createCoverageStrategyResult({
      engineId: "collar_engine",
      strategy,
      strategyKind: strategy.kind,
      ticker: strategy.ticker,
      shares: strategy.shares,
      currentPrice,
      payoff,
      riskMetrics,
      alerts,
      generatedAt: new Date().toISOString()
    });
  }

  private assertSupportedKind(strategy: CoverageStrategyContract): void {
    if (strategy.kind !== "collar_put") {
      throw new Error(`CollarEngine does not support ${strategy.kind}.`);
    }
  }

  private findLeg(strategy: CoverageStrategyContract, type: "call" | "put", side: "long" | "short") {
    const leg = strategy.legs.find((item) => item.type === type && item.side === side);
    if (!leg) {
      throw new Error(`CollarEngine requires a ${side} ${type} leg.`);
    }

    return leg;
  }

  private resolveCurrentPrice(strategy: CoverageStrategyContract): number {
    if (strategy.underlyingPrice !== undefined) {
      return strategy.underlyingPrice;
    }

    const strikes = strategy.legs.map((leg) => leg.strike);
    return Math.max(1, strikes.reduce((sum, value) => sum + value, 0) / strikes.length);
  }

  private calculateNetPremiumPerShare(strategy: CoverageStrategyContract): number {
    return strategy.legs.reduce((sum, leg) => {
      const signedPremium = leg.side === "long" ? leg.premium : -leg.premium;
      return sum + signedPremium;
    }, 0);
  }

  private buildPayoffSimulation(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number
  ) {
    const target = strategy.targetMovePct ?? 0.12;
    const moves = [-0.3, -0.2, -0.1, -0.05, 0, 0.05, target, 0.2];
    const points = moves.map((movePct) => this.simulatePoint(strategy, currentPrice, putStrike, callStrike, netPremiumPerShare, movePct));

    return {
      baselinePrice: round(currentPrice, 2),
      breakevenPrice: round(currentPrice + netPremiumPerShare, 2),
      maxProfit: round(Math.max(0, callStrike - currentPrice - netPremiumPerShare) * strategy.shares, 2),
      maxLoss: round(Math.max(0, currentPrice - (putStrike - netPremiumPerShare)) * strategy.shares, 2),
      description: "Rango acotado por put largo y call corto con costo neto reducido o credito.",
      points
    };
  }

  private simulatePoint(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number,
    movePct: number
  ): PayoffPoint {
    const scenarioPrice = Math.max(0.01, currentPrice * (1 + movePct));
    const stockPnL = (scenarioPrice - currentPrice) * strategy.shares;
    const longPutPnL = Math.max(0, putStrike - scenarioPrice) * strategy.shares;
    const shortCallPnL = -Math.max(0, scenarioPrice - callStrike) * strategy.shares;
    const optionCost = netPremiumPerShare * strategy.shares;
    const pnl = stockPnL + longPutPnL + shortCallPnL - optionCost;

    return {
      label: `${round(movePct * 100, 1)}%`,
      movePct: round(movePct, 4),
      underlyingPrice: round(scenarioPrice, 2),
      pnl: round(pnl, 2),
      pnlPct: round((pnl / Math.max(1, strategy.capital)) * 100, 2),
      notes: [movePct < 0 ? "downside_buffer" : "upside_cap"]
    };
  }

  private calculateCostBenefit(putStrike: number, callStrike: number, netPremiumPerShare: number): number {
    const rangeWidth = Math.max(0.01, callStrike - putStrike);
    return rangeWidth / Math.max(0.01, Math.abs(netPremiumPerShare));
  }

  /**
   * Calcula el riesgo de ejercicio anticipado para un collar.
   *
   * POR QUÉ COMBINA DOWNSIDE + UPSIDE: En un collar, ambas patas pueden
   * ser ejercidas anticipadamente:
   * - Si el precio cae muy por debajo del put strike → riesgo de ejercicio
   *   del put (asignación de acciones).
   * - Si el precio sube muy por encima del call strike → riesgo de
   *   asignación de la call corta (te quitan las acciones).
   *
   * Cada lado contribuye hasta 0.5 (50%) al score total, lo que significa
   * que si solo un lado está estresado, el score máximo es 0.5. Si ambos
   * lados están estresados, el score llega a 1.0 sin necesidad de clamp.
   */
  private calculateExerciseRisk(currentPrice: number, putStrike: number, callStrike: number): number {
    const downside = Math.max(0, putStrike - currentPrice) / Math.max(1, putStrike);
    const upside = Math.max(0, currentPrice - callStrike) / Math.max(1, callStrike);
    return clamp01(downside * 0.5 + upside * 0.5);
  }

  private calculateVolatilityStress(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number
  ): number {
    const stressDown = currentPrice * 0.78;
    const stressUp = currentPrice * 1.24;
    const downsidePnL = (stressDown - currentPrice) * strategy.shares + Math.max(0, putStrike - stressDown) * strategy.shares - netPremiumPerShare * strategy.shares;
    const upsidePnL = (stressUp - currentPrice) * strategy.shares - Math.max(0, stressUp - callStrike) * strategy.shares - netPremiumPerShare * strategy.shares;
    return Math.max(Math.abs(downsidePnL), Math.abs(upsidePnL));
  }

  private buildAlerts(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    exerciseRiskScore: number
  ): Alert[] {
    const alerts: Alert[] = [];
    const lowTrigger = putStrike * (1 - this.stopLossBufferPct);
    const highTrigger = callStrike * (1 + this.stopLossBufferPct);

    if (callStrike <= currentPrice) {
      alerts.push({
        code: "COLLAR_CALL_BELOW_MARKET",
        severity: "warning",
        message: "El strike del call short esta por debajo del precio actual, lo que genera un collar invertido. Verificar configuracion.",
        recommendation: "Aumentar el strike del call short por encima del precio actual o seleccionar un put con mayor prima.",
        triggerPrice: callStrike
      });
    }

    if (currentPrice <= lowTrigger) {
      alerts.push({
        code: "COLLAR_LOWER_BAND_BROKEN",
        severity: "critical",
        message: "El collar rompio el piso de proteccion.",
        recommendation: "Cerrar o reenrollar la pata de put para restaurar el rango.",
        triggerPrice: lowTrigger
      });
    }

    if (currentPrice >= highTrigger) {
      alerts.push({
        code: "COLLAR_UPPER_BAND_BROKEN",
        severity: "warning",
        message: "El collar alcanzo o supero el techo de ganancia.",
        recommendation: "Considerar take-profit o roll de la call corta.",
        triggerPrice: highTrigger
      });
    }

    if (exerciseRiskScore >= 0.55) {
      alerts.push({
        code: "COLLAR_RANGE_STRESS",
        severity: "warning",
        message: "El rango del collar muestra tension elevada en una o ambas bandas.",
        recommendation: "Revisar strike selection, costo neto y distancia al borde del rango.",
        triggerPct: exerciseRiskScore
      });
    }

    if (strategy.targetMovePct !== undefined) {
      alerts.push({
        code: "COLLAR_TARGET_MOVE",
        severity: "info",
        message: "Se aplico un objetivo de movimiento a la simulacion de collar.",
        recommendation: "Usar el rango objetivo para calibrar el nivel de cobertura."
      });
    }

    return alerts;
  }
}
