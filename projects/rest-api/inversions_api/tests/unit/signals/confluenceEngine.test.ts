import { describe, it, expect } from "vitest";
import {
  evaluateConfluence,
  buildDashboardConfluencePayload,
  type SourceVerdict,
  type ConfluenceResult
} from "../../../src/modules/signals/confluenceEngine";
import type { SourceConfig } from "../../../src/modules/signals/sourceConfig";

describe("confluenceEngine", () => {
  describe("evaluateConfluence", () => {
    it("should return HOLD signal when no verdicts provided", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];
      const verdicts: SourceVerdict[] = [];

      const result = evaluateConfluence(sources, verdicts);

      expect(result.signal).toBe("HOLD");
      expect(result.confidence).toBe(0);
      expect(result.confluenceScore).toBe(0);
    });

    it("should return BUY signal when weighted score is positive", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true },
        { id: "flow", name: "Flow", weight: 1, enabled: true }
      ];
      const verdicts: SourceVerdict[] = [
        { sourceId: "tech", verdict: "BUY", confidence: 0.8, rationale: "Uptrend" },
        { sourceId: "flow", verdict: "BUY", confidence: 0.7, rationale: "Strong inflow" }
      ];

      const result = evaluateConfluence(sources, verdicts);

      expect(result.signal).toBe("BUY");
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.confluenceScore).toBeGreaterThan(50);
    });

    it("should return SELL signal when weighted score is negative", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];
      const verdicts: SourceVerdict[] = [
        { sourceId: "tech", verdict: "SELL", confidence: 0.9, rationale: "Downtrend" }
      ];

      const result = evaluateConfluence(sources, verdicts);

      expect(result.signal).toBe("SELL");
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it("should respect source weights in confluence calculation", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 2, enabled: true },
        { id: "flow", name: "Flow", weight: 0.5, enabled: true }
      ];
      const verdicts: SourceVerdict[] = [
        { sourceId: "tech", verdict: "BUY", confidence: 0.6, rationale: "Moderate uptrend" },
        { sourceId: "flow", verdict: "SELL", confidence: 1.0, rationale: "Strong outflow" }
      ];

      const result = evaluateConfluence(sources, verdicts);

      // Technical has 2x weight, should dominate
      expect(result.signal).toBe("BUY");
    });

    it("should ignore verdicts from disabled sources", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true },
        { id: "flow", name: "Flow", weight: 1, enabled: false }
      ];
      const verdicts: SourceVerdict[] = [
        { sourceId: "tech", verdict: "BUY", confidence: 0.8, rationale: "Uptrend" },
        { sourceId: "flow", verdict: "SELL", confidence: 0.9, rationale: "Outflow (disabled)" }
      ];

      const result = evaluateConfluence(sources, verdicts);

      // Should be BUY since flow is disabled (weight = 0)
      expect(result.signal).toBe("BUY");
      expect(result.confidence).toBeGreaterThan(0.6);
    });

    it("should cap confidence at 1.0", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];
      const verdicts: SourceVerdict[] = [
        { sourceId: "tech", verdict: "BUY", confidence: 1.5, rationale: "Extreme confidence (over-cap)" }
      ];

      const result = evaluateConfluence(sources, verdicts);

      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe("buildDashboardConfluencePayload", () => {
    it("should generate valid dashboard payload with single instrument", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true },
        { id: "ai", name: "AI", weight: 0.8, enabled: true }
      ];
      const input = [
        {
          instrument: "AAPL",
          verdicts: [
            { sourceId: "tech", verdict: "BUY", confidence: 0.8, rationale: "Momentum" },
            { sourceId: "ai", verdict: "BUY", confidence: 0.7, rationale: "Model bullish" }
          ]
        }
      ];

      const payload = buildDashboardConfluencePayload(sources, input);

      expect(payload.generatedAt).toBeTruthy();
      expect(payload.instruments).toContain("AAPL");
      expect(payload.cards).toHaveLength(1);

      const card = payload.cards[0];
      expect(card.signalId).toBe("sig-1");
      expect(card.instrument).toBe("AAPL");
      expect(card.signal).toBe("BUY");
      expect(card.activeCores).toHaveLength(2);
      expect(card.updatedAt).toBeTruthy();
      expect(card.evidence).toHaveLength(2);
    });

    it("should generate cards for multiple instruments in order", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];
      const input = [
        {
          instrument: "AAPL",
          verdicts: [{ sourceId: "tech", verdict: "BUY", confidence: 0.7, rationale: "Up" }]
        },
        {
          instrument: "MSFT",
          verdicts: [{ sourceId: "tech", verdict: "SELL", confidence: 0.8, rationale: "Down" }]
        }
      ];

      const payload = buildDashboardConfluencePayload(sources, input);

      expect(payload.cards).toHaveLength(2);
      expect(payload.cards[0].signalId).toBe("sig-1");
      expect(payload.cards[1].signalId).toBe("sig-2");
      expect(payload.instruments).toEqual(["AAPL", "MSFT"]);
    });

    it("should correctly resolve risk levels", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];

      // High confidence high score = LOW risk
      const lowRiskInput = [
        {
          instrument: "HIGH_CONF",
          verdicts: [{ sourceId: "tech", verdict: "BUY", confidence: 1.0, rationale: "Very strong" }]
        }
      ];
      const lowRiskPayload = buildDashboardConfluencePayload(sources, lowRiskInput);
      expect(lowRiskPayload.cards[0].riskLevel).toBe("LOW");

      // Medium confidence medium score = MEDIUM risk
      const mediumRiskInput = [
        {
          instrument: "MEDIUM_CONF",
          verdicts: [{ sourceId: "tech", verdict: "BUY", confidence: 0.5, rationale: "Moderate" }]
        }
      ];
      const mediumRiskPayload = buildDashboardConfluencePayload(sources, mediumRiskInput);
      expect(mediumRiskPayload.cards[0].riskLevel).toBe("MEDIUM");

      // Low confidence = HIGH risk
      const highRiskInput = [
        {
          instrument: "LOW_CONF",
          verdicts: [{ sourceId: "tech", verdict: "HOLD", confidence: 0.2, rationale: "Weak" }]
        }
      ];
      const highRiskPayload = buildDashboardConfluencePayload(sources, highRiskInput);
      expect(highRiskPayload.cards[0].riskLevel).toBe("HIGH");
    });

    it("should only include enabled cores in activeCores", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true },
        { id: "flow", name: "Flow", weight: 1, enabled: false },
        { id: "ai", name: "AI", weight: 1, enabled: true }
      ];
      const input = [
        {
          instrument: "TEST",
          verdicts: [{ sourceId: "tech", verdict: "BUY", confidence: 0.6, rationale: "Test" }]
        }
      ];

      const payload = buildDashboardConfluencePayload(sources, input);

      expect(payload.cards[0].activeCores).toEqual(["Technical", "AI"]);
      expect(payload.cards[0].activeCores).not.toContain("Flow");
    });

    it("should include all evidence verdicts in cards", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true },
        { id: "flow", name: "Flow", weight: 1, enabled: true },
        { id: "news", name: "News", weight: 1, enabled: false }
      ];
      const input = [
        {
          instrument: "FULL_EVIDENCE",
          verdicts: [
            { sourceId: "tech", verdict: "BUY", confidence: 0.8, rationale: "Uptrend" },
            { sourceId: "flow", verdict: "BUY", confidence: 0.7, rationale: "Inflow" },
            { sourceId: "news", verdict: "SELL", confidence: 0.5, rationale: "Negative (but disabled)" }
          ]
        }
      ];

      const payload = buildDashboardConfluencePayload(sources, input);
      const card = payload.cards[0];

      expect(card.evidence).toHaveLength(3);
      expect(card.evidence.map((e) => e.sourceId)).toEqual(["tech", "flow", "news"]);
    });

    it("should use current timestamp for generatedAt and updatedAt", () => {
      const sources: SourceConfig[] = [
        { id: "tech", name: "Technical", weight: 1, enabled: true }
      ];
      const input = [
        {
          instrument: "NOW",
          verdicts: [{ sourceId: "tech", verdict: "HOLD", confidence: 0.5, rationale: "Neutral" }]
        }
      ];

      const beforeTime = new Date();
      const payload = buildDashboardConfluencePayload(sources, input);
      const afterTime = new Date();

      const generatedTime = new Date(payload.generatedAt);
      const updatedTime = new Date(payload.cards[0].updatedAt);

      expect(generatedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(generatedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
      expect(updatedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(updatedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});
