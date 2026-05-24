import { describe, expect, it } from "vitest";
import { AvailabilitySloService } from "../../../src/observability/availabilitySlo";

describe("availabilitySlo service", () => {
  it("returns empty-month dashboard as fully available", () => {
    const service = new AvailabilitySloService();
    const dashboard = service.getDashboardForMonth(2026, 5);

    expect(dashboard.overallAvailabilityPercent).toBe(100);
    expect(dashboard.evidenceBoard.sc005Compliant).toBe(true);
    expect(dashboard.dependencies).toHaveLength(4);
  });

  it("ignores negative latency and computes dependency budgets", () => {
    const service = new AvailabilitySloService();
    const ts = "2026-05-14T07:00:00.000Z";

    service.recordSample({ dependency: "IBKR", success: true, latencyMs: 120, timestampUtc: ts });
    service.recordSample({ dependency: "IBKR", success: false, latencyMs: 0, timestampUtc: ts, errorCode: "TIMEOUT" });
    service.recordSample({ dependency: "IBKR", success: false, latencyMs: 0, timestampUtc: ts, errorCode: "TIMEOUT" });
    service.recordSample({ dependency: "ALPACA", success: true, latencyMs: 200, timestampUtc: ts });
    service.recordSample({ dependency: "MARKET_DATA", success: true, latencyMs: -1, timestampUtc: ts });

    const dashboard = service.getDashboardForMonth(2026, 5);
    const ibkr = dashboard.dependencies.find((item) => item.dependency === "IBKR");

    expect(dashboard.evidenceBoard.totalSamples).toBe(4);
    expect(ibkr?.totalRequests).toBe(3);
    expect(ibkr?.failedRequests).toBe(2);
    expect(ibkr?.latency.p95Ms).toBe(120);
    expect(ibkr?.topErrorCodes[0]).toMatchObject({ errorCode: "TIMEOUT", count: 2 });
    expect(ibkr?.sloCompliant).toBe(false);
  });

  it("builds current-month dashboard from reference date", () => {
    const service = new AvailabilitySloService();
    service.recordSample({
      dependency: "CLAUDE",
      success: true,
      latencyMs: 80,
      timestampUtc: "2026-06-01T00:00:00.000Z"
    });

    const dashboard = service.getDashboardForCurrentMonth(new Date("2026-06-15T12:00:00.000Z"));

    expect(dashboard.month).toBe(6);
    expect(dashboard.year).toBe(2026);
    expect(dashboard.evidenceBoard.totalSamples).toBe(1);
  });
});