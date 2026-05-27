import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { ProtectivePutEngine } from "../../modules/strategies/coverage/protectivePutEngine.js";
import { CollarEngine } from "../../modules/strategies/coverage/collarEngine.js";
import { CoveredStraddleEngine } from "../../modules/strategies/coverage/coveredStraddleEngine.js";
import { createCoverageStrategyContract, isFiniteNumber, isNonEmptyString, type CoverageStrategyContract, type CoverageStrategyKind } from "../../modules/strategies/coverage/coverageStrategyContract.js";
import type { CoverageOptionLeg } from "../../modules/strategies/coverage/coverageStrategyContract.js";
import { estimateOptionPremium } from "../../modules/strategies/coverage/coverageTypes.js";

const supportedRoles = ["analyst", "risk_manager", "trader"];

interface AnalyzeBody {
  ticker?: string;
  currentPrice?: number;
  shares?: number;
  legs?: CoverageOptionLeg[];
  strikes?: number[];
  capital?: number;
  riskTolerancePct?: number;
}

function buildContracts(body: AnalyzeBody): CoverageStrategyContract[] {
  const kinds: CoverageStrategyKind[] = ["protective_put", "married_put", "collar_put", "covered_straddle"];
  const now = new Date().toISOString();
  const cp = body.currentPrice ?? 450;
  const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  function estimatePremium(type: "call" | "put", strike: number): number {
    return estimateOptionPremium({
      underlyingPrice: cp,
      strike,
      type,
      daysToExpiry: 90,
      impliedVol: 0.25
    });
  }

  function legsForKind(kind: CoverageStrategyKind): CoverageOptionLeg[] {
    if (body.legs && body.legs.length > 0) return body.legs;

    const strikes = body.strikes && body.strikes.length > 0 ? body.strikes : [];
    const putStrike = strikes.length > 0 ? strikes[0] : Math.round(cp * 0.95 * 100) / 100;
    const callStrike = strikes.length > 1 ? strikes[strikes.length - 1] : Math.round(cp * 1.05 * 100) / 100;

    switch (kind) {
      case "protective_put":
      case "married_put":
        return [{ type: "put", side: "long", strike: putStrike, premium: estimatePremium("put", putStrike), expiration: expiry, multiplier: 100 }];
      case "collar_put":
        return [
          { type: "put", side: "long", strike: putStrike, premium: estimatePremium("put", putStrike), expiration: expiry, multiplier: 100 },
          { type: "call", side: "short", strike: callStrike, premium: estimatePremium("call", callStrike), expiration: expiry, multiplier: 100 }
        ];
      case "covered_straddle":
        return [
          { type: "put", side: "short", strike: putStrike, premium: estimatePremium("put", putStrike), expiration: expiry, multiplier: 100 },
          { type: "call", side: "short", strike: callStrike, premium: estimatePremium("call", callStrike), expiration: expiry, multiplier: 100 }
        ];
    }
  }

  return kinds.map((kind) => {
    const contract: CoverageStrategyContract = {
      strategyId: `cov-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind,
      ticker: body.ticker ?? "SPY",
      shares: body.shares ?? 100,
      underlyingPrice: body.currentPrice,
      legs: legsForKind(kind),
      capital: body.capital ?? 100000,
      riskTolerancePct: body.riskTolerancePct ?? 0.05,
      requestedAt: now
    };
    return createCoverageStrategyContract(contract);
  });
}

export const coverageAnalyzeRouter = Router();

coverageAnalyzeRouter.use(authContextMiddleware);

coverageAnalyzeRouter.post("/analyze", async (req, res) => {
  try {
    const role = req.authContext?.role;
    if (!role || !supportedRoles.includes(role)) {
      return res.status(403).json({
        code: "FORBIDDEN_ROLE",
        message: `Role ${role} is not authorized for coverage analysis.`
      });
    }

    const body = req.body as AnalyzeBody;

    if (!isNonEmptyString(body.ticker)) {
      return res.status(400).json({ code: "INVALID_TICKER", message: "ticker is required." });
    }
    if (!isFiniteNumber(body.currentPrice) || (body.currentPrice ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_PRICE", message: "currentPrice must be a positive number." });
    }
    if (!isFiniteNumber(body.shares) || !Number.isInteger(body.shares) || (body.shares ?? 0) <= 0) {
      return res.status(400).json({ code: "INVALID_SHARES", message: "shares must be a positive integer." });
    }

    const contracts = buildContracts(body);
    const protectivePut = new ProtectivePutEngine();
    const collar = new CollarEngine();
    const coveredStraddle = new CoveredStraddleEngine();

    const results = contracts.map((contract) => {
      switch (contract.kind) {
        case "protective_put":
        case "married_put":
          return protectivePut.analyze(contract);
        case "collar_put":
          return collar.analyze(contract);
        case "covered_straddle":
          return coveredStraddle.analyze(contract);
      }
    });

    return res.status(200).json({
      results,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Coverage analysis failed.";
    return res.status(400).json({ code: "COVERAGE_ANALYZE_FAILED", message });
  }
});
