import type { SourceVerdict } from "../../services/signals/signalApi";

interface SignalEvidencePanelProps {
  evidence: SourceVerdict[];
}

export function SignalEvidencePanel({ evidence }: SignalEvidencePanelProps) {
  if (evidence.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>No hay evidencia disponible para este instrumento.</p>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.5rem" }}>
      {evidence.map((item) => (
        <li
          key={item.sourceId}
          style={{
            background: "var(--color-surface-raised)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-sm)",
            padding: "0.65rem 0.75rem",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "0.25rem 1rem",
            alignItems: "start"
          }}
        >
          <div>
            <strong style={{ fontSize: "0.875rem", textTransform: "capitalize" }}>{item.sourceId}</strong>
            <p style={{ marginTop: "0.2rem", fontSize: "0.8rem" }}>{item.rationale}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              style={{
                display: "block",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: item.verdict === "BUY" ? "var(--color-buy)" : item.verdict === "SELL" ? "var(--color-sell)" : "var(--color-hold)"
              }}
            >
              {item.verdict}
            </span>
            <small style={{ color: "var(--color-text-muted)" }}>{Math.round(item.confidence * 100)}%</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
