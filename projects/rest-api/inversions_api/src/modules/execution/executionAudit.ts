/**
 * T036: Execution Audit Event Emission
 * ====================================
 * Servicio para emitir eventos de auditoria operacionales durante el ciclo completo
 * de una propuesta: HUMAN_APPROVED, EXECUTION_SUBMITTED, EXECUTION_FAILED.
 * 
 * Funcionalidad:
 * - Emitir evento HUMAN_APPROVED cuando usuario aprueba propuesta
 * - Emitir evento EXECUTION_SUBMITTED cuando orden es enviada al broker
 * - Emitir evento EXECUTION_FAILED cuando orden falla en broker
 * - Incluir todos los campos minimos de trazabilidad (PL-006)
 * - Integrar con storage de auditoria (Supabase)
 * 
 * Mapeo: FR-006, SC-002, PL-006
 * 
 * Campos minimos obligatorios por evento (PL-006):
 * - event_id (UUID), timestamp_utc, correlation_id
 * - signal_id, proposal_id, user_id, role
 * - action_type, previous_state, new_state
 * - broker, instrument, order_type, quantity, price (si aplica)
 * - outcome_code, error_code (si aplica)
 */

/**
 * Tipos de eventos de auditoria
 */
export type AuditEventType =
  | 'HUMAN_APPROVED'
  | 'DECISION_CONFLICT'
  | 'EXECUTION_SUBMITTED'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_RETRIED';

export type UserRole = 'viewer' | 'trader' | 'admin' | 'system';

/**
 * Evento de auditoria con trazabilidad completa
 */
export interface AuditEvent {
  // Campos minimos de identificacion
  eventId: string;
  timestampUtc: Date;
  correlationId: string;

  // Contexto de la propuesta
  signalId: string;
  proposalId: string;
  userId: string;
  role: UserRole;

  // Tipo de evento y transicion
  actionType: AuditEventType;
  previousState: string;
  newState: string;

  // Detalles operativos
  broker?: 'IBKR' | 'ALPACA';
  instrument: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  orderId?: string; // asignado por broker

  // Resultado y error (si aplica)
  outcomeCode?: string; // SUCCESS, FAILED, etc
  errorCode?: string;
  errorMessage?: string;

  // Contexto de seguridad
  mfaUsed?: string; // totp, sms, hardware_key
  mfaContextId?: string;

  // Metadata adicional
  metadata?: Record<string, unknown>;
}

export class ExecutionAuditService {
  async emitDecisionConflict(
    proposalId: string,
    signalId: string,
    userId: string,
    instrument: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    clientVersion: number,
    serverVersion: number,
    correlationId?: string
  ): Promise<AuditEvent> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const corrId = correlationId || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: AuditEvent = {
      eventId,
      timestampUtc: new Date(),
      correlationId: corrId,
      signalId,
      proposalId,
      userId,
      role: 'system',
      actionType: 'DECISION_CONFLICT',
      previousState: 'PENDING_APPROVAL',
      newState: 'PENDING_APPROVAL',
      instrument,
      orderType,
      quantity,
      outcomeCode: 'CONFLICT',
      errorCode: 'DECISION_VERSION_CONFLICT',
      errorMessage: 'Decision rejected due to stale optimistic lock version',
      metadata: {
        clientVersion,
        serverVersion
      }
    };

    await this.storeAuditEvent(event);

    return event;
  }

  /**
   * Emitir evento HUMAN_APPROVED cuando usuario aprueba una propuesta.
   * 
   * Este evento registra la aprobacion humana explicita y validacion de MFA.
   */
  async emitHumanApproved(
    proposalId: string,
    signalId: string,
    userId: string,
    userRole: 'viewer' | 'trader' | 'admin',
    instrument: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number | undefined,
    mfaMethod?: string,
    mfaContextId?: string,
    correlationId?: string
  ): Promise<AuditEvent> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const corrId = correlationId || `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: AuditEvent = {
      eventId,
      timestampUtc: new Date(),
      correlationId: corrId,
      signalId,
      proposalId,
      userId,
      role: userRole,
      actionType: 'HUMAN_APPROVED',
      previousState: 'PENDING_APPROVAL',
      newState: 'APPROVED',
      instrument,
      orderType,
      quantity,
      price,
      outcomeCode: 'SUCCESS',
      mfaUsed: mfaMethod,
      mfaContextId,
    };

    // FIC: Implementacion futura: emitir a Supabase audit table
    await this.storeAuditEvent(event);

    return event;
  }

  /**
   * Emitir evento EXECUTION_SUBMITTED cuando orden es enviada al broker.
   * 
   * Este evento registra que la propuesta aprobada fue delegada al adaptador broker.
   */
  async emitExecutionSubmitted(
    proposalId: string,
    signalId: string,
    userId: string,
    broker: 'IBKR' | 'ALPACA',
    instrument: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number | undefined,
    orderId: string,
    correlationId: string
  ): Promise<AuditEvent> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: AuditEvent = {
      eventId,
      timestampUtc: new Date(),
      correlationId,
      signalId,
      proposalId,
      userId,
      role: 'system' as UserRole, // role no aplica, es el sistema quien emite
      actionType: 'EXECUTION_SUBMITTED',
      previousState: 'APPROVED',
      newState: 'EXECUTING',
      broker,
      instrument,
      orderType,
      quantity,
      price,
      orderId,
      outcomeCode: 'SUBMITTED',
      metadata: {
        submitTimestamp: new Date().toISOString(),
      },
    };

    // FIC: Implementacion futura: emitir a Supabase audit table
    await this.storeAuditEvent(event);

    return event;
  }

  /**
   * Emitir evento EXECUTION_FAILED cuando orden falla en broker.
   * 
   * Este evento registra que la ejecucion fue rechazada y la propuesta vuelve
   * a PENDING_APPROVAL para reintentos.
   */
  async emitExecutionFailed(
    proposalId: string,
    signalId: string,
    userId: string,
    broker: 'IBKR' | 'ALPACA',
    instrument: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number | undefined,
    orderId: string,
    errorCode: string,
    errorMessage: string,
    correlationId: string,
    attemptNumber: number = 1
  ): Promise<AuditEvent> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: AuditEvent = {
      eventId,
      timestampUtc: new Date(),
      correlationId,
      signalId,
      proposalId,
      userId,
      role: 'system' as UserRole,
      actionType: 'EXECUTION_FAILED',
      previousState: 'EXECUTING',
      newState: 'PENDING_APPROVAL', // Transicion de regreso a aprobacion
      broker,
      instrument,
      orderType,
      quantity,
      price,
      orderId,
      outcomeCode: 'FAILED',
      errorCode,
      errorMessage,
      metadata: {
        attemptNumber,
        allowsRetry: true,
        retryWindowMinutes: 60,
        failureTimestamp: new Date().toISOString(),
      },
    };

    // FIC: Implementacion futura: emitir a Supabase audit table
    await this.storeAuditEvent(event);

    return event;
  }

  /**
   * Emitir evento EXECUTION_RETRIED cuando usuario reintenta tras fallo.
   * 
   * Este evento registra que se intento una nueva ejecucion tras una aprobacion adicional.
   */
  async emitExecutionRetried(
    proposalId: string,
    signalId: string,
    userId: string,
    broker: 'IBKR' | 'ALPACA',
    instrument: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number | undefined,
    orderId: string,
    attemptNumber: number,
    correlationId: string
  ): Promise<AuditEvent> {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const event: AuditEvent = {
      eventId,
      timestampUtc: new Date(),
      correlationId,
      signalId,
      proposalId,
      userId,
      role: 'system' as UserRole,
      actionType: 'EXECUTION_RETRIED',
      previousState: 'PENDING_APPROVAL',
      newState: 'EXECUTING',
      broker,
      instrument,
      orderType,
      quantity,
      price,
      orderId,
      outcomeCode: 'RETRIED',
      metadata: {
        attemptNumber,
        retriedAfterFailureSeconds: undefined, // FIC: calcular desde ultima falla
      },
    };

    // FIC: Implementacion futura: emitir a Supabase audit table
    await this.storeAuditEvent(event);

    return event;
  }

  /**
   * Almacenar evento de auditoria en Supabase.
   * 
   * FIC: Implementacion futura: insertar en tabla `audit_events` con indices en
   * (proposal_id, timestamp_utc), (user_id, timestamp_utc), (signal_id)
   */
  private async storeAuditEvent(event: AuditEvent): Promise<void> {
    // Placeholder para Supabase insert
    console.log('[Audit] Event stored:', {
      eventId: event.eventId,
      actionType: event.actionType,
      proposalId: event.proposalId,
      userId: event.userId,
      timestamp: event.timestampUtc.toISOString(),
    });
  }

  /**
   * Recuperar eventos de auditoria para una propuesta.
   * 
   * FIC: Implementacion futura: consultar Supabase con filtro proposal_id
   */
  async getEventsByProposal(proposalId: string): Promise<AuditEvent[]> {
    // FIC: Stub. Implementar consulta a Supabase.
    return [];
  }

  /**
   * Recuperar eventos de auditoria para un usuario.
   * 
   * FIC: Implementacion futura: consultar Supabase con filtro user_id
   */
  async getEventsByUser(userId: string, limit: number = 100): Promise<AuditEvent[]> {
    // FIC: Stub. Implementar consulta a Supabase.
    return [];
  }

  /**
   * Recuperar eventos de auditoria para una señal.
   * 
   * FIC: Implementacion futura: consultar Supabase con filtro signal_id
   */
  async getEventsBySignal(signalId: string): Promise<AuditEvent[]> {
    // FIC: Stub. Implementar consulta a Supabase.
    return [];
  }

  /**
   * Obtener cadena de eventos (correlation_id) para un proposal.
   * 
   * Esto permite rastrear toda la historia de una propuesta desde
   * evaluacion -> aprobacion -> ejecucion -> fallo/exito.
   */
  async getEventChain(proposalId: string): Promise<AuditEvent[]> {
    // FIC: Stub.
    return [];
  }
}
