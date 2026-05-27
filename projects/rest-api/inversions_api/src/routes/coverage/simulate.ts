import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { CoverageSimulationEngine } from "../../modules/strategies/coverage/coverageSimulationEngine.js";
import { createCoverageStrategyContract, isFiniteNumber, isNonEmptyString, type CoverageStrategyContract, type CoverageOptionLeg } from "../../modules/strategies/coverage/coverageStrategyContract.js";

const supportedRoles = ["analyst", "risk_manager", "trader"];

interface SimulateBody {
  ticker?: string;
  currentPrice?: number;
  shares?: number;
  legs?: CoverageOptionLeg[];
  capital?: number;
  riskTolerancePct?: number;
}

export const coverageSimulateRouter = Router();

coverageSimulateRouter.use(authContextMiddleware);

coverageSimulateRouter.post("/simulate", async (req, res) => {
  try {
    const role = req.authContext?.role;
    if (!role || !supportedRoles.includes(role)) {
      return res.status(403).json({
        code: "FORBIDDEN_ROLE",
        message: `Role ${role} is not authorized for coverage simulation.`
      });
    }

    const body = req.body as SimulateBody;

    if (!isNonEmptyString(body.ticker)) {
      return res.status(400).json({ code: "INVALID_TICKER", message: "ticker is required." });
    }
    if (!isFiniteNumber(body.currentPrice) || (body.currentPrice ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_PRICE", message: "currentPrice must be a positive number." });
    }
    if (!isFiniteNumber(body.shares) || !Number.isInteger(body.shares) || (body.shares ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_SHARES", message: "shares must be a positive integer." });
    }

    const request: CoverageStrategyContract = createCoverageStrategyContract({
      strategyId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "protective_put",
      ticker: body.ticker,
      shares: body.shares,
      underlyingPrice: body.currentPrice,
      legs: body.legs ?? [],
      capital: body.capital ?? 100000,
      riskTolerancePct: body.riskTolerancePct ?? 0.05,
      requestedAt: new Date().toISOString()
    });

    const engine = new CoverageSimulationEngine();
    const result = engine.analyze(request);

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coverage simulation failed.";
    return res.status(400).json({ code: "COVERAGE_SIMULATE_FAILED", message });
  }
});
