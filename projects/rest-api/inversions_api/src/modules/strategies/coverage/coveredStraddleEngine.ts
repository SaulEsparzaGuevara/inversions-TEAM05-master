import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";
import {
  clamp01,
  createCoverageStrategyResult,
  round,
  toContractScale,
  type Alert,
  type CoverageStrategyResult,
  type PayoffPoint
} from "./coverageTypes.js";

export interface CoveredStraddleEngineOptions {
  criticalMovePct?: number;
}

export class CoveredStraddleEngine {
  private readonly criticalMovePct: number;

  constructor(options: CoveredStraddleEngineOptions = {}) {
    this.criticalMovePct = options.criticalMovePct ?? 0.18;
  }

  analyze(request: CoverageStrategyContract): CoverageStrategyResult {
    const strategy = createCoverageStrategyContract(request);
    this.assertSupportedKind(strategy);

    const currentPrice = this.resolveCurrentPrice(strategy);
    const shortPut = this.findLeg(strategy, "put", "short");
    const shortCall = this.findLeg(strategy, "call", "short");
    const contractScale = toContractScale(strategy.shares, strategy.legs[0]?.multiplier);
    const netPremiumPerShare = this.calculateNetPremiumPerShare(strategy);
    const marginRequirement = this.calculateMarginRequirement(strategy, currentPrice, shortPut.strike, shortCall.strike, netPremiumPerShare);
    const maxProfitPerShare = Math.max(0, shortCall.strike - currentPrice + netPremiumPerShare);
    const stopLossPrice = this.deriveCriticalStopPrice(currentPrice, shortPut.strike);

    const payoff = this.buildPayoffSimulation(strategy, currentPrice, shortPut.strike, shortCall.strike, netPremiumPerShare, contractScale);
    const riskMetrics = {
      riskProfile: "unlimited" as const,
      maxProtection: round(Math.max(0, currentPrice - shortPut.strike) * strategy.shares, 2),
      protectionFloorPrice: round(shortPut.strike - netPremiumPerShare, 2),
      protectionCeilingPrice: round(shortCall.strike + netPremiumPerShare, 2),
      netPremium: round(netPremiumPerShare * strategy.shares, 2),
      netPremiumPerShare: round(netPremiumPerShare, 4),
      costBenefitRatio: round(this.calculateCostBenefit(maxProfitPerShare, netPremiumPerShare), 4),
      downsideRisk: round(Math.max(0, currentPrice - shortPut.strike) * strategy.shares, 2),
      upsideCap: round(maxProfitPerShare * strategy.shares, 2),
      breakEvenPrice: round(currentPrice - netPremiumPerShare, 2),
      stopLossPrice,
      marginRequirement: round(marginRequirement, 2),
      exerciseRiskScore: round(this.calculateExerciseRisk(currentPrice, shortPut.strike, shortCall.strike), 4),
      volatilityStressLoss: round(this.calculateVolatilityStress(strategy, currentPrice, shortPut.strike, shortCall.strike, netPremiumPerShare), 2)
    };

    const alerts = this.buildAlerts(strategy, currentPrice, shortPut.strike, shortCall.strike, stopLossPrice, riskMetrics.marginRequirement);

    return createCoverageStrategyResult({
      engineId: "covered_straddle_engine",
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
    if (strategy.kind !== "covered_straddle") {
      throw new Error(`CoveredStraddleEngine does not support ${strategy.kind}.`);
    }
  }

  private findLeg(strategy: CoverageStrategyContract, type: "call" | "put", side: "long" | "short") {
    const leg = strategy.legs.find((item) => item.type === type && item.side === side);
    if (!leg) {
      throw new Error(`CoveredStraddleEngine requires a ${side} ${type} leg.`);
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
      const legScale = toContractScale(strategy.shares, leg.multiplier);
      const signedPremium = leg.side === "long" ? -leg.premium : leg.premium;
      return sum + signedPremium * legScale;
    }, 0) / Math.max(1, strategy.shares);
  }

  private buildPayoffSimulation(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number,
    contractScale: number
  ) {
    const moves = [-0.7, -0.5, -0.35, -0.2, -0.1, 0, 0.1, 0.2, 0.35, 0.5, 0.7];
    const points = moves.map((movePct) => this.simulatePoint(strategy, currentPrice, putStrike, callStrike, netPremiumPerShare, contractScale, movePct));

    return {
      baselinePrice: round(currentPrice, 2),
      breakevenPrice: round(currentPrice - netPremiumPerShare, 2),
      maxProfit: round(Math.max(0, callStrike - currentPrice + netPremiumPerShare) * strategy.shares, 2),
      maxLoss: null,
      description: "Premios por call y put cortas; la volatilidad extrema tensiona margen y riesgo direccional.",
      points
    };
  }

  private simulatePoint(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number,
    contractScale: number,
    movePct: number
  ): PayoffPoint {
    const scenarioPrice = Math.max(0.01, currentPrice * (1 + movePct));
    const stockPnL = (scenarioPrice - currentPrice) * strategy.shares;
    const shortPutPnL = -Math.max(0, putStrike - scenarioPrice) * contractScale;
    const shortCallPnL = -Math.max(0, scenarioPrice - callStrike) * contractScale;
    const premiumIncome = netPremiumPerShare * strategy.shares;
    const pnl = stockPnL + premiumIncome + shortPutPnL + shortCallPnL;

    return {
      label: `${round(movePct * 100, 1)}%`,
      movePct: round(movePct, 4),
      underlyingPrice: round(scenarioPrice, 2),
      pnl: round(pnl, 2),
      pnlPct: round((pnl / Math.max(1, strategy.capital)) * 100, 2),
      notes: [Math.abs(movePct) >= this.criticalMovePct ? "critical_volatility" : "income_capture"]
    };
  }

  private calculateMarginRequirement(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number
  ): number {
    const base = strategy.capital * 0.25;
    const volatilityBuffer = currentPrice * strategy.shares * 0.15;
    const shortExposure = Math.max(putStrike, callStrike) * strategy.shares * 0.2;
    const premiumOffset = Math.max(0, netPremiumPerShare * strategy.shares);
    return Math.max(0, base + volatilityBuffer + shortExposure - premiumOffset);
  }

  private calculateCostBenefit(maxProfitPerShare: number, netPremiumPerShare: number): number {
    return maxProfitPerShare / Math.max(0.01, Math.abs(netPremiumPerShare));
  }

  private calculateExerciseRisk(currentPrice: number, putStrike: number, callStrike: number): number {
    const downsideMove = Math.max(0, putStrike - currentPrice) / Math.max(1, putStrike);
    const upsideMove = Math.max(0, currentPrice - callStrike) / Math.max(1, callStrike);
    return clamp01((downsideMove + upsideMove) * 0.65);
  }

  private calculateVolatilityStress(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    netPremiumPerShare: number
  ): number {
    const stressMoves = [-0.5, 0.5, 0.8];
    return stressMoves.reduce((highest, movePct) => {
      const scenarioPrice = Math.max(0.01, currentPrice * (1 + movePct));
      const stockPnL = (scenarioPrice - currentPrice) * strategy.shares;
      const shortPutPnL = -Math.max(0, putStrike - scenarioPrice) * strategy.shares;
      const shortCallPnL = -Math.max(0, scenarioPrice - callStrike) * strategy.shares;
      const premiumIncome = netPremiumPerShare * strategy.shares;
      const pnl = stockPnL + premiumIncome + shortPutPnL + shortCallPnL;
      return Math.max(highest, Math.abs(pnl));
    }, 0);
  }

  private deriveCriticalStopPrice(currentPrice: number, putStrike: number): number {
    return Math.min(currentPrice * (1 - this.criticalMovePct), putStrike * (1 - 0.02));
  }

  private buildAlerts(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    putStrike: number,
    callStrike: number,
    stopLossPrice: number,
    marginRequirement: number
  ): Alert[] {
    const alerts: Alert[] = [];

    if (currentPrice <= stopLossPrice) {
      alerts.push({
        code: "STRADDLE_STOP_LOSS",
        severity: "critical",
        message: "El precio cruzo el nivel critico de stop-loss del covered straddle.",
        recommendation: "Reducir o cerrar la estructura para limitar la expansion del riesgo.",
        triggerPrice: stopLossPrice
      });
    }

    if (currentPrice <= putStrike * (1 - 0.05) || currentPrice >= callStrike * (1 + 0.05)) {
      alerts.push({
        code: "STRADDLE_RANGE_BREAK",
        severity: "warning",
        message: "La volatilidad saco al subyacente fuera del rango central de la estructura.",
        recommendation: "Rebalancear cobertura y revisar los requerimientos de margen.",
        triggerPct: this.criticalMovePct
      });
    }

    if (marginRequirement > strategy.capital * 0.8) {
      alerts.push({
        code: "MARGIN_STRESS",
        severity: "critical",
        message: "El requerimiento de margen es elevado para el capital asignado.",
        recommendation: "Recortar tamano o ajustar strikes para reducir el stress de margen.",
        triggerPct: round(marginRequirement / Math.max(1, strategy.capital), 4)
      });
    }

    alerts.push({
      code: "HIGH_VOLATILITY_PROFILE",
      severity: "info",
      message: "El covered straddle fue evaluado bajo escenarios de alta volatilidad.",
      recommendation: "Usar el stress test para monitorear expansion de riesgo y captura de prima."
    });

    return alerts;
  }
}
