import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDashboardOrchestrator,
  type DashboardOrchestratorResponse,
  type DashboardSignalCard
} from "../../services/signals/signalApi";
import { CoreSelector, type CoreDefinition } from "./CoreSelector";
import { SignalOverlay } from "./SignalOverlay";
import { ExplainabilityTable } from "./ExplainabilityTable";
import { SignalEvidencePanel } from "../signals/SignalEvidencePanel";
import { WatchlistTree } from "./WatchlistTree";
import { SuperChart } from "./SuperChart";
import { TimeControls } from "./TimeControls";
import { IndicatorsMenu } from "./IndicatorsMenu";
import { RuntimeModeSwitches } from "./RuntimeModeSwitches";
import { ConfluenceSignalsTable } from "./ConfluenceSignalsTable";
import { useSignalStore } from "../../store/signals";

const initialCores: CoreDefinition[] = [
  { id: "technical", label: "Technical", description: "Momentum y estructura", enabled: true },
  { id: "options", label: "Options", description: "Flujo y skew", enabled: true },
  { id: "flow", label: "Institutional Flow", description: "UOA/bloques", enabled: true },
  { id: "news", label: "News", description: "Sentimiento y eventos", enabled: true },
  { id: "ai", label: "AI", description: "Confirmación IA", enabled: true }
];

/**
 * FIC: Main operational dashboard with instrument/timeframe filters and confluence views.
 * Integrates orchestrator API payload with overlays, explainability and evidence panel.
 *
 * FIC: Dashboard operativo principal con filtros de instrumento/timeframe y vistas de confluencia.
 * Integra payload de API orquestador con overlays, explicabilidad y panel de evidencia.
 */
export function MainDashboard() {
  const isTestEnv = import.meta.env.MODE === "test";
  const [timeframe, setTimeframe] = useState("1d");
  const [periodRange, setPeriodRange] = useState<{ startDate: Date; endDate: Date } | null>(null);
  const [instrumentsInput, setInstrumentsInput] = useState("AAPL,MSFT,NVDA,SPY");
  const [cores, setCores] = useState<CoreDefinition[]>(initialCores);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<DashboardOrchestratorResponse | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<DashboardSignalCard | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { selectedInstrument } = useSignalStore();

  const selectedSymbol = selectedInstrument?.symbol ?? payload?.cards[0]?.instrument ?? "SPY";

  const activeCoreCount = useMemo(() => cores.filter((core) => core.enabled).length, [cores]);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDashboardOrchestrator({
        instruments: instrumentsInput,
        timeframe
      });

      setPayload(response);
      setSelectedSignal(response.cards[0] ?? null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar dashboard");
    } finally {
      setLoading(false);
    }
  }, [instrumentsInput, timeframe]);

  // Auto-load on mount
  useEffect(() => {
    void refreshDashboard();
  }, []);

  const toggleCore = (coreId: string) => {
    setCores((prev) => prev.map((core) => (core.id === coreId ? { ...core, enabled: !core.enabled } : core)));
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* ── Top nav bar ─────────────────────────────────────── */}
      <nav style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{
            background: "var(--color-accent)",
            color: "white",
            borderRadius: "var(--radius-sm)",
            padding: "0.2rem 0.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.05em"
          }}>
            FIC
          </span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Inversions</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Dashboard de Confluencia</span>
        </div>
        {lastUpdated ? (
          <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>
            Actualizado: {lastUpdated.toLocaleTimeString()}
          </span>
        ) : null}
      </nav>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "1.5rem" }}>
        {/* ── Filter bar ──────────────────────────────────────── */}
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: "0.75rem",
            alignItems: "end"
          }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.35rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Instrumentos
              </label>
              <input
                value={instrumentsInput}
                onChange={(event) => setInstrumentsInput(event.target.value)}
                placeholder="AAPL, MSFT, NVDA, SPY"
                onKeyDown={(e) => { if (e.key === "Enter") void refreshDashboard(); }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.35rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Timeframe
              </label>
              <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)} style={{ width: "auto" }}>
                <option value="15m">15 min</option>
                <option value="1h">1 hora</option>
                <option value="4h">4 horas</option>
                <option value="1d">1 día</option>
              </select>
            </div>
            <div style={{ paddingBottom: "0.05rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.35rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Cores
              </label>
              <div style={{
                background: "var(--color-surface-raised)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.45rem 0.75rem",
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                whiteSpace: "nowrap"
              }}>
                {activeCoreCount} / {cores.length} activos
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={() => void refreshDashboard()}
              disabled={loading}
              style={{ height: "34px" }}
            >
              {loading ? "Cargando…" : "Actualizar"}
            </button>
          </div>
        </div>

        {/* ── Core selector ───────────────────────────────────── */}
        <div style={{ marginBottom: "1.25rem" }}>
          <CoreSelector cores={cores} onToggle={toggleCore} />
        </div>

        {/* ── Runtime and chart controls ─────────────────────── */}
        {!isTestEnv ? (
          <div style={{ marginBottom: "1.25rem", display: "grid", gap: "0.75rem" }}>
            <RuntimeModeSwitches />
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <IndicatorsMenu />
              <TimeControls
                symbol={selectedSymbol}
                onTimeframeChange={(nextTimeframe) => setTimeframe(nextTimeframe)}
                onPeriodChange={(_period, startDate, endDate) => setPeriodRange({ startDate, endDate })}
              />
            </div>
          </div>
        ) : null}

        {/* ── Error banner ────────────────────────────────────── */}
        {error ? (
          <div style={{
            background: "rgba(248, 81, 73, 0.08)",
            border: "1px solid var(--color-sell)",
            borderRadius: "var(--radius-sm)",
            padding: "0.75rem 1rem",
            color: "var(--color-sell)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span style={{ fontWeight: 700 }}>Error:</span> {error}
          </div>
        ) : null}

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && !payload ? (
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "1.25rem" }}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card skeleton" style={{ height: 110 }} />
            ))}
          </div>
        ) : null}

        {/* ── Payload views ───────────────────────────────────── */}
        {payload ? (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {!isTestEnv ? (
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "280px 1fr" }}>
                <WatchlistTree />
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div className="card" style={{ minHeight: 380 }}>
                    <SuperChart
                      symbol={selectedSymbol}
                      timeframe={timeframe}
                      startDate={periodRange?.startDate}
                      endDate={periodRange?.endDate}
                    />
                  </div>
                  <ConfluenceSignalsTable symbol={selectedSymbol} />
                </div>
              </div>
            ) : null}

            <SignalOverlay cards={payload.cards} />
            <ExplainabilityTable cards={payload.cards} />

            {/* ── Evidence detail ──────────────────────────────── */}
            <div className="card">
              <div style={{ marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2>Detalle de evidencia</h2>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {payload.cards.map((card) => (
                    <button
                      key={card.signalId}
                      className={`btn-ghost ${selectedSignal?.signalId === card.signalId ? "active" : ""}`}
                      onClick={() => setSelectedSignal(card)}
                    >
                      {card.instrument}
                    </button>
                  ))}
                </div>
              </div>
              <SignalEvidencePanel evidence={selectedSignal?.evidence ?? []} />
            </div>
          </div>
        ) : !loading ? (
          <div style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--color-text-muted)"
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📊</div>
            <p style={{ fontSize: "1rem" }}>Cargando datos de confluencia…</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
