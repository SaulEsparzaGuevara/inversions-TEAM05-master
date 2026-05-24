/**
 * ============================================================================
 * AIChatPage.tsx
 * ============================================================================
 *
 * FIC: AI chat page — message history bubbles, context inputs (ticker/price), polling states, degradation banner.
 */

import React, { useCallback, useRef, useState } from "react";
import { useChatStore } from "../../store/chat";
import {
  submitChatQuestion,
  pollUntilComplete
} from "../../services/ai/aiChatApi";
import { ChatHistory } from "../../components/ai/ChatHistory";
import { ScenarioAnalysisCards } from "../../components/ai/ScenarioAnalysisCards";

export function AIChatPage() {
  const [ticker, setTicker] = useState("SPY");
  const [currentPrice, setCurrentPrice] = useState("450");
  const [input, setInput] = useState("");
  const [polling, setPolling] = useState(false);
  const [pollAttempt, setPollAttempt] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    addMessage,
    updateMessageStatus,
    incrementPolling,
    setAiUnavailable,
    setContext,
    scenarios,
    isAiUnavailable
  } = useChatStore();

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || polling) return;

    const price = parseFloat(currentPrice);
    if (!ticker.trim() || isNaN(price) || price <= 0) return;

    setInput("");
    setPollAttempt(0);

    const msgId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    addMessage({
      id: msgId,
      role: "user",
      content: msg,
      timestamp: new Date().toISOString(),
      status: "completed"
    });

    const assistId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    addMessage({
      id: assistId,
      role: "assistant",
      content: "Analizando…",
      timestamp: new Date().toISOString(),
      status: "pending"
    });

    setPolling(true);

    try {
      const pollResponse = await submitChatQuestion({
        ticker: ticker.trim().toUpperCase(),
        currentPrice: price,
        question: msg,
        zones: {
          zones: [],
          analysis: { ticker: ticker.trim().toUpperCase(), period: "daily", horizon: "medium" } as any,
          candlesAnalyzed: 0,
          sourceReports: [],
          generatedAt: new Date().toISOString()
        }
      });

      if (pollResponse.ai_unavailable) {
        updateMessageStatus(assistId, "error");
        setAiUnavailable(true);
        setPolling(false);
        return;
      }

      if (!pollResponse.responseId) {
        updateMessageStatus(assistId, "error");
        setAiUnavailable(true);
        setPolling(false);
        return;
      }

      updateMessageStatus(assistId, "processing", pollResponse.responseId);

      const completed = await pollUntilComplete(pollResponse.responseId, (attempt) => {
        setPollAttempt(attempt);
        incrementPolling(assistId);
      });

      updateMessageStatus(assistId, "completed");
      addMessage({
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: completed.narrative,
        timestamp: completed.timestamp,
        status: "completed"
      });

      if (completed.scenarioAnalysis && completed.scenarioAnalysis.length > 0) {
        setContext({ scenarios: completed.scenarioAnalysis });
      }

      if (completed.ai_unavailable) {
        setAiUnavailable(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "AI_NO_AVAILABLE" || msg === "POLL_TIMEOUT") {
        setAiUnavailable(true);
      }
      updateMessageStatus(assistId, "error");
    } finally {
      setPolling(false);
      setPollAttempt(0);
    }
  }, [input, ticker, currentPrice, polling, addMessage, updateMessageStatus, incrementPolling, setAiUnavailable]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleRetry = () => {
    setAiUnavailable(false);
    setPollAttempt(0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      height: "calc(100vh - 3rem)",
      maxHeight: "calc(100vh - 3rem)"
    }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
        Chat IA — Coberturas
      </h1>

      {/* Context Controls */}
      <div className="card" style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-end",
        flexWrap: "wrap",
        padding: "0.65rem 1rem"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Ticker</label>
          <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
            style={{ width: "80px", padding: "0.4rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)", fontSize: "0.85rem" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Precio</label>
          <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} step="0.01"
            style={{ width: "80px", padding: "0.4rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)", fontSize: "0.85rem" }} />
        </div>
      </div>

      {/* Degradation Banner */}
      {isAiUnavailable && (
        <div className="card" style={{ borderColor: "var(--color-sell)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
            <p style={{ color: "var(--color-sell)", fontSize: "0.85rem", margin: 0 }}>
              El servicio de IA no está disponible en este momento.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn-primary" onClick={handleRetry}
                style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}>
                Reintentar
              </button>
              <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer"
                className="btn-ghost"
                style={{ padding: "0.4rem 1rem", fontSize: "0.8rem", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                AI Studio
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="card" style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}>
        <ChatHistory />
      </div>

      {/* Polling Progress */}
      {polling && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          padding: "0 0.5rem"
        }}>
          <div className="skeleton" style={{ width: "12px", height: "12px", borderRadius: "50%" }} />
          <span>Consultando IA... {pollAttempt > 0 ? `(${pollAttempt}/15)` : ""}</span>
        </div>
      )}

      {/* Scenario Analysis */}
      {scenarios.length > 0 && (
        <ScenarioAnalysisCards scenarios={scenarios} />
      )}

      {/* Input Area */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: ¿Cuál es la mejor cobertura para SPY con strikes 440/460?"
          disabled={polling}
          rows={2}
          style={{
            flex: 1,
            padding: "0.6rem",
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text)",
            fontSize: "0.85rem",
            resize: "none",
            fontFamily: "inherit"
          }}
        />
        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={polling || !input.trim() || !ticker.trim()}
          style={{ padding: "0.5rem 1.5rem", alignSelf: "flex-end" }}
        >
          {polling ? "…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
