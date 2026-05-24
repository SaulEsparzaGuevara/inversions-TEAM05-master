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
    const { engine, trendEngine } = getInstitutionalRouteContext();
    const analysis = buildInstitutionalAnalysisContractFromRequest(req);

    // Execute both analyses in parallel
    const [zoneResult, trendResult] = await Promise.all([
      engine.analyze({ analysis }),
      trendEngine.analyze({ analysis })
    ]);

    const groupedZones = groupInstitutionalZones(zoneResult.zones);

    return res.status(200).json({
      request: {
        ticker: zoneResult.analysis.ticker,
        period: zoneResult.analysis.period,
        horizon: zoneResult.analysis.horizon,
        analysisId: zoneResult.analysis.analysisId
      },
      analysis: zoneResult.analysis,
      zones: groupedZones,
      trends: {
        ...buildInstitutionalTrendSummary(zoneResult),
        movingAverages: trendResult.movingAverages,
        crossover: trendResult.crossover,
        currentTrend: trendResult.currentTrend,
        trendStrength: trendResult.trendStrength,
        supportLevel: trendResult.supportLevel,
        resistanceLevel: trendResult.resistanceLevel,
        volumeCorrelation: trendResult.volumeCorrelation,
        continuityProbability: trendResult.continuityProbability
      },
      metrics: buildInstitutionalMetricsSummary(zoneResult),
      sourceReports: zoneResult.sourceReports,
      generatedAt: zoneResult.generatedAt
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to build institutional analysis.";
    return res.status(400).json({
      code: "INSTITUTIONAL_ANALYSIS_FAILED",
      message
    });
  }
});
