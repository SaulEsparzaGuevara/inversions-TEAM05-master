import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIChatPage } from "../../src/pages/ai/AIChatPage";

vi.mock("../../src/services/ai/aiChatApi", () => ({
  submitChatQuestion: vi.fn(async () => ({
    status: "pending",
    contextId: "ctx-1",
    responseId: "resp-1",
    ai_unavailable: false,
    timestamp: new Date().toISOString()
  })),
  pollChatResponse: vi.fn(async () => ({
    status: "pending",
    contextId: "ctx-1",
    responseId: "resp-1",
    ai_unavailable: false,
    timestamp: new Date().toISOString()
  })),
  pollUntilComplete: vi.fn(async () => ({
    contextId: "ctx-1",
    responseId: "resp-1",
    ticker: "SPY",
    narrative: "Protective put is the best strategy for SPY.",
    reasoning: ["Downside protection at $440"],
    scenarioAnalysis: [
      { label: "Bull", description: "Market up 10%", protectionLevel: "low" as const, potentialPnL: 5000 },
      { label: "Bear", description: "Market down 10%", protectionLevel: "high" as const, potentialPnL: -2000 }
    ],
    recommendation: "protective_put",
    evidenceIds: ["src-1"],
    modelVersion: "gemini-2.5-flash",
    responseHash: "abc123",
    ai_unavailable: false,
    timestamp: new Date().toISOString()
  })),
  POLL_INTERVAL_MS: 50,
  MAX_POLL_ATTEMPTS: 3
}));

describe("AIChatPage", () => {
  it("renders heading and chat input", () => {
    render(<AIChatPage />);

    expect(screen.getByText("Chat IA — Coberturas")).toBeTruthy();
    expect(screen.getByPlaceholderText(/Ej:/)).toBeTruthy();
    expect(screen.getByText("Enviar")).toBeTruthy();
  });

  it("sends message and displays response", async () => {
    render(<AIChatPage />);

    const textarea = screen.getByPlaceholderText(/Ej:/);
    fireEvent.change(textarea, { target: { value: "Best strategy for SPY?" } });

    const btn = screen.getByText("Enviar");
    fireEvent.click(btn);

    expect(await screen.findByText("Protective put is the best strategy for SPY.")).toBeTruthy();
  });

  it("shows scenario analysis cards after response", async () => {
    render(<AIChatPage />);

    const textarea = screen.getByPlaceholderText(/Ej:/);
    fireEvent.change(textarea, { target: { value: "Analyze SPY" } });

    const btn = screen.getByText("Enviar");
    fireEvent.click(btn);

    expect(await screen.findByText("Análisis de Escenarios")).toBeTruthy();
    expect(await screen.findByText("Bull")).toBeTruthy();
    expect(await screen.findByText("Bear")).toBeTruthy();
  });

  it("disables send while polling", async () => {
    render(<AIChatPage />);

    const textarea = screen.getByPlaceholderText(/Ej:/);
    fireEvent.change(textarea, { target: { value: "Question" } });

    const btn = screen.getByText("Enviar");
    fireEvent.click(btn);

    expect(await screen.findByText("…")).toBeTruthy();
  });
});
