/**
 * ============================================================================
 * regulatoryPositions.ts
 * ============================================================================
 *
 * FIC: T112: Regulatory Positions Route — GET /api/institutional/positions returning 13F data, institutional flows, holdings and sourceReports.
 */

import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import {
  buildInstitutionalAnalysisContractFromRequest,
  buildInstitutionalPositionsSummary,
  getInstitutionalRouteContext
} from "./bootstrap.js";

export const regulatoryPositionsRouter = Router();

regulatoryPositionsRouter.use(authContextMiddleware);

regulatoryPositionsRouter.get("/positions", async (req, res) => {
  try {
    const { service } = getInstitutionalRouteContext();
    const analysis = buildInstitutionalAnalysisContractFromRequest(req);
    const result = await service.resolve(analysis);

    // Graceful degradation: if no source returned usable data, return 503
    if (result.overallStatus === "all_failed") {
      return res.status(503).json({
        code: "ALL_SOURCES_UNAVAILABLE",
        message: "No institutional source returned a usable response. All dependent sources are currently unreachable or errored.",
        sourceReports: result.sourceReports
      });
    }

    return res.status(200).json({
      request: {
        ticker: result.analysis.ticker,
        period: result.analysis.period,
        horizon: result.analysis.horizon,
        analysisId: result.analysis.analysisId
      },
      analysis: result.analysis,
      positions13F: buildInstitutionalPositionsSummary(result).positions13F,
      flows: buildInstitutionalPositionsSummary(result).flows,
      sourceReports: result.sourceReports,
      cacheHit: result.cacheHit,
      usedSourceIds: result.usedSourceIds
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resolve institutional positions.";
    return res.status(400).json({
      code: "INSTITUTIONAL_POSITIONS_FAILED",
      message
    });
  }
});
