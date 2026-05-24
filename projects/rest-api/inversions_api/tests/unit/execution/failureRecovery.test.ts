import { describe, expect, it } from "vitest";
import { FailureRecoveryService } from "../../../src/modules/execution/failureRecovery";

describe("failureRecovery", () => {
  it("returns proposal to pending approval after failure", async () => {
    const service = new FailureRecoveryService();

    const result = await service.handleExecutionFailure({
      proposalId: "p1",
      failureReason: "BROKER_TIMEOUT",
      failureTimestamp: new Date(),
      executionAttempt: 1,
      brokerErrorCode: "TIMEOUT"
    });

    expect(result.transitionedFrom).toBe("FAILED");
    expect(result.transitionedTo).toBe("PENDING_APPROVAL");
    expect(result.allowsReapproval).toBe(true);
  });

  it("marks and clears broker degraded state", () => {
    const service = new FailureRecoveryService();

    const degraded = service.markBrokerDegraded("ALPACA", "LAG_CRITICAL", 3);
    expect(degraded.active).toBe(true);
    expect(degraded.retriesScheduled).toBe(3);
    expect(degraded.alertRaised).toBe(true);

    const cleared = service.clearBrokerDegraded("ALPACA");
    expect(cleared.active).toBe(false);
    expect(cleared.retriesScheduled).toBe(0);
    expect(cleared.alertRaised).toBe(false);
  });

  it("returns default healthy state when broker has no degraded entry", () => {
    const service = new FailureRecoveryService();
    const state = service.getBrokerDegradedState("IBKR");

    expect(state.active).toBe(false);
    expect(state.retriesScheduled).toBe(0);
  });

  it("blocks new decisions while broker is degraded", () => {
    const service = new FailureRecoveryService();
    service.markBrokerDegraded("IBKR", "TIMEOUT", 2);

    expect(service.canAcceptNewDecision("IBKR")).toBe(false);
    service.clearBrokerDegraded("IBKR");
    expect(service.canAcceptNewDecision("IBKR")).toBe(true);
  });
});
