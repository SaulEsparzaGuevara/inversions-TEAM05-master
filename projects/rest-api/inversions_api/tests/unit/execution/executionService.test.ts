import { describe, expect, it } from "vitest";
import { ExecutionService, type Proposal } from "../../../src/modules/execution/executionService";

describe("executionService", () => {
  it("blocks execution when proposal is not approved", async () => {
    const service = new ExecutionService();
    const proposal: Proposal = {
      proposalId: "p1",
      signalId: "s1",
      userId: "u1",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "PENDING_APPROVAL",
      executionAttempts: 0
    };

    await expect(service.validateApproval(proposal)).rejects.toThrow("EXECUTION_BLOCKED");
  });

  it("requires approver reference to keep human decision valid", async () => {
    const service = new ExecutionService();
    const proposal: Proposal = {
      proposalId: "p2",
      signalId: "s2",
      userId: "u2",
      broker: "IBKR",
      instrument: "AAPL",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "APPROVED",
      approvedAt: new Date(),
      executionAttempts: 0
    };

    await expect(service.validateApproval(proposal)).rejects.toThrow("EXECUTION_BLOCKED");
  });

  it("executes approved proposal and returns filled state", async () => {
    const service = new ExecutionService();
    const proposal: Proposal = {
      proposalId: "p3",
      signalId: "s3",
      userId: "u3",
      broker: "ALPACA",
      instrument: "MSFT",
      orderType: "BUY",
      quantity: 1,
      version: 1,
      state: "APPROVED",
      approvedBy: "u3",
      approvedAt: new Date(),
      executionAttempts: 0
    };

    const result = await service.execute({ proposalId: "p3", userId: "u3" }, proposal);

    expect(result.state).toBe("FILLED");
    expect(result.orderId.length).toBeGreaterThan(0);
  });
});
