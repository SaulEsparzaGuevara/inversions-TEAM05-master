import { randomUUID } from "node:crypto";
import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";
import { buildExplainability } from "../../modules/signals/explainability.js";
import { evaluateConfluence, type SourceVerdict } from "../../modules/signals/confluenceEngine.js";
import { emitSignalGenerated } from "../../modules/signals/signalAudit.js";
import { sourceConfigRegistry } from "../../modules/signals/sourceConfig.js";

interface EvaluateRequestBody {
  instrument: string;
  verdicts: SourceVerdict[];
}

export const signalEvaluateRouter = Router();

signalEvaluateRouter.post("/evaluate", authContextMiddleware, (req, res) => {
  const body = req.body as EvaluateRequestBody;
  const enabledSources = sourceConfigRegistry.listEnabled();

  const confluence = evaluateConfluence(enabledSources, body.verdicts ?? []);
  const explainability = buildExplainability(body.verdicts ?? []);
  const signalId = randomUUID();
  const correlationId = randomUUID();

  emitSignalGenerated({
    correlationId,
    signalId,
    userId: req.authContext?.userId,
    role: req.authContext?.role,
    instrument: body.instrument,
    outcomeCode: "OK"
  });

  res.status(200).json({
    signalId,
    correlationId,
    instrument: body.instrument,
    signal: confluence.signal,
    confidence: confluence.confidence,
    confluenceScore: confluence.confluenceScore,
    explainability
  });
});
