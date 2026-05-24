import React from "react";
import type { DashboardSignalCard } from "../../services/signals/signalApi";

interface SignalOverlayProps {
  cards: DashboardSignalCard[];
}

function signalBadgeClass(signal: DashboardSignalCard["signal"]) {
  if (signal === "BUY") return "badge badge-buy";
  if (signal === "SELL") return "badge badge-sell";
  return "badge badge-hold";
}

function riskBadgeClass(risk: DashboardSignalCard["riskLevel"]) {
  if (risk === "LOW") return "badge badge-low";
  if (risk === "HIGH") return "badge badge-high";
  return "badge badge-medium";
}

function confluenceBar(score: number) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "var(--color-buy)" : pct >= 45 ? "var(--color-hold)" : "var(--color-sell)";
  return (
    <div style={{ marginTop: "0.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Confluencia</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--color-border)" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: color, transition: "width 0.4s" }} />
      </div>
    </div>
  );
}

/**
 * FIC: Visual overlay for confluence signals by instrument/core confidence.
 * Provides quick operational scan for BUY/SELL/HOLD at a glance.
 *
 * FIC: Overlay visual de señales de confluencia por instrumento/confianza de core.
 * Provee escaneo operativo rápido de BUY/SELL/HOLD de un vistazo.
 */
export function SignalOverlay({ cards }: SignalOverlayProps) {
  return (
    <section>
      <h2 style={{ marginBottom: "0.75rem" }}>Overlay de señales</h2>
      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        {cards.map((card) => (
          <article
            key={card.signalId}
            className="card"
            title={`Timing D: ${card.metadata?.timing_d ?? "n/a"} | Timing H: ${card.metadata?.timing_h ?? "n/a"} | Stop: ${card.metadata?.stop ?? "n/a"} | Objetivo: ${card.metadata?.objetivo ?? "n/a"}`}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.04em" }}>{card.instrument}</div>
                <div style={{ marginTop: "0.25rem" }}>
                  <span className={riskBadgeClass(card.riskLevel)} style={{ fontSize: "0.65rem" }}>
                    Riesgo {card.riskLevel}
                  </span>
                </div>
              </div>
              <span className={signalBadgeClass(card.signal)}>{card.signal}</span>
            </div>
            {confluenceBar(card.confluenceScore)}
            <div style={{ marginTop: "0.6rem", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Confianza: <strong style={{ color: "var(--color-text)" }}>{Math.round(card.confidence * 100)}%</strong>
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                {card.activeCores.length} cores
              </span>
            </div>

            {/* FIC: Top indicator panel style summary (EN) */}
            {/* FIC: Resumen tipo panel superior de indicadores (ES) */}
            <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <span className="badge badge-low">Timing {card.metadata?.timing_d ?? "-"}</span>
              <span className="badge badge-medium">Divergencia {card.metadata?.divergencia ?? "-"}</span>
              <span className="badge badge-hold">Z {card.metadata?.z_extrema ?? "-"}</span>
            </div>

            {/* FIC: Bottom indicator panel style summary (EN) */}
            {/* FIC: Resumen tipo panel inferior de indicadores (ES) */}
            <div style={{ marginTop: "0.4rem", display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <span className="badge badge-buy">Bid {card.metadata?.bid ?? "-"}</span>
              <span className="badge badge-sell">Ask {card.metadata?.ask ?? "-"}</span>
              <span className="badge badge-medium">Riesgo {card.metadata?.riesgo ?? "-"}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
