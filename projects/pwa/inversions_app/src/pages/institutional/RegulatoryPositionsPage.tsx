import React, { useCallback, useEffect, useState } from "react";
import {
  getRegulatoryPositions,
  type RegulatoryPositionsResponse
} from "../../services/institutional/institutionalApi";

const periods = [
  { value: "intraday", label: "Intradía" },
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" }
] as const;

const horizons = [
  { value: "short", label: "Corto" },
  { value: "medium", label: "Mediano" },
  { value: "long", label: "Largo" }
] as const;

export function RegulatoryPositionsPage() {
  const [ticker, setTicker] = useState("SPY");
  const [period, setPeriod] = useState<"intraday" | "daily" | "weekly" | "monthly" | "quarterly">("quarterly");
  const [horizon, setHorizon] = useState<"short" | "medium" | "long">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RegulatoryPositionsResponse | null>(null);

  const fetchPositions = useCallback(async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getRegulatoryPositions({ ticker: ticker.trim(), period, horizon });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar posiciones");
    } finally {
      setLoading(false);
    }
  }, [ticker, period, horizon]);

  useEffect(() => {
    void fetchPositions();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)" }}>
        Posiciones Regulatorias (13F)
      </h1>

      {/* Search Controls */}
      <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Ticker</label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{ width: "100px", padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Período</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
            style={{ padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }}
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Horizonte</label>
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value as typeof horizon)}
            style={{ padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }}
          >
            {horizons.map((h) => (
              <option key={h.value} value={h.value}>{h.label}</option>
            ))}
          </select>
        </div>
        <button
          className="btn-primary"
          onClick={fetchPositions}
          disabled={loading || !ticker.trim()}
          style={{ padding: "0.5rem 1.5rem" }}
        >
          {loading ? "Consultando…" : "Buscar"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: "var(--color-sell)", color: "var(--color-sell)" }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="skeleton" style={{ height: "20px", width: "50%" }} />
          <div className="skeleton" style={{ height: "20px", width: "30%" }} />
          <div className="skeleton" style={{ height: "120px" }} />
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Summary Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Flows Card */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Flujos Institucionales
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Inflows: </span>
                  <span style={{ color: "var(--color-buy)" }}>${(data.flows.inflows / 1e6).toFixed(2)}M</span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Outflows: </span>
                  <span style={{ color: "var(--color-sell)" }}>${(data.flows.outflows / 1e6).toFixed(2)}M</span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Flujo Neto: </span>
                  <span style={{ color: data.flows.netFlow >= 0 ? "var(--color-buy)" : "var(--color-sell)", fontWeight: 600 }}>
                    ${(data.flows.netFlow / 1e6).toFixed(2)}M
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Corte: </span>
                  <span style={{ color: "var(--color-text)" }}>{new Date(data.flows.asOf).toLocaleDateString("es-MX")}</span>
                </div>
              </div>
            </div>

            {/* Ownership Card */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Tenencia Institucional
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Participación: </span>
                  <span style={{ color: "var(--color-text)" }}>{(data.analysis.fundsOwnershipPct * 100).toFixed(2)}%</span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Posiciones: </span>
                  <span style={{ color: "var(--color-text)" }}>{data.analysis.openPositions.count}</span>
                </div>
                {data.analysis.openPositions.notional !== undefined && (
                  <div>
                    <span style={{ color: "var(--color-text-muted)" }}>Nocional: </span>
                    <span style={{ color: "var(--color-text)" }}>${(data.analysis.openPositions.notional / 1e6).toFixed(2)}M</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Cache: </span>
                  <span className={`badge ${data.cacheHit ? "badge-medium" : "badge-low"}`}>
                    {data.cacheHit ? "Cache" : "Fresh"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 13F Table */}
          <div className="card">
            <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Posiciones 13F ({data.positions13F.length})
            </h2>
            {data.positions13F.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "0.5rem 0" }}>
                No se encontraron posiciones 13F para {data.request.ticker}.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Fecha</th>
                    <th>Posiciones</th>
                    <th>Nocional</th>
                    <th>Participación</th>
                    <th>Volumen</th>
                    <th>Confianza</th>
                  </tr>
                </thead>
                <tbody>
                  {data.positions13F.map((pos, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{pos.sourceId}</td>
                      <td>{new Date(pos.asOf).toLocaleDateString("es-MX")}</td>
                      <td>{pos.count.toLocaleString()}</td>
                      <td>{pos.notional ? `$${(pos.notional / 1e6).toFixed(2)}M` : "—"}</td>
                      <td>{pos.fundsOwnershipPct !== undefined ? `${(pos.fundsOwnershipPct * 100).toFixed(2)}%` : "—"}</td>
                      <td>{pos.volume !== undefined ? pos.volume.toLocaleString() : "—"}</td>
                      <td>
                        <span className={`badge ${pos.confidence >= 0.7 ? "badge-low" : pos.confidence >= 0.4 ? "badge-medium" : "badge-high"}`}>
                          {(pos.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Source Reports */}
          {data.sourceReports.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Fuentes ({data.sourceReports.length})
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {data.sourceReports.map((report) => (
                  <div key={report.sourceId} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.4rem 0.5rem",
                    background: "var(--color-surface-raised)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem"
                  }}>
                    <div>
                      <span style={{ color: "var(--color-text)", fontWeight: 600 }}>{report.label}</span>
                      <span style={{ color: "var(--color-text-muted)", marginLeft: "0.5rem" }}>— {report.kind}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <span className={`badge badge-${report.status === "ok" ? "low" : report.status === "cached" ? "medium" : "high"}`}>
                        {report.status === "ok" ? "OK" : report.status === "cached" ? "Cache" : "Error"}
                      </span>
                      <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{report.tookMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Used Source IDs */}
          {data.usedSourceIds.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Fuentes Consultadas
              </h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {data.usedSourceIds.map((id) => (
                  <span key={id} className="badge badge-medium">{id}</span>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right" }}>
            Actualizado: {new Date().toLocaleString("es-MX")}
          </p>
        </>
      )}
    </div>
  );
}
