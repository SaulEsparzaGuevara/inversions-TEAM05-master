import { describe, expect, it } from "vitest";
import { OperationalMetricsService } from "../../../src/observability/availabilitySlo";

describe("availabilitySlo integration", () => {
  it("keeps mandatory operational metrics updated within 60-second cycles", () => {
    const metrics = new OperationalMetricsService();

    const now = new Date("2026-05-14T07:10:00.000Z");
    metrics.record({
      decision_latency_ms: 420,
      decision_conflict_count: 2,
      broker_sync_lag_ms: 900,
      capturedAtUtc: now.toISOString()
    });

    const snapshotFresh = metrics.getSnapshot(60, new Date("2026-05-14T07:10:45.000Z"));
    expect(snapshotFresh.updatedWithinSla).toBe(true);
    expect(snapshotFresh.latest?.decision_latency_ms).toBe(420);
    expect(snapshotFresh.latest?.decision_conflict_count).toBe(2);
    expect(snapshotFresh.latest?.broker_sync_lag_ms).toBe(900);

    const snapshotStale = metrics.getSnapshot(60, new Date("2026-05-14T07:11:10.000Z"));
    expect(snapshotStale.updatedWithinSla).toBe(false);
  });
});
