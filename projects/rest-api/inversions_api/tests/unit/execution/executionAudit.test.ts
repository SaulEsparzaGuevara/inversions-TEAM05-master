import { describe, expect, it } from "vitest";
import { ExecutionAuditService } from "../../../src/modules/execution/executionAudit";

describe("executionAudit", () => {
  it("emits decision conflict event with conflict metadata", async () => {
    const service = new ExecutionAuditService();

    const event = await service.emitDecisionConflict(
      "p1",
      "s1",
      "u1",
      "AAPL",
      "BUY",
      10,
      1,
      2
    );

    expect(event.actionType).toBe("DECISION_CONFLICT");
    expect(event.errorCode).toBe("DECISION_VERSION_CONFLICT");
    expect(event.metadata).toMatchObject({
      clientVersion: 1,
      serverVersion: 2
    });
  });

  it("emits human approved event with MFA context", async () => {
    const service = new ExecutionAuditService();

    const event = await service.emitHumanApproved(
      "p2",
      "s2",
      "u2",
      "trader",
      "MSFT",
      "SELL",
      5,
      320,
      "totp",
      "mfa-ctx",
      "corr-fixed"
    );

    expect(event.actionType).toBe("HUMAN_APPROVED");
    expect(event.newState).toBe("APPROVED");
    expect(event.correlationId).toBe("corr-fixed");
    expect(event.mfaUsed).toBe("totp");
  });

  it("emits execution submitted, failed and retried events", async () => {
    const service = new ExecutionAuditService();

    const submitted = await service.emitExecutionSubmitted(
      "p3",
      "s3",
      "u3",
      "IBKR",
      "AAPL",
      "BUY",
      10,
      120,
      "ord-1",
      "corr-1"
    );
    const failed = await service.emitExecutionFailed(
      "p3",
      "s3",
      "u3",
      "IBKR",
      "AAPL",
      "BUY",
      10,
      120,
      "ord-1",
      "TIMEOUT",
      "broker timeout",
      "corr-1",
      2
    );
    const retried = await service.emitExecutionRetried(
      "p3",
      "s3",
      "u3",
      "IBKR",
      "AAPL",
      "BUY",
      10,
      120,
      "ord-2",
      3,
      "corr-1"
    );

    expect(submitted.actionType).toBe("EXECUTION_SUBMITTED");
    expect(submitted.newState).toBe("EXECUTING");
    expect(failed.actionType).toBe("EXECUTION_FAILED");
    expect(failed.errorCode).toBe("TIMEOUT");
    expect(retried.actionType).toBe("EXECUTION_RETRIED");
    expect(retried.outcomeCode).toBe("RETRIED");
  });

  it("returns empty collections for lookup stubs", async () => {
    const service = new ExecutionAuditService();

    await expect(service.getEventsByProposal("p1")).resolves.toEqual([]);
    await expect(service.getEventsByUser("u1")).resolves.toEqual([]);
    await expect(service.getEventsBySignal("s1")).resolves.toEqual([]);
    await expect(service.getEventChain("p1")).resolves.toEqual([]);
  });
});
