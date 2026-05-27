/**
 * ============================================================================
 * coverageRiskService.ts
 * ============================================================================
 *
 * FIC: T118: Coverage Risk Service — evaluates stop-loss, margin stress, generates recommendations and notifications.
 */

import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";
import {
  createCoverageRiskServiceResult,
  type CoverageNotificationRecord,
  type CoverageRiskAction,
  type CoverageRiskServiceResult,
  type CoverageSimulationResult,
  type CoverageStrategyResult
} from "./coverageTypes.js";

export interface CoverageRiskServiceOptions {
  emailSender?: (to: string, subject: string, body: string) => Promise<boolean>;
  pushSender?: (to: string, title: string, body: string) => Promise<boolean>;
}

export class CoverageRiskService {
  private readonly emailSender?: (to: string, subject: string, body: string) => Promise<boolean>;
  private readonly pushSender?: (to: string, title: string, body: string) => Promise<boolean>;

  constructor(options: CoverageRiskServiceOptions = {}) {
    this.emailSender = options.emailSender;
    this.pushSender = options.pushSender;
  }

  async evaluate(
    strategyResult: CoverageStrategyResult,
    simulation: CoverageSimulationResult,
    recipients: { email?: string[]; push?: string[] } = {}
  ): Promise<CoverageRiskServiceResult> {
    const strategy = createCoverageStrategyContract(strategyResult.strategy);
    const actions: CoverageRiskAction[] = [];
    const notifications: CoverageNotificationRecord[] = [];

    // Stop-loss: if any alert of severity critical exists, trigger stop-loss action
    const criticalAlerts = strategyResult.alerts.filter((a) => a.severity === "critical");
    const stopLossTriggered = criticalAlerts.length > 0;

    if (stopLossTriggered) {
      actions.push({
        type: "stop_loss",
        code: "AUTO_STOP_LOSS_CRITICAL",
        severity: "critical",
        message: "Critical alert detected by strategy engine. Automatic stop-loss recommended.",
        recommendation: "Close or reduce exposure immediately."
      });
    }

    // Margin alert: if backtest or monte carlo worst-case exceed capital by > 150%
    const worstMonte = simulation.monteCarlo.worstPnL;
    const marginAlertTriggered = Math.abs(worstMonte) > strategy.capital * 1.5;

    if (marginAlertTriggered) {
      actions.push({
        type: "margin_alert",
        code: "MARGIN_STRESS",
        severity: "warning",
        message: "Estimated worst-case PnL exceeds acceptable capital buffer.",
        recommendation: "Reduce position size or increase capital allocation."
      });
    }

    // Enqueue notifications in parallel (stubs: use provided senders)
    const emailSender = this.emailSender;
    if (recipients.email && emailSender) {
      const emailNotifications = await Promise.allSettled(
        recipients.email.map(async (email) => {
          const subject = `[Coverage Alert] ${strategy.ticker} ${strategyResult.strategy.strategyId}`;
          const body = `Strategy ${strategyResult.strategy.strategyId} reported ${actions.length} actions. Please review.`;
          const delivered = await emailSender(email, subject, body).catch(() => false);
          return { channel: "email" as const, recipient: email, subject, body, delivered, deliveredAt: delivered ? new Date().toISOString() : "" };
        })
      );
      for (const result of emailNotifications) {
        if (result.status === "fulfilled") {
          notifications.push(result.value);
        }
      }
    }

    const pushSender = this.pushSender;
    if (recipients.push && pushSender) {
      const pushNotifications = await Promise.allSettled(
        recipients.push.map(async (push) => {
          const title = `Coverage Alert: ${strategy.ticker}`;
          const body = `${actions.length} actions for ${strategyResult.strategy.strategyId}`;
          const delivered = await pushSender(push, title, body).catch(() => false);
          return { channel: "push" as const, recipient: push, subject: title, body, delivered, deliveredAt: delivered ? new Date().toISOString() : "" };
        })
      );
      for (const result of pushNotifications) {
        if (result.status === "fulfilled") {
          notifications.push(result.value);
        }
      }
    }

    return createCoverageRiskServiceResult({
      engineId: "coverage_risk_service",
      strategy,
      strategyResult,
      simulation,
      stopLossTriggered,
      marginAlertTriggered,
      actions,
      notifications,
      generatedAt: new Date().toISOString()
    });
  }
}

export default CoverageRiskService;
