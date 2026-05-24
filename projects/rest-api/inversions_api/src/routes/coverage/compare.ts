import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { CoverageComparator } from "../../modules/strategies/coverage/coverageComparator.js";
import { createCoverageStrategyContract, isFiniteNumber, isNonEmptyString, type CoverageStrategyContract, type CoverageOptionLeg } from "../../modules/strategies/coverage/coverageStrategyContract.js";

const supportedRoles = ["analyst", "risk_manager", "trader"];

interface CompareBody {
  ticker?: string;
  currentPrice?: number;
  shares?: number;
  legs?: CoverageOptionLeg[];
  capital?: number;
  riskTolerancePct?: number;
}

export const coverageCompareRouter = Router();

coverageCompareRouter.use(authContextMiddleware);

coverageCompareRouter.post("/compare", async (req, res) => {
  try {
    const role = req.authContext?.role;
    if (!role || !supportedRoles.includes(role)) {
      return res.status(403).json({
        code: "FORBIDDEN_ROLE",
        message: `Role ${role} is not authorized for coverage comparison.`
      });
    }

    const body = req.body as CompareBody;

    if (!isNonEmptyString(body.ticker)) {
      return res.status(400).json({ code: "INVALID_TICKER", message: "ticker is required." });
    }
    if (!isFiniteNumber(body.currentPrice) || (body.currentPrice ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_PRICE", message: "currentPrice must be a positive number." });
    }
    if (!isFiniteNumber(body.shares) || !Number.isInteger(body.shares) || (body.shares ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_SHARES", message: "shares must be a positive integer." });
    }

    const baseRequest: CoverageStrategyContract = createCoverageStrategyContract({
      strategyId: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "protective_put",
      ticker: body.ticker,
      shares: body.shares,
      underlyingPrice: body.currentPrice,
      legs: body.legs ?? [],
      capital: body.capital ?? 100000,
      riskTolerancePct: body.riskTolerancePct ?? 0.05,
      requestedAt: new Date().toISOString()
    });

    const comparator = new CoverageComparator();
    const result = await comparator.compare(baseRequest);

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coverage comparison failed.";
    return res.status(400).json({ code: "COVERAGE_COMPARE_FAILED", message });
  }
});
