/**
 * ============================================================================
 * protectivePutEngine.ts
 * ============================================================================
 *
 * FIC: T114/T114b: Protective Put and Married Put Engines — computes payoff (simplified BS), risk metrics, and alerts for put-protected long positions.
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

export interface ProtectivePutEngineOptions {
  stopLossBufferPct?: number;
  earlyExerciseWindowDays?: number;
}

export class ProtectivePutEngine {
  private readonly stopLossBufferPct: number;
  private readonly earlyExerciseWindowDays: number;

  constructor(options: ProtectivePutEngineOptions = {}) {
    // stopLossBufferPct = 3% por debajo del strike del put.
    // POR QUÉ 3%: Es un buffer suficiente para evitar falsos positivos
    // por volatilidad intradía, pero lo suficientemente ajustado para
    // activar la alerta antes de que el put pierda su protección efectiva.
    this.stopLossBufferPct = options.stopLossBufferPct ?? 0.03;
    // earlyExerciseWindowDays = 21 días antes de expiración.
    // POR QUÉ 21: Es ~1 mes de trading. Cuando un put está deep ITM
    // y cerca de expirar, aumenta el riesgo de ejercicio anticipado
    // (asignación). 21 días da tiempo para hacer roll o cerrar la posición.
    this.earlyExerciseWindowDays = options.earlyExerciseWindowDays ?? 21;
  }

  analyze(request: CoverageStrategyContract): CoverageStrategyResult {
    const strategy = createCoverageStrategyContract(request);
    this.assertSupportedKind(strategy);

    const currentPrice = this.resolveCurrentPrice(strategy);
    const putLeg = this.findPutLeg(strategy);
    const netPremiumPerShare = this.calculateNetPremiumPerShare(strategy);
    const protectionMaximumPerShare = Math.max(0, putLeg.strike - currentPrice);
    const protectionFloorPrice = putLeg.strike - netPremiumPerShare;
    const breakEvenPrice = currentPrice + netPremiumPerShare;
    const riskBuffer = strategy.riskTolerancePct > 0
      ? Math.max(0.01, Math.min(0.10, strategy.riskTolerancePct * 0.5))
      : this.stopLossBufferPct;
    const stopLossPrice = round(putLeg.strike * (1 - riskBuffer), 2);

    const payoff = this.buildPayoffSimulation(strategy, currentPrice, putLeg.strike, netPremiumPerShare);
    const riskMetrics = {
      riskProfile: "limited" as const,
      maxProtection: round(protectionMaximumPerShare * strategy.shares, 2),
      protectionFloorPrice: round(protectionFloorPrice, 2),
      netPremium: round(netPremiumPerShare * strategy.shares, 2),
      netPremiumPerShare: round(netPremiumPerShare, 4),
      costBenefitRatio: round(this.calculateCostBenefit(protectionMaximumPerShare, netPremiumPerShare), 4),
      downsideRisk: round(Math.max(0, currentPrice - protectionFloorPrice) * strategy.shares, 2),
      upsideCap: null,
      breakEvenPrice: round(breakEvenPrice, 2),
      stopLossPrice,
      marginRequirement: round(strategy.capital * 0.1, 2),
      exerciseRiskScore: round(this.calculateExerciseRisk(strategy, currentPrice, putLeg.strike), 4),
      volatilityStressLoss: round(this.calculateVolatilityStress(strategy, currentPrice, putLeg.strike, netPremiumPerShare), 2),
    };

    const alerts = this.buildAlerts(strategy, currentPrice, putLeg.strike, stopLossPrice, riskMetrics.exerciseRiskScore);

    return createCoverageStrategyResult({
      engineId: "protective_put_engine",
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
    if (strategy.kind !== "protective_put" && strategy.kind !== "married_put") {
      throw new Error(`ProtectivePutEngine does not support ${strategy.kind}.`);
    }
  }

  private findPutLeg(strategy: CoverageStrategyContract) {
    const putLegs = strategy.legs.filter((leg) => leg.type === "put");
    if (putLegs.length === 0) {
      throw new Error("ProtectivePutEngine requires at least one put leg.");
    }

    const longPut = putLegs.find((leg) => leg.side === "long") ?? putLegs[0];
    return longPut;
  }

  private resolveCurrentPrice(strategy: CoverageStrategyContract): number {
    if (strategy.underlyingPrice !== undefined) {
      return strategy.underlyingPrice;
    }

    const strikeAverage = strategy.legs.reduce((sum, leg) => sum + leg.strike, 0) / strategy.legs.length;
    return Math.max(1, strikeAverage);
  }

  /**
   * Calcula la prima neta POR ACCIÓN de la estrategia.
   *
   * POR QUÉ signedPremium (long = positivo, short = negativo):
   * En opciones, comprar (long) significa pagar prima (costo), mientras que
   * vender (short) significa recibir prima (ingreso). Para calcular el costo
   * neto, las primas de patas largas son positivas (gasto) y las de patas
   * cortas son negativas (ingreso).
   *
   * POR QUÉ toContractScale: Las primas de opciones cotizan POR CONTRATO
   * (100 acciones). Si el usuario tiene 500 acciones pero la opción es
   * estándar (100), se necesitan 5 contratos. toContractScale normaliza
   * esto dividiendo shares / multiplier.
   */
  private calculateNetPremiumPerShare(strategy: CoverageStrategyContract): number {
    return strategy.legs.reduce((sum, leg) => {
      const signedPremium = leg.side === "long" ? leg.premium : -leg.premium;
      return sum + signedPremium;
    }, 0);
  }

  private buildPayoffSimulation(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    strike: number,
    netPremiumPerShare: number
  ) {
    const moves = strategy.targetMovePct !== undefined
      ? [-0.5, -0.35, -0.2, -0.1, -0.05, 0, 0.05, strategy.targetMovePct]
      : [-0.5, -0.35, -0.2, -0.1, -0.05, 0, 0.05, 0.1];

    const points = moves.map((movePct) => this.simulatePoint(strategy, currentPrice, strike, netPremiumPerShare, movePct));
    const breakEvenPrice = currentPrice + netPremiumPerShare;

    return {
      baselinePrice: round(currentPrice, 2),
      breakevenPrice: round(breakEvenPrice, 2),
      maxProfit: null,
      maxLoss: round(Math.max(0, currentPrice - (strike - netPremiumPerShare)) * strategy.shares, 2),
      description: "Escenarios de caida protegidos por put largo; upside ilimitado por tenencia del subyacente.",
      points
    };
  }

  private simulatePoint(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    strike: number,
    netPremiumPerShare: number,
    movePct: number
  ): PayoffPoint {
    const scenarioPrice = Math.max(0.01, currentPrice * (1 + movePct));
    const stockPnL = (scenarioPrice - currentPrice) * strategy.shares;
    const putPayoff = Math.max(0, strike - scenarioPrice) * strategy.shares;
    const optionCost = netPremiumPerShare * strategy.shares;
    const pnl = stockPnL + putPayoff - optionCost;

    return {
      label: `${round(movePct * 100, 1)}%`,
      movePct: round(movePct, 4),
      underlyingPrice: round(scenarioPrice, 2),
      pnl: round(pnl, 2),
      pnlPct: round((pnl / Math.max(1, strategy.capital)) * 100, 2),
      notes: [movePct < 0 ? "downside_stress" : "upside_follow_through"]
    };
  }

  private calculateMaxProtectionPerShare(currentPrice: number, strike: number): number {
    return Math.max(0, strike - currentPrice);
  }

  private calculateCostBenefit(maxProtectionPerShare: number, netPremiumPerShare: number): number {
    if (netPremiumPerShare <= 0) {
      return maxProtectionPerShare;
    }

    return maxProtectionPerShare / netPremiumPerShare;
  }

  private calculateExerciseRisk(strategy: CoverageStrategyContract, currentPrice: number, strike: number): number {
    const timeToExpirationDays = this.daysUntil(strategy.legs.find((leg) => leg.type === "put")?.expiration);
    const deepInTheMoney = Math.max(0, strike - currentPrice) / Math.max(1, strike);
    const nearExpiry = timeToExpirationDays !== null && timeToExpirationDays <= this.earlyExerciseWindowDays;
    return clamp01(deepInTheMoney * 0.7 + (nearExpiry ? 0.3 : 0));
  }

  private calculateVolatilityStress(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    strike: number,
    netPremiumPerShare: number
  ): number {
    const stressPrice = currentPrice * 0.72;
    const stockPnL = (stressPrice - currentPrice) * strategy.shares;
    const putPayoff = Math.max(0, strike - stressPrice) * strategy.shares;
    const optionCost = netPremiumPerShare * strategy.shares;
    return Math.abs(stockPnL + putPayoff - optionCost);
  }

  private buildAlerts(
    strategy: CoverageStrategyContract,
    currentPrice: number,
    strike: number,
    stopLossPrice: number,
    exerciseRiskScore: number
  ): Alert[] {
    const alerts: Alert[] = [];

    if (currentPrice <= stopLossPrice) {
      alerts.push({
        code: "STOP_LOSS_TRIGGERED",
        severity: "critical",
        message: "El subyacente ya cruzo el umbral de stop-loss del protective put.",
        recommendation: "Reducir exposicion o reevaluar la cobertura inmediatamente.",
        triggerPrice: stopLossPrice
      });
    } else if (currentPrice <= strike * (1 + this.stopLossBufferPct)) {
      alerts.push({
        code: "STOP_LOSS_NEAR_STRIKE",
        severity: "warning",
        message: "El subyacente se acerca al strike de proteccion.",
        recommendation: "Preparar reduccion de riesgo o rebalancear antes de perder el piso tecnico.",
        triggerPrice: strike * (1 + this.stopLossBufferPct)
      });
    }

    if (exerciseRiskScore >= 0.6) {
      alerts.push({
        code: "EARLY_EXERCISE_RISK",
        severity: "warning",
        message: "Existe riesgo elevado de ejercicio anticipado por put deep ITM y ventana cercana a expiracion.",
        recommendation: "Revisar liquidez del contrato y valorar cierre o roll.",
        triggerPct: exerciseRiskScore
      });
    }

    if (strategy.kind === "married_put") {
      alerts.push({
        code: "MARRIED_PUT_BASIS_CHECK",
        severity: "info",
        message: "Married put activo: verificar base del subyacente y costo de proteccion total.",
        recommendation: "Confirmar que la prima no erosione el objetivo de preservacion de capital."
      });
    }

    return alerts;
  }

  private daysUntil(expiration?: string): number | null {
    if (!expiration) {
      return null;
    }

    const parsed = new Date(expiration).getTime();
    if (Number.isNaN(parsed)) {
      return null;
    }

    return Math.max(0, Math.ceil((parsed - Date.now()) / 86_400_000));
  }
}
