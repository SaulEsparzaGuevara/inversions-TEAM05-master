import { describe, expect, it } from "vitest";
import { HistoryMetricsService } from "../../../src/observability/historyMetrics";

describe("historyMetrics", () => {
  it("computes percentiles and SLO compliance", () => {
    const metrics = new HistoryMetricsService();

    [120, 250, 400, 900, 1200].forEach((ms) => metrics.recordQueryLatency(ms));
    [100, 98, 95, 100].forEach((pct) => metrics.recordTraceCompleteness(pct));

    const latency = metrics.getLatencyPercentiles();
    const slo = metrics.getSLOStatus();

    expect(latency.sampleCount).toBe(5);
    expect(latency.p95).toBeGreaterThan(0);
    expect(slo.isCompliant).toBe(true);
    expect(slo.currentPercent).toBe(100);
  });

  it("marks SLO violation when latency exceeds threshold repeatedly", () => {
    const metrics = new HistoryMetricsService();

    [1000, 1200, 3500, 4200, 5000].forEach((ms) => metrics.recordQueryLatency(ms));

    const slo = metrics.getSLOStatus();

    expect(slo.totalInWindow).toBe(5);
    expect(slo.violationsInWindow).toBe(3);
    expect(slo.isCompliant).toBe(false);
  });
});
