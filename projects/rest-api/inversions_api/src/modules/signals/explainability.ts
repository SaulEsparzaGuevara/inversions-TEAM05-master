import type { SourceVerdict } from "./confluenceEngine.js";

export interface EvidenceItem {
  sourceId: string;
  verdict: "BUY" | "SELL" | "HOLD";
  confidence: number;
  rationale: string;
}

export interface ExplainabilityPayload {
  summary: string;
  evidence: EvidenceItem[];
}

export function buildExplainability(verdicts: SourceVerdict[]): ExplainabilityPayload {
  const buyCount = verdicts.filter((item) => item.verdict === "BUY").length;
  const sellCount = verdicts.filter((item) => item.verdict === "SELL").length;

  const summary =
    buyCount === sellCount
      ? "Confluencia neutral entre fuentes"
      : buyCount > sellCount
        ? "Confluencia favorable a BUY"
        : "Confluencia favorable a SELL";

  return {
    summary,
    evidence: verdicts.map((item) => ({
      sourceId: item.sourceId,
      verdict: item.verdict,
      confidence: item.confidence,
      rationale: item.rationale
    }))
  };
}
