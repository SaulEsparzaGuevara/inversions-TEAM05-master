import { promises as fs } from "node:fs";
import path from "node:path";
import { createCoverageStrategyContract, type CoverageStrategyContract } from "./coverageStrategyContract.js";
import {
  createCoverageReportResult,
  createCoverageSimulationResult,
  round,
  type CoverageReportResult,
  type CoverageRiskServiceResult,
  type CoverageSimulationResult,
  type CoverageStrategyResult
} from "./coverageTypes.js";
import { CoverageSimulationEngine } from "./coverageSimulationEngine.js";
import { CoverageRiskService } from "./coverageRiskService.js";

export interface CoverageReportServiceOptions {
  outputDir?: string;
}

export class CoverageReportService {
  private readonly simulationEngine: CoverageSimulationEngine;
  private readonly riskService: CoverageRiskService;
  private readonly outputDir: string;

  constructor(options: CoverageReportServiceOptions = {}) {
    this.simulationEngine = new CoverageSimulationEngine();
    this.riskService = new CoverageRiskService();
    this.outputDir = options.outputDir ?? path.join(process.cwd(), "reports", "coverage");
  }

  async generateReport(strategyReq: CoverageStrategyContract, recipients: { email?: string[]; push?: string[] } = {}): Promise<CoverageReportResult> {
    const strategy = createCoverageStrategyContract(strategyReq);
    const baseResult = this.simulationEngine.analyze(strategyReq);
    const risk = await this.riskService.evaluate(baseResult.baseResult, baseResult, recipients);

    const summary = this.buildSummary(baseResult, risk);
    const logs: string[] = [];
    logs.push(`Report for ${strategy.strategyId} generated at ${new Date().toISOString()}`);
    logs.push(`Expected PnL: ${summary.expectedPnL}`);
    logs.push(`Win Rate: ${summary.winRate}`);

    const exports: { format: "json" | "md" | "csv"; fileName: string; content: string }[] = [];

    // JSON export
    const jsonFile = `${strategy.strategyId}-report.json`;
    const jsonContent = JSON.stringify({ summary, baseResult, risk }, null, 2);
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.writeFile(path.join(this.outputDir, jsonFile), jsonContent, "utf8");
    exports.push({ format: "json", fileName: jsonFile, content: jsonContent });

    // Markdown summary
    const mdFile = `${strategy.strategyId}-summary.md`;
    const mdLines: string[] = [];
    mdLines.push(`# Coverage Report - ${strategy.strategyId}`);
    mdLines.push(`Generated: ${new Date().toISOString()}`);
    mdLines.push("\n## Summary\n");
    mdLines.push(`- Expected PnL: ${summary.expectedPnL}`);
    mdLines.push(`- Win Rate: ${summary.winRate}`);
    mdLines.push(`- Best PnL: ${summary.bestPnL}`);
    mdLines.push(`- Worst PnL: ${summary.worstPnL}`);
    mdLines.push("\n## Alerts / Actions\n");
    for (const act of risk.actions) {
      mdLines.push(`- [${act.severity}] ${act.code}: ${act.message} -> ${act.recommendation}`);
    }

    const mdContent = mdLines.join("\n");
    await fs.writeFile(path.join(this.outputDir, mdFile), mdContent, "utf8");
    exports.push({ format: "md", fileName: mdFile, content: mdContent });

    const result = createCoverageReportResult({
      engineId: "coverage_report_service",
      strategy,
      strategyResult: baseResult.baseResult,
      simulation: baseResult,
      risk,
      summary,
      logs,
      exports,
      generatedAt: new Date().toISOString()
    });

    return result;
  }

  private buildSummary(sim: CoverageSimulationResult, risk: CoverageRiskServiceResult) {
    const expectedPnL = sim.monteCarlo.expectedPnL;
    const expectedPnLPct = round((expectedPnL / Math.max(1, sim.strategy.capital)) * 100, 2);

    return {
      expectedPnL: round(expectedPnL, 2),
      expectedPnLPct,
      bestPnL: sim.monteCarlo.bestPnL,
      worstPnL: sim.monteCarlo.worstPnL,
      riskRewardRatio: round(Math.abs(sim.monteCarlo.bestPnL / Math.max(0.01, Math.abs(sim.monteCarlo.worstPnL))), 3),
      winRate: sim.monteCarlo.winRate,
      lossRate: sim.monteCarlo.lossRate,
      alertCount: risk.actions.length
    };
  }
}

export default CoverageReportService;
