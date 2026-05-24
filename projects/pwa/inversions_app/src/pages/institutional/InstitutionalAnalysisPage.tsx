/**
 * ============================================================================
 * InstitutionalAnalysisPage.tsx
 * ============================================================================
 *
 * FIC: Institutional analysis page — S/R zones table, trend card, metrics, catalyst windows, source reports.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  getInstitutionalAnalysis,
  type InstitutionalAnalysisResponse,
  type InstitutionalZone
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

function ZoneRow({ zone }: { zone: InstitutionalZone }) {
  const color = zone.type === "support" ? "var(--color-buy)" : "var(--color-sell)";
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 0",
      borderBottom: "1px solid var(--color-border-subtle)",
      fontSize: "0.85rem"
    }}>
      <span style={{
        fontWeight: 600,
        color,
        minWidth: "70px"
      }}>
        ${zone.price.toFixed(2)}
      </span>
      <span style={{ color: "var(--color-text-muted)", minWidth: "60px" }}>
        {(zone.strength * 100).toFixed(0)}%
      </span>
      <span style={{ color: "var(--color-text-muted)", minWidth: "60px" }}>
        {(zone.confidence * 100).toFixed(0)}%
      </span>
      <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
        {zone.touches} toques
      </span>
    </div>
  );
}

function TrendBadge({ direction }: { direction: string }) {
  const color = direction === "bullish"
    ? "var(--color-buy)"
    : direction === "bearish"
    ? "var(--color-sell)"
    : "var(--color-hold)";
  const label = direction === "bullish"
    ? "Alcista"
    : direction === "bearish"
    ? "Bajista"
    : "Neutral";
  return (
    <span className="badge" style={{
      background: `${color}20`,
      color,
      border: `1px solid ${color}`
    }}>
      {label}
    </span>
  );
}

export function InstitutionalAnalysisPage() {
  const [ticker, setTicker] = useState("SPY");
  const [period, setPeriod] = useState<"intraday" | "daily" | "weekly" | "monthly" | "quarterly">("daily");
  const [horizon, setHorizon] = useState<"short" | "medium" | "long">("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InstitutionalAnalysisResponse | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getInstitutionalAnalysis({ ticker: ticker.trim(), period, horizon });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar análisis");
    } finally {
      setLoading(false);
    }
  }, [ticker, period, horizon]);

  useEffect(() => {
    void fetchAnalysis();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)" }}>
        Análisis Institucional
      </h1>

      {/* Search Controls */}
      <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Ticker
          </label>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{ width: "100px", padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Período
          </label>
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
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Horizonte
          </label>
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
          onClick={fetchAnalysis}
          disabled={loading || !ticker.trim()}
          style={{ padding: "0.5rem 1.5rem" }}
        >
          {loading ? "Analizando…" : "Buscar"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: "var(--color-sell)", color: "var(--color-sell)" }}>
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="skeleton" style={{ height: "20px", width: "60%" }} />
          <div className="skeleton" style={{ height: "20px", width: "40%" }} />
          <div className="skeleton" style={{ height: "100px" }} />
        </div>
      )}

      {/* Data Display */}
      {data && (
        <>
          {/* Trend & Metrics Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Trend Card */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Tendencia
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <TrendBadge direction={data.trends.direction} />
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Score: {(data.trends.score * 100).toFixed(0)}%
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Confianza: {(data.trends.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text)", lineHeight: 1.5 }}>
                {data.trends.rationale}
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                <span>Soporte: {(data.trends.supportStrength * 100).toFixed(0)}%</span>
                <span>Resistencia: {(data.trends.resistanceStrength * 100).toFixed(0)}%</span>
                <span>Flujo: {(data.trends.flowBias * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Métricas
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div><span style={{ color: "var(--color-text-muted)" }}>Velas: </span><span style={{ color: "var(--color-text)" }}>{data.metrics.candlesAnalyzed}</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Zonas: </span><span style={{ color: "var(--color-text)" }}>{data.metrics.zoneCount}</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Soportes: </span><span style={{ color: "var(--color-buy)" }}>{data.metrics.supportZoneCount}</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Resistencias: </span><span style={{ color: "var(--color-sell)" }}>{data.metrics.resistanceZoneCount}</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Fuerza prom.: </span><span style={{ color: "var(--color-text)" }}>{(data.metrics.averageZoneStrength * 100).toFixed(0)}%</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Confianza prom.: </span><span style={{ color: "var(--color-text)" }}>{(data.metrics.averageZoneConfidence * 100).toFixed(0)}%</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Volumen: </span><span style={{ color: "var(--color-text)" }}>{(data.metrics.volume / 1e6).toFixed(2)}M</span></div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Flujo neto: </span><span style={{ color: data.metrics.netFlow >= 0 ? "var(--color-buy)" : "var(--color-sell)" }}>${(data.metrics.netFlow / 1e6).toFixed(2)}M</span></div>
              </div>
            </div>
          </div>

          {/* Zones */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Support Zones */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-buy)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Soportes ({data.zones.support.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "70px 60px 60px 1fr", gap: "0.25rem", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", padding: "0.25rem 0", borderBottom: "1px solid var(--color-border)" }}>
                <span>Precio</span>
                <span>Fuerza</span>
                <span>Confianza</span>
                <span>Toques</span>
              </div>
              {data.zones.support.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "0.5rem 0" }}>Sin zonas de soporte detectadas.</p>
              ) : (
                data.zones.support.slice(0, 10).map((zone, i) => <ZoneRow key={i} zone={zone} />)
              )}
            </div>

            {/* Resistance Zones */}
            <div className="card">
              <h2 style={{ fontSize: "0.75rem", color: "var(--color-sell)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                Resistencias ({data.zones.resistance.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "70px 60px 60px 1fr", gap: "0.25rem", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", padding: "0.25rem 0", borderBottom: "1px solid var(--color-border)" }}>
                <span>Precio</span>
                <span>Fuerza</span>
                <span>Confianza</span>
                <span>Toques</span>
              </div>
              {data.zones.resistance.length === 0 ? (
                <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", padding: "0.5rem 0" }}>Sin zonas de resistencia detectadas.</p>
              ) : (
                data.zones.resistance.slice(0, 10).map((zone, i) => <ZoneRow key={i} zone={zone} />)
              )}
            </div>
          </div>

          {/* Source Reports */}
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

          {/* Last Updated */}
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textAlign: "right" }}>
            Actualizado: {new Date(data.generatedAt).toLocaleString("es-MX")}
          </p>
        </>
      )}
    </div>
  );
}
