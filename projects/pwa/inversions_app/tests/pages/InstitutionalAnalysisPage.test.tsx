import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstitutionalAnalysisPage } from "../../src/pages/institutional/InstitutionalAnalysisPage";

vi.mock("../../src/services/institutional/institutionalApi", async () => {
  const actual = await vi.importActual<typeof import("../../src/services/institutional/institutionalApi")>(
    "../../src/services/institutional/institutionalApi"
  );
  return {
    ...actual,
    getInstitutionalAnalysis: vi.fn(async () => ({
      request: { ticker: "SPY", period: "daily", horizon: "medium", analysisId: "a1" },
      analysis: {
        analysisId: "a1", ticker: "SPY", period: "daily", volume: 1e6,
        liquidity: "high", horizon: "medium",       fundsOwnershipPct: 5,
        flows: { inflows: 1e6, outflows: 5e5, asOf: "2026-05-20" },
        openPositions: { count: 120 }
      },
      zones: {
        all: [
          { type: "support", price: 440, strength: 0.8, accumulatedVolume: 5e5, confidence: 0.85, confirmingSources: 3, touches: 4, liquidity: "high", asOf: "2026-05-20", notes: [] }
        ],
        support: [
          { type: "support", price: 440, strength: 0.8, accumulatedVolume: 5e5, confidence: 0.85, confirmingSources: 3, touches: 4, liquidity: "high", asOf: "2026-05-20", notes: [] }
        ],
        resistance: []
      },
      trends: {
        direction: "bullish", score: 0.7, confidence: 0.8, rationale: "Strong support at $440",
        supportStrength: 0.8, resistanceStrength: 0.4, flowBias: 0.6
      },
      metrics: {
        candlesAnalyzed: 100, zoneCount: 1, supportZoneCount: 1, resistanceZoneCount: 0,
        averageZoneStrength: 0.8, maxZoneStrength: 0.8, averageZoneConfidence: 0.85,
        sourceCount: 3, liquidity: "high", volume: 1e6, openPositions: 120,
        fundsOwnershipPct: 5, netFlow: 5e5
      },
      sourceReports: [
        { sourceId: "src-1", kind: "13F", label: "SEC Filing", status: "ok" as const, latencyMs: 120 }
      ],
      generatedAt: "2026-05-20T12:00:00.000Z"
    }))
  };
});

describe("InstitutionalAnalysisPage", () => {
  it("renders heading and search controls", async () => {
    render(<InstitutionalAnalysisPage />);

    expect(screen.getByText("Análisis Institucional")).toBeTruthy();
    expect(screen.getByPlaceholderText("AAPL")).toBeTruthy();
    expect(await screen.findByText("Buscar")).toBeTruthy();
  });

  it("renders trend and metrics cards after load", async () => {
    render(<InstitutionalAnalysisPage />);

    expect(await screen.findByText("Tendencia")).toBeTruthy();
    expect(await screen.findByText("Métricas")).toBeTruthy();
  });

  it("displays support zones", async () => {
    render(<InstitutionalAnalysisPage />);

    expect((await screen.findAllByText(/Soportes/)).length).toBeGreaterThan(0);
  });

  it("displays source reports", async () => {
    render(<InstitutionalAnalysisPage />);

    expect(await screen.findByText("Fuentes (1)")).toBeTruthy();
    expect(await screen.findByText("SEC Filing")).toBeTruthy();
  });
});
