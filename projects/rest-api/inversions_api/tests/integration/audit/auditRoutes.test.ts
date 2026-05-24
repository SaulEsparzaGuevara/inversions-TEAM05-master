import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createAuditHistoryRouter } from "../../../src/routes/audit/history";
import { createOperationDetailRouter } from "../../../src/routes/audit/operationDetail";
import { AuditHistoryService } from "../../../src/modules/audit/historyService";

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/audit", createAuditHistoryRouter(new AuditHistoryService()));
  app.use("/api/audit", createOperationDetailRouter());
  return app;
}

describe("audit routes", () => {
  it("returns paginated history payload", async () => {
    const app = buildApp();

    const res = await request(app).get("/api/audit/history?page=1&pageSize=10");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.page).toBe(1);
    expect(res.body.pageSize).toBe(10);
  });

  it("returns 400 for invalid broker filter", async () => {
    const app = buildApp();

    const res = await request(app).get("/api/audit/history?broker=UNKNOWN");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_PARAMS");
  });

  it("returns 400 for invalid pagination input", async () => {
    const app = buildApp();

    const res = await request(app).get("/api/audit/history?page=abc&pageSize=10");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_PARAMS");
  });

  it("returns 400 for invalid fromDate filter", async () => {
    const app = buildApp();

    const res = await request(app).get("/api/audit/history?fromDate=not-a-date");

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("INVALID_PARAMS");
  });

  it("returns history metrics snapshot", async () => {
    const app = buildApp();

    await request(app).get("/api/audit/history?page=1&pageSize=5");
    const metricsRes = await request(app).get("/api/audit/history/metrics");

    expect(metricsRes.status).toBe(200);
    expect(metricsRes.body.queryLatency).toBeDefined();
    expect(metricsRes.body.sloStatus).toBeDefined();
    expect(metricsRes.body.capturedAt).toBeDefined();
  });

  it("returns chain payload for a proposal", async () => {
    const app = buildApp();

    const res = await request(app).get("/api/audit/history/chain/proposal-chain");

    expect(res.status).toBe(200);
    expect(res.body.proposalId).toBe("proposal-chain");
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it("returns operation detail when AUTH_BYPASS is true", async () => {
    process.env.AUTH_BYPASS = "true";
    const app = buildApp();

    const res = await request(app).get("/api/audit/operations/proposal-1");

    expect(res.status).toBe(200);
    expect(res.body.proposalId).toBe("proposal-1");
    expect(Array.isArray(res.body.approvalHistory)).toBe(true);
  });

  it("returns 404 for operation detail when AUTH_BYPASS is false", async () => {
    process.env.AUTH_BYPASS = "false";
    const app = buildApp();

    const res = await request(app).get("/api/audit/operations/proposal-2");

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });
});
