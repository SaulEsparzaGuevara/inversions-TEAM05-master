import { describe, expect, it } from "vitest";
import { AuditHistoryService } from "../../../src/modules/audit/historyService";

describe("historyService", () => {
  it("returns paginated response with default completeness for empty data", async () => {
    const service = new AuditHistoryService();

    const result = await service.queryHistory({}, { page: 1, pageSize: 20 });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
    expect(result.traceCompletenessPercent).toBe(100);
    expect(result.queryLatencyMs).toBeGreaterThanOrEqual(0);
  });

  it("returns empty chain for unknown proposal in stub mode", async () => {
    const service = new AuditHistoryService();

    const chain = await service.getEventChain("missing-proposal");

    expect(chain).toEqual([]);
  });
});
