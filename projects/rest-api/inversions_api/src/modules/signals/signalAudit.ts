import { createAuditEvent, type AuditEvent } from "../../domain/auditEvent.js";

interface SignalAuditInput {
  correlationId: string;
  signalId: string;
  userId?: string;
  role?: string;
  instrument: string;
  outcomeCode: "OK" | "FAILED";
}

const inMemoryAuditBuffer: AuditEvent[] = [];

export function emitSignalGenerated(input: SignalAuditInput): AuditEvent {
  const event = createAuditEvent({
    correlationId: input.correlationId,
    signalId: input.signalId,
    userId: input.userId,
    role: input.role,
    actionType: "SIGNAL_GENERATED",
    instrument: input.instrument,
    outcomeCode: input.outcomeCode,
    evidenceRef: `signal:${input.signalId}`
  });

  inMemoryAuditBuffer.push(event);
  return event;
}

export function listSignalAuditBuffer(): AuditEvent[] {
  return [...inMemoryAuditBuffer];
}
