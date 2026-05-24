import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApprovalRouter } from "../../../src/routes/execution/approve";
import { createExecutionRouter } from "../../../src/routes/execution/execute";
import { ApprovalService } from "../../../src/modules/execution/approvalService";
import {
  ExecutionService,
  type ExecutionRequest,
  type ExecutionResult,
  type Proposal
} from "../../../src/modules/execution/executionService";

class TestExecutionService extends ExecutionService {
  constructor(private readonly proposalFixture: Proposal | null) {
    super();
  }

  async getProposal(): Promise<Proposal | null> {
    return this.proposalFixture;
  }
}

class ThrowingExecutionService extends TestExecutionService {
  constructor(proposalFixture: Proposal | null, private readonly message: string) {
    super(proposalFixture);
  }

  async execute(_request: ExecutionRequest, _proposal: Proposal): Promise<ExecutionResult> {
    throw new Error(this.message);
  }
}

class FailedExecutionService extends TestExecutionService {
  async execute(request: ExecutionRequest, proposal: Proposal): Promise<ExecutionResult> {
    return {
      executionId: "exec-failed",
      proposalId: request.proposalId,
      orderId: "",
      state: "FAILED",
      timestamp: new Date(),
      errorCode: "BROKER_ERROR",
      errorMessage: `failed:${proposal.proposalId}`
    };
  }
}

function buildApp(role: "viewer" | "trader" | "admin", executionService?: ExecutionService) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).authContext = {
      userId: "test-user",
      role
    };
    next();
  });

  app.use("/api/execution", createApprovalRouter(new ApprovalService()));
  app.use("/api/execution", createExecutionRouter(executionService ?? new ExecutionService()));
  return app;
}

describe("execution routes", () => {
  it("returns operational restriction for viewer approval", async () => {
    const app = buildApp("viewer");

    const res = await request(app).post("/api/execution/approve").send({
      proposalId: "p1",
      proposalVersion: 1,
      disclaimerAcknowledged: true,
      disclaimerText: "ack"
    });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN_ROLE");
  });

  it("returns 400 when disclaimer is not acknowledged", async () => {
    const app = buildApp("trader");

    const res = await request(app).post("/api/execution/approve").send({
      proposalId: "p-disclaimer",
      disclaimerAcknowledged: false,
      disclaimerText: ""
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("DISCLAIMER_REQUIRED");
  });

  it("returns 401 when trader approval does not include MFA", async () => {
    const app = buildApp("trader");

    const res = await request(app).post("/api/execution/approve").send({
      proposalId: "p-no-mfa",
      proposalVersion: 1,
      disclaimerAcknowledged: true,
      disclaimerText: "ack"
    });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("MFA_REQUIRED");
  });

  it("approves trader request with valid MFA", async () => {
    const app = buildApp("trader");

    const res = await request(app).post("/api/execution/approve").send({
      proposalId: "p2",
      proposalVersion: 1,
      disclaimerAcknowledged: true,
      disclaimerText: "ack",
      mfaContext: {
        method: "totp",
        verificationToken: "123456"
      }
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.transitionedTo).toBe("APPROVED");
  });

  it("returns decision version conflict on stale approval payload", async () => {
    const app = buildApp("trader");

    const payload = {
      proposalId: "p-stale",
      proposalVersion: 0,
      disclaimerAcknowledged: true,
      disclaimerText: "ack",
      mfaContext: {
        method: "totp",
        verificationToken: "123456"
      }
    };

    const res = await request(app).post("/api/execution/approve").send(payload);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("DECISION_VERSION_CONFLICT");
  });

  it("returns stale version conflict for execute", async () => {
    const executionService = new TestExecutionService({
      proposalId: "p3",
      signalId: "s3",
      userId: "test-user",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 2,
      state: "APPROVED",
      approvedBy: "test-user",
      approvedAt: new Date(),
      executionAttempts: 0
    });

    const app = buildApp("trader", executionService);

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p3",
      proposalVersion: 1
    });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("ORDER_VERSION_STALE");
  });

  it("returns 404 when proposal does not exist and auth bypass is disabled", async () => {
    process.env.AUTH_BYPASS = "false";
    const app = buildApp("trader", new TestExecutionService(null));

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p-missing",
      proposalVersion: 1
    });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe("NOT_FOUND");
  });

  it("returns execution blocked when proposal is not approved", async () => {
    const executionService = new TestExecutionService({
      proposalId: "p4",
      signalId: "s4",
      userId: "test-user",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "PENDING_APPROVAL",
      executionAttempts: 0
    });

    const app = buildApp("trader", executionService);

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p4",
      proposalVersion: 1
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("EXECUTION_BLOCKED");
  });

  it("returns 500 broker error when service reports failed terminal state", async () => {
    const fixture: Proposal = {
      proposalId: "p-failed",
      signalId: "s-failed",
      userId: "test-user",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "APPROVED",
      approvedBy: "test-user",
      approvedAt: new Date(),
      executionAttempts: 0
    };

    const app = buildApp("trader", new FailedExecutionService(fixture));

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p-failed",
      proposalVersion: 1
    });

    expect(res.status).toBe(500);
    expect(res.body.code).toBe("BROKER_ERROR");
  });

  it("maps approval expiration execution error to 400", async () => {
    const fixture: Proposal = {
      proposalId: "p-exp",
      signalId: "s-exp",
      userId: "test-user",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "APPROVED",
      approvedBy: "test-user",
      approvedAt: new Date(),
      executionAttempts: 0
    };
    const app = buildApp("trader", new ThrowingExecutionService(fixture, "APPROVAL_EXPIRED"));

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p-exp",
      proposalVersion: 1
    });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("APPROVAL_EXPIRED");
  });

  it("maps rate-limit execution error to 429", async () => {
    const fixture: Proposal = {
      proposalId: "p-rate",
      signalId: "s-rate",
      userId: "test-user",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "APPROVED",
      approvedBy: "test-user",
      approvedAt: new Date(),
      executionAttempts: 0
    };
    const app = buildApp("trader", new ThrowingExecutionService(fixture, "RATE_LIMIT"));

    const res = await request(app).post("/api/execution/execute").send({
      proposalId: "p-rate",
      proposalVersion: 1
    });

    expect(res.status).toBe(429);
    expect(res.body.code).toBe("RATE_LIMITED");
  });
});
