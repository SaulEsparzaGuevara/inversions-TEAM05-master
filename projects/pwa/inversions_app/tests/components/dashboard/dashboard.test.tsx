import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CoreSelector } from "../../../src/features/dashboard/CoreSelector";
import { SignalOverlay } from "../../../src/features/dashboard/SignalOverlay";
import { ExplainabilityTable } from "../../../src/features/dashboard/ExplainabilityTable";
import { MainDashboard } from "../../../src/features/dashboard/MainDashboard";

vi.mock("../../../src/services/signals/signalApi", () => ({
  getDashboardOrchestrator: vi.fn(async () => ({
    timeframe: "1d",
    generatedAt: new Date().toISOString(),
    instruments: ["AAPL"],
    cards: [
      {
        signalId: "sig-1",
        instrument: "AAPL",
        signal: "BUY",
        confidence: 0.8,
        confluenceScore: 75,
        riskLevel: "LOW",
        activeCores: ["Technical"],
        updatedAt: new Date().toISOString(),
        evidence: []
      }
    ]
  }))
}));

describe("dashboard components", () => {
  it("renders CoreSelector and toggles selected core", () => {
    const onToggle = vi.fn();
    render(
      <CoreSelector
        cores={[
          { id: "tech", label: "Technical", description: "Momentum", enabled: true },
          { id: "flow", label: "Flow", description: "Orderflow", enabled: false }
        ]}
        onToggle={onToggle}
      />
    );

    const checkbox = screen.getByRole("checkbox", { name: /Technical/i });
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith("tech");
  });

  it("renders SignalOverlay with cards", () => {
    render(
      <SignalOverlay
        cards={[
          {
            signalId: "sig-1",
            instrument: "AAPL",
            signal: "BUY",
            confidence: 0.9,
            confluenceScore: 85,
            riskLevel: "LOW",
            activeCores: ["Technical", "AI"],
            updatedAt: new Date().toISOString(),
            evidence: []
          }
        ]}
      />
    );

    expect(screen.getByText("AAPL")).toBeTruthy();
    expect(screen.getByText("BUY")).toBeTruthy();
    expect(screen.getByText(/Confluencia/i)).toBeTruthy();
  });

  it("renders ExplainabilityTable rows", () => {
    render(
      <ExplainabilityTable
        cards={[
          {
            signalId: "sig-1",
            instrument: "AAPL",
            signal: "BUY",
            confidence: 0.7,
            confluenceScore: 66,
            riskLevel: "MEDIUM",
            activeCores: ["Technical"],
            updatedAt: new Date().toISOString(),
            evidence: [
              { sourceId: "tech", verdict: "BUY", confidence: 0.7, rationale: "trend" }
            ]
          }
        ]}
      />
    );

    expect(screen.getByText(/Explicabilidad/i)).toBeTruthy();
    expect(screen.getByText("AAPL")).toBeTruthy();
    expect(screen.getByText("66")).toBeTruthy();
  });

  it("renders MainDashboard base view", async () => {
    await act(async () => {
      render(<MainDashboard />);
    });

    expect(screen.getByText(/Dashboard de Confluencia/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/AAPL/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Actualizar/i })).toBeTruthy();
  });
});
