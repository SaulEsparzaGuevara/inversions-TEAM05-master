import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoverageStrategiesPage } from "../../src/pages/coverage/CoverageStrategiesPage";

const mockResults = [
  {
    engineId: "eng-1",
    strategyKind: "protective_put",
    ticker: "SPY",
    shares: 100,
    currentPrice: 450,
    payoff: {
      baselinePrice: 450,
      breakevenPrice: 452.5,
      maxProfit: null,
      maxLoss: 1500,
      description: "Protective put",
      points: [
        { label: "-10%", movePct: -10, underlyingPrice: 405, pnl: -3500, pnlPct: -7.8, notes: [] },
        { label: "0%", movePct: 0, underlyingPrice: 450, pnl: 0, pnlPct: 0, notes: [] },
        { label: "+10%", movePct: 10, underlyingPrice: 495, pnl: 4500, pnlPct: 10, notes: [] }
      ]
    },
    riskMetrics: {
      riskProfile: "limited" as const,
      maxProtection: 5000,
      protectionFloorPrice: 427.5,
      netPremium: 250,
      netPremiumPerShare: 2.5,
      costBenefitRatio: 0.15,
      downsideRisk: 2250,
      upsideCap: null,
      breakEvenPrice: 452.5,
      stopLossPrice: 420
    },
    alerts: [
      { code: "STOP_LOSS", severity: "warning" as const, message: "Stop loss at $420", recommendation: "Monitor price" }
    ],
    generatedAt: "2026-05-20T12:00:00.000Z"
  }
];

vi.mock("../../src/services/coverage/coverageApi", () => ({
  postCoverageAnalyze: vi.fn(async () => ({
    results: mockResults,
    generatedAt: "2026-05-20T12:00:00.000Z"
  }))
}));

vi.mock("../../src/components/coverage/PayoffChart", () => ({
  PayoffChart: ({ strategyLabel }: { strategyLabel: string }) =>
    React.createElement("div", { "data-testid": "payoff-chart" }, strategyLabel)
}));

describe("CoverageStrategiesPage", () => {
  it("renders heading and controls", () => {
    render(<CoverageStrategiesPage />);

    expect(screen.getByText("Estrategias de Cobertura")).toBeTruthy();
    expect(screen.getByPlaceholderText("440, 450, 460")).toBeTruthy();
    expect(screen.getByText("Simular")).toBeTruthy();
  });

  it("shows warning when strikes are empty", () => {
    render(<CoverageStrategiesPage />);

    fireEvent.change(screen.getByPlaceholderText("440, 450, 460"), { target: { value: "" } });

    expect(screen.getByText(/Las cadenas de opciones no están disponibles/)).toBeTruthy();
  });

  it("renders strategy cards after simulate", async () => {
    render(<CoverageStrategiesPage />);

    const input = screen.getByPlaceholderText("440, 450, 460");
    fireEvent.change(input, { target: { value: "440, 460" } });

    const btn = screen.getByText("Simular");
    fireEvent.click(btn);

    expect(await screen.findByText("Protective Put")).toBeTruthy();
    expect(await screen.findByTestId("payoff-chart")).toBeTruthy();
  });

  it("shows risk profile badge", async () => {
    render(<CoverageStrategiesPage />);

    const input = screen.getByPlaceholderText("440, 450, 460");
    fireEvent.change(input, { target: { value: "440, 460" } });

    const btn = screen.getByText("Simular");
    fireEvent.click(btn);

    expect(await screen.findByText("Riesgo Limitado")).toBeTruthy();
  });

  it("shows alerts section", async () => {
    render(<CoverageStrategiesPage />);

    const input = screen.getByPlaceholderText("440, 450, 460");
    fireEvent.change(input, { target: { value: "440, 460" } });

    const btn = screen.getByText("Simular");
    fireEvent.click(btn);

    expect(await screen.findByText("Alertas")).toBeTruthy();
    expect(await screen.findByText(/Stop loss/)).toBeTruthy();
  });

  it("shows empty state initially", () => {
    render(<CoverageStrategiesPage />);

    expect(screen.getByText(/Ingresa un ticker/)).toBeTruthy();
  });
});
