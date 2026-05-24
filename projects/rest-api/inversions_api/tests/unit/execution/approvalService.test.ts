import { describe, expect, it } from "vitest";
import { ApprovalService } from "../../../src/modules/execution/approvalService";

describe("approvalService", () => {
  it("increments version after approval", async () => {
    const service = new ApprovalService();

    const result = await service.approve({
      proposalId: "p1",
      userId: "u1",
      role: "trader",
      action: "approve",
      expectedVersion: 1,
      mfaContext: {
        mfaContextId: "m1",
        userId: "u1",
        timestamp: new Date(),
        method: "totp",
        verificationToken: "123456",
        expiresAt: new Date(Date.now() + 60_000)
      }
    });

    expect(result.previousVersion).toBe(1);
    expect(result.newVersion).toBe(2);
    expect(result.transitionedTo).toBe("APPROVED");
  });

  it("throws version conflict when expected version is stale", async () => {
    const service = new ApprovalService();

    await expect(
      service.reject({
        proposalId: "p2",
        userId: "u2",
        role: "admin",
        action: "reject",
        expectedVersion: 0,
        mfaContext: {
          mfaContextId: "m3",
          userId: "u2",
          timestamp: new Date(),
          method: "totp",
          verificationToken: "654321",
          expiresAt: new Date(Date.now() + 60_000)
        }
      })
    ).rejects.toThrow("DECISION_VERSION_CONFLICT");
  });

  it("rejects viewer role with operational restriction", async () => {
    const service = new ApprovalService();

    await expect(
      service.approve({
        proposalId: "p3",
        userId: "u3",
        role: "viewer",
        action: "approve"
      })
    ).rejects.toThrow("FORBIDDEN_ROLE");
  });
});
