import React from "react";
import type { DashboardSignalCard } from "../../services/signals/signalApi";

interface ExplainabilityTableProps {
  cards: DashboardSignalCard[];
}

/**
 * FIC: Explainability matrix with score, confidence and evidence source count.
 * Supports audit and operator decision with concise transparent metrics.
 *
 * FIC: Matriz de explicabilidad con score, confianza y conteo de fuentes de evidencia.
 * Soporta auditoría y decisión de operador con métricas concisas y transparentes.
 */
export function ExplainabilityTable({ cards }: ExplainabilityTableProps) {
  return (
    <section className="card">
      <h2 style={{ marginBottom: "0.75rem" }}>Explicabilidad</h2>
      <table>
        <thead>
          <tr>
            <th>Instrumento</th>
            <th>Señal</th>
            <th>Score</th>
            <th>Confianza</th>
            <th>Fuentes</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.signalId}>
              <td><strong>{card.instrument}</strong></td>
              <td>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: card.signal === "BUY" ? "var(--color-buy)" : card.signal === "SELL" ? "var(--color-sell)" : "var(--color-hold)"
                  }}
                >
                  {card.signal}
                </span>
              </td>
              <td>{card.confluenceScore}</td>
              <td>{Math.round(card.confidence * 100)}%</td>
              <td>{card.evidence.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
