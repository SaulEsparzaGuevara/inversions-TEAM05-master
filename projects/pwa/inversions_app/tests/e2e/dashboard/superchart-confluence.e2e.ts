import React from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
        confidence: 0.77,
        confluenceScore: 78,
        riskLevel: "LOW",
        activeCores: ["technical", "ai"],
        updatedAt: new Date().toISOString(),
        evidence: [],
        metadata: {
          timing_d: "bullish",
          timing_h: "confirm"
        }
      }
    ]
  }))
}));

describe("dashboard superchart-confluence flow", () => {
  it("renders and refreshes orchestrator flow from filter bar", async () => {
    await act(async () => {
      render(<MainDashboard />);
    });

    expect(screen.getByText(/Dashboard de Confluencia/i)).toBeTruthy();

    const input = screen.getByPlaceholderText(/AAPL/i);
    fireEvent.change(input, { target: { value: "AAPL,MSFT" } });

    fireEvent.click(screen.getByRole("button", { name: /Actualizar/i }));

    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeTruthy();
    });
  });
});
