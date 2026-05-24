import React, { useCallback, useState } from "react";
import {
  postCoverageAnalyze,
  type CoverageAnalyzeRequest,
  type CoverageStrategyResult
} from "../../services/coverage/coverageApi";
import { PayoffChart } from "../../components/coverage/PayoffChart";

const strategyLabels: Record<string, string> = {
  protective_put: "Protective Put",
  married_put: "Married Put",
  collar_put: "Collar",
  covered_straddle: "Covered Straddle"
};

const strategyDescriptions: Record<string, string> = {
  protective_put: "Compra de acciones + Put protector. Riesgo limitado, upside ilimitado.",
  married_put: "Compra de acciones + Put ATM. Prima más alta, protección inmediata.",
  collar_put: "Compra de acciones + Put protector + Call cubierto. Riesgo limitado, upside limitado.",
  covered_straddle: "Acciones + Short Put + Short Call. Prima máxima, riesgo ilimitado."
};

function severityColor(severity: string): string {
  switch (severity) {
    case "critical": return "var(--color-sell)";
    case "warning": return "var(--color-hold)";
    default: return "var(--color-accent)";
  }
}

function StrategyCard({ result }: { result: CoverageStrategyResult }) {
  const kind = result.strategyKind;
  const label = strategyLabels[kind] ?? kind;
  const desc = strategyDescriptions[kind] ?? "";
  const { payoff, riskMetrics: rm, alerts } = result;

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
            {label}
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0.25rem 0 0 0" }}>
            {desc}
          </p>
        </div>
        <span className="badge" style={{
          background: rm.riskProfile === "limited"
            ? "rgba(63, 185, 80, 0.15)"
            : "rgba(248, 81, 73, 0.15)",
          color: rm.riskProfile === "limited"
            ? "var(--color-buy)"
            : "var(--color-sell)",
          border: `1px solid ${rm.riskProfile === "limited" ? "var(--color-buy)" : "var(--color-sell)"}`
        }}>
          {rm.riskProfile === "limited" ? "Riesgo Limitado" : "Riesgo Ilimitado"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <PayoffChart
          points={payoff.points}
          baselinePrice={payoff.baselinePrice}
          height={220}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
          <div><span style={{ color: "var(--color-text-muted)" }}>Precio actual: </span><span style={{ color: "var(--color-text)" }}>${result.currentPrice.toFixed(2)}</span></div>
          <div><span style={{ color: "var(--color-text-muted)" }}>Break-even: </span><span style={{ color: "var(--color-text)" }}>${payoff.breakevenPrice.toFixed(2)}</span></div>
          <div><span style={{ color: "var(--color-text-muted)" }}>Protección: </span><span style={{ color: "var(--color-buy)" }}>${rm.protectionFloorPrice.toFixed(2)}</span></div>
          {rm.protectionCeilingPrice !== undefined && (
            <div><span style={{ color: "var(--color-text-muted)" }}>Tope: </span><span style={{ color: "var(--color-sell)" }}>${rm.protectionCeilingPrice.toFixed(2)}</span></div>
          )}
          <div><span style={{ color: "var(--color-text-muted)" }}>Prima neta: </span><span style={{ color: "var(--color-text)" }}>${rm.netPremium.toFixed(2)}</span></div>
          <div><span style={{ color: "var(--color-text-muted)" }}>Downside: </span><span style={{ color: rm.downsideRisk > 0 ? "var(--color-sell)" : "var(--color-text)" }}>${rm.downsideRisk.toFixed(2)}</span></div>
          {rm.upsideCap !== null && (
            <div><span style={{ color: "var(--color-text-muted)" }}>Upside cap: </span><span style={{ color: "var(--color-text)" }}>${rm.upsideCap.toFixed(2)}</span></div>
          )}
          {rm.marginRequirement !== undefined && (
            <div><span style={{ color: "var(--color-text-muted)" }}>Margen: </span><span style={{ color: "var(--color-text)" }}>${rm.marginRequirement.toFixed(2)}</span></div>
          )}
          <div><span style={{ color: "var(--color-text-muted)" }}>Max Profit: </span><span style={{ color: "var(--color-buy)" }}>{payoff.maxProfit !== null ? `$${payoff.maxProfit.toFixed(2)}` : "∞"}</span></div>
          <div><span style={{ color: "var(--color-text-muted)" }}>Max Loss: </span><span style={{ color: "var(--color-sell)" }}>{payoff.maxLoss !== null ? `$${payoff.maxLoss.toFixed(2)}` : "∞"}</span></div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <h4 style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", margin: 0, letterSpacing: "0.05em" }}>
            Alertas
          </h4>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              display: "flex",
              gap: "0.5rem",
              padding: "0.5rem",
              background: "var(--color-surface-raised)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              borderLeft: `3px solid ${severityColor(alert.severity)}`
            }}>
              <span style={{ color: severityColor(alert.severity), fontWeight: 600, textTransform: "uppercase", fontSize: "0.65rem", minWidth: "50px" }}>
                {alert.code}
              </span>
              <div>
                <p style={{ color: "var(--color-text)", margin: 0 }}>{alert.message}</p>
                <p style={{ color: "var(--color-text-muted)", margin: "0.15rem 0 0 0", fontSize: "0.75rem" }}>
                  {alert.recommendation}
                </p>
                {alert.triggerPrice !== undefined && (
                  <p style={{ color: "var(--color-text-muted)", margin: "0.15rem 0 0 0", fontSize: "0.7rem" }}>
                    Precio gatillo: ${alert.triggerPrice.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CoverageStrategiesPage() {
  const [ticker, setTicker] = useState("SPY");
  const [currentPrice, setCurrentPrice] = useState("450.50");
  const [shares, setShares] = useState("100");
  const [strikesInput, setStrikesInput] = useState("440, 450, 460");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CoverageStrategyResult[] | null>(null);

  const hasStrikes = strikesInput.trim().length > 0;

  const handleAnalyze = useCallback(async () => {
    const price = parseFloat(currentPrice);
    const shareCount = parseInt(shares, 10);

    if (!ticker.trim() || isNaN(price) || price <= 0 || isNaN(shareCount) || shareCount <= 0) {
      setError("Ingresa valores válidos para ticker, precio y acciones.");
      return;
    }

    const strikes = strikesInput
      .split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (strikes.length === 0) {
      setError("Ingresa al menos un strike válido.");
      return;
    }

    const payload: CoverageAnalyzeRequest = {
      ticker: ticker.trim().toUpperCase(),
      currentPrice: price,
      shares: shareCount,
      strikes
    };

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await postCoverageAnalyze(payload);
      setResults(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar coberturas");
    } finally {
      setLoading(false);
    }
  }, [ticker, currentPrice, shares, strikesInput]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text)" }}>
        Estrategias de Cobertura
      </h1>

      {/* Controls */}
      <div className="card" style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Ticker</label>
          <input type="text" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="SPY"
            style={{ width: "90px", padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Precio</label>
          <input type="number" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} step="0.01"
            style={{ width: "90px", padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Acciones</label>
          <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} step="1"
            style={{ width: "90px", padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, minWidth: "180px" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Strikes
          </label>
          <input type="text" value={strikesInput} onChange={(e) => setStrikesInput(e.target.value)}
            placeholder="440, 450, 460"
            style={{ padding: "0.5rem", background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", color: "var(--color-text)", width: "100%" }} />
        </div>
        <button className="btn-primary" onClick={handleAnalyze}
          disabled={loading || !hasStrikes}
          style={{ padding: "0.5rem 1.5rem" }}>
          {loading ? "Analizando…" : "Simular"}
        </button>
      </div>

      {/* Option chains unavailable warning */}
      {!hasStrikes && (
        <div className="card" style={{ borderColor: "var(--color-hold)" }}>
          <p style={{ color: "var(--color-hold)", fontSize: "0.85rem", margin: 0 }}>
            ⚠ Las cadenas de opciones no están disponibles en este momento. Ingresa strikes manualmente para habilitar la simulación.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ borderColor: "var(--color-sell)" }}>
          <p style={{ color: "var(--color-sell)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div className="skeleton" style={{ height: "20px", width: "50%" }} />
          <div className="skeleton" style={{ height: "200px" }} />
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {results.map((result) => (
            <StrategyCard key={result.strategyKind} result={result} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && !results && (
        <div className="card">
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", margin: 0, textAlign: "center" }}>
            Ingresa un ticker, precio y strikes, luego presiona "Simular" para ver las estrategias de cobertura.
          </p>
        </div>
      )}
    </div>
  );
}
