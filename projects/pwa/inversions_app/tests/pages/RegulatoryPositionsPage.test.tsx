import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RegulatoryPositionsPage } from "../../src/pages/institutional/RegulatoryPositionsPage";

vi.mock("../../src/services/institutional/institutionalApi", () => ({
  getRegulatoryPositions: vi.fn(async () => ({
    request: { ticker: "AAPL", period: "quarterly", horizon: "long", analysisId: "a2" },
    analysis: {
      ticker: "AAPL", period: "quarterly", horizon: "long",
      fundsOwnershipPct: 0.08,
      flows: { inflows: 2e6, outflows: 1e6, asOf: "2026-05-20" },
      openPositions: { count: 200, notional: 5e7 }
    },
    positions13F: [
      { sourceId: "sec", asOf: "2026-05-20", count: 150, notional: 3e7, fundsOwnershipPct: 0.06, volume: 1e5, confidence: 0.9 }
    ],
    flows: { inflows: 2e6, outflows: 1e6, netFlow: 1e6, asOf: "2026-05-20" },
    sourceReports: [
      { sourceId: "src-1", kind: "13F", label: "SEC Filing", status: "ok" as const, tookMs: 100 }
    ],
    cacheHit: true,
    usedSourceIds: ["sec"]
  }))
}));

describe("RegulatoryPositionsPage", () => {
  it("renders heading and search controls", async () => {
    render(<RegulatoryPositionsPage />);

    expect(screen.getByText("Posiciones Regulatorias (13F)")).toBeTruthy();
    expect(await screen.findByText("Buscar")).toBeTruthy();
  });

  it("renders flow cards after load", async () => {
    render(<RegulatoryPositionsPage />);

    expect(await screen.findByText("Flujos Institucionales")).toBeTruthy();
    expect(await screen.findByText("Tenencia Institucional")).toBeTruthy();
  });

  it("displays 13F positions table", async () => {
    render(<RegulatoryPositionsPage />);

    expect(await screen.findByText("Posiciones 13F (1)")).toBeTruthy();
    expect((await screen.findAllByText("sec")).length).toBeGreaterThan(0);
  });

  it("shows cache badge", async () => {
    render(<RegulatoryPositionsPage />);

    expect(await screen.findByText("Cache")).toBeTruthy();
  });

  it("shows used source ids", async () => {
    render(<RegulatoryPositionsPage />);

    expect(await screen.findByText("Fuentes Consultadas")).toBeTruthy();
    expect((await screen.findAllByText("sec")).length).toBeGreaterThan(0);
  });
});
