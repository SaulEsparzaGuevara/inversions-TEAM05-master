import { randomUUID } from "node:crypto";

export type AuditEventType =
  | "SIGNAL_GENERATED"
  | "PROPOSAL_CREATED"
  | "HUMAN_APPROVED"
  | "HUMAN_REJECTED"
  | "EXECUTION_SUBMITTED"
  | "EXECUTION_FAILED"
  | "EXECUTION_FILLED"
  | "EXECUTION_CANCELLED"
  | "DISCLAIMER_ACKNOWLEDGED";

export interface AuditEvent {
  eventId: string;
  timestampUtc: string;
  correlationId: string;
  signalId?: string;
  proposalId?: string;
  orderId?: string;
  userId?: string;
  role?: string;
  mfaContextId?: string;
  actionType: AuditEventType;
  previousState?: string;
  newState?: string;
  broker?: string;
  instrument?: string;
  orderType?: string;
  quantity?: number;
  price?: number;
  outcomeCode?: string;
  errorCode?: string;
  evidenceRef?: string;
  payload?: Record<string, unknown>;
}

export function createAuditEvent(partial: Omit<AuditEvent, "eventId" | "timestampUtc">): AuditEvent {
  return {
    eventId: randomUUID(),
    timestampUtc: new Date().toISOString(),
    ...partial
  };
}
