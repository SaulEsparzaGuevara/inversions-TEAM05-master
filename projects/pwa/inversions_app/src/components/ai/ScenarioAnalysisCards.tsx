/**
 * ============================================================================
 * ScenarioAnalysisCards.tsx
 * ============================================================================
 *
 * FIC: Scenario analysis cards — renders Gemini markdown response as visual cards.
 */

import React from "react";
import type { ScenarioAnalysisItem } from "../../services/ai/aiChatApi";

function protectionColor(level: string): string {
  switch (level) {
    case "high": return "var(--color-buy)";
    case "medium": return "var(--color-hold)";
    default: return "var(--color-sell)";
  }
}

function protectionLabel(level: string): string {
  switch (level) {
    case "high": return "Alta";
    case "medium": return "Media";
    default: return "Baja";
  }
}

interface ScenarioAnalysisCardsProps {
  scenarios: ScenarioAnalysisItem[];
}

export const ScenarioAnalysisCards: React.FC<ScenarioAnalysisCardsProps> = ({ scenarios }) => {
  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div className="card">
      <h4 style={{
        fontSize: "0.7rem",
        color: "var(--color-text-muted)",
        textTransform: "uppercase",
        margin: "0 0 0.75rem 0",
        letterSpacing: "0.05em"
      }}>
        Análisis de Escenarios
      </h4>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
      }}>
        {scenarios.map((scenario, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem",
            background: "var(--color-surface-raised)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8rem"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--color-text)", fontWeight: 600, marginBottom: "0.15rem" }}>
                {scenario.label}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
                {scenario.description}
              </div>
            </div>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "0.25rem",
              marginLeft: "0.75rem"
            }}>
              <span className="badge" style={{
                background: `${protectionColor(scenario.protectionLevel)}20`,
                color: protectionColor(scenario.protectionLevel),
                border: `1px solid ${protectionColor(scenario.protectionLevel)}`
              }}>
                {protectionLabel(scenario.protectionLevel)}
              </span>
              <span style={{
                color: scenario.potentialPnL >= 0 ? "var(--color-buy)" : "var(--color-sell)",
                fontWeight: 600,
                fontSize: "0.85rem"
              }}>
                ${scenario.potentialPnL.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
