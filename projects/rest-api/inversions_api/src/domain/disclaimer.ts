import { createAuditEvent, type AuditEvent } from "./auditEvent.js";

export interface DisclaimerAckInput {
  correlationId: string;
  userId: string;
  role: string;
  surface: "signal-detail" | "approval-modal" | "execution-confirmation" | "api-approve" | "api-execute";
}

export function createDisclaimerAcknowledgement(input: DisclaimerAckInput): AuditEvent {
  return createAuditEvent({
    correlationId: input.correlationId,
    userId: input.userId,
    role: input.role,
    actionType: "DISCLAIMER_ACKNOWLEDGED",
    outcomeCode: "OK",
    evidenceRef: `disclaimer:${input.surface}`,
    payload: {
      surface: input.surface
    }
  });
}
