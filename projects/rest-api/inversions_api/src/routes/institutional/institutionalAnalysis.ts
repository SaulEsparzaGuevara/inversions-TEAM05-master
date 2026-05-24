import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import {
  buildInstitutionalAnalysisContractFromRequest,
  buildInstitutionalMetricsSummary,
  buildInstitutionalTrendSummary,
  getInstitutionalRouteContext,
  groupInstitutionalZones
} from "./bootstrap.js";

export const institutionalAnalysisRouter = Router();

institutionalAnalysisRouter.use(authContextMiddleware);

institutionalAnalysisRouter.get("/analysis", async (req, res) => {
  try {
    const { engine } = getInstitutionalRouteContext();
    const analysis = buildInstitutionalAnalysisContractFromRequest(req);
    const result = await engine.analyze({ analysis });
    const groupedZones = groupInstitutionalZones(result.zones);

    return res.status(200).json({
      request: {
        ticker: result.analysis.ticker,
        period: result.analysis.period,
        horizon: result.analysis.horizon,
        analysisId: result.analysis.analysisId
      },
      analysis: result.analysis,
      zones: groupedZones,
      trends: buildInstitutionalTrendSummary(result),
      metrics: buildInstitutionalMetricsSummary(result),
      sourceReports: result.sourceReports,
      generatedAt: result.generatedAt
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build institutional analysis.";
    return res.status(400).json({
      code: "INSTITUTIONAL_ANALYSIS_FAILED",
      message
    });
  }
});
