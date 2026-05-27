/**
 * ============================================================================
 * index.ts
 * ============================================================================
 *
 * FIC: Entry point — Express app with JSON/CORS/auth middleware, institutional/coverage/AI routers, FINRA cache preload.
 */

import "dotenv/config";
import express from "express";
import { initializeEnvironment } from "./config/environment.js";
import { printValidationResult, validateEnvironment } from "./config/envValidator.js";
import { createAuditHistoryRouter } from "./routes/audit/history.js";
import { createOperationDetailRouter } from "./routes/audit/operationDetail.js";
import { createApprovalRouter } from "./routes/execution/approve.js";
import { createExecutionRouter } from "./routes/execution/execute.js";
import { AuditHistoryService } from "./modules/audit/historyService.js";
import { ApprovalService } from "./modules/execution/approvalService.js";
import { ExecutionService } from "./modules/execution/executionService.js";
import { signalDetailsRouter } from "./routes/signals/details.js";
import { signalEvaluateRouter } from "./routes/signals/evaluate.js";
import { signalConfluenceRouter } from "./routes/signals/confluence.js";
import { dashboardOrchestratorRouter } from "./routes/dashboard/orchestrator.js";
import confluenceViewPresetsRouter from "./routes/dashboard/confluenceViewPresets.js";
import { watchlistRouter } from "./routes/watchlist/index.js";
import { runtimeModeRouter } from "./routes/runtime/runtimeMode.js";
import { instrumentsCatalogRouter } from "./routes/catalogs/instruments.js";
import { brokerCapabilitiesRouter } from "./routes/brokers/capabilities.js";
import { marketDataOhlcRouter } from "./routes/market-data/ohlc.js";
import { indicatorsCatalogRouter } from "./routes/indicators/catalog.js";
import { institutionalAnalysisRouter } from "./routes/institutional/institutionalAnalysis.js";
import { regulatoryPositionsRouter } from "./routes/institutional/regulatoryPositions.js";
import institutionalCopilotRouter from "./routes/ai/institutionalCopilot.js";
import { coverageAnalyzeRouter } from "./routes/coverage/analyze.js";
import { coverageCompareRouter } from "./routes/coverage/compare.js";
import { coverageSimulateRouter } from "./routes/coverage/simulate.js";

const envValidation = validateEnvironment();
if (!envValidation.isValid) {
  console.error(printValidationResult(envValidation));
  process.exit(1);
}

if (envValidation.warnings.length > 0) {
  console.warn(printValidationResult(envValidation));
}

initializeEnvironment();

const app = express();
app.use(express.json());

const auditHistoryService = new AuditHistoryService();
const approvalService = new ApprovalService();
const executionService = new ExecutionService();

app.use("/api/signals", signalEvaluateRouter);
app.use("/api/signals", signalDetailsRouter);
app.use("/api/signals", signalConfluenceRouter);
app.use("/api/dashboard", dashboardOrchestratorRouter);
app.use("/api/dashboard", confluenceViewPresetsRouter);
app.use("/api/execution", createApprovalRouter(approvalService));
app.use("/api/execution", createExecutionRouter(executionService));
app.use("/api/audit", createAuditHistoryRouter(auditHistoryService));
app.use("/api/audit", createOperationDetailRouter());
app.use("/api/watchlist", watchlistRouter);
app.use("/api/runtime", runtimeModeRouter);
app.use("/api/catalogs", instrumentsCatalogRouter);
app.use("/api/brokers", brokerCapabilitiesRouter);
app.use("/api/market-data", marketDataOhlcRouter);
app.use("/api/indicators", indicatorsCatalogRouter);
app.use("/api/institutional", institutionalAnalysisRouter);
app.use("/api/institutional", regulatoryPositionsRouter);
app.use("/api/ai", institutionalCopilotRouter);
app.use("/api/coverage", coverageAnalyzeRouter);
app.use("/api/coverage", coverageCompareRouter);
app.use("/api/coverage", coverageSimulateRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Backend escuchando en puerto ${port}`);
});
