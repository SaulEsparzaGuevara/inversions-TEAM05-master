import { Router } from "express";
import { authContextMiddleware } from "../../middleware/authContext.js";

export const signalDetailsRouter = Router();

signalDetailsRouter.get("/:signalId/details", authContextMiddleware, (req, res) => {
  const { signalId } = req.params;

  res.status(200).json({
    signalId,
    summary: "Detalle de evidencia para la senal solicitada",
    evidence: [
      {
        sourceId: "technical-rsi",
        verdict: "BUY",
        confidence: 0.74,
        rationale: "RSI en zona de recuperacion"
      },
      {
        sourceId: "news-sentiment",
        verdict: "HOLD",
        confidence: 0.56,
        rationale: "Sentimiento mixto en ultimas noticias"
      }
    ]
  });
});
