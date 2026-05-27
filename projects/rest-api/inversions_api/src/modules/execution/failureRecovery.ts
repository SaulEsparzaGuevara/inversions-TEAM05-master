/**
 * T033: Failure Recovery with State Transition to PENDING_APPROVAL
 * ================================================================
 * Servicio de recuperacion por fallos que transiciona propuestas fallidas
 * de regreso a PENDING_APPROVAL para reintentos con nueva aprobacion.
 * 
 * Funcionalidad:
 * - Detectar ejecuciones fallidas (FAILED state)
 * - Transicionar de FAILED -> PENDING_APPROVAL
 * - Registrar razon del fallo en auditoria
 * - Permitir reintento desde cero sin reutilizar aprobacion anterior
 * - Emitir evento EXECUTION_FAILED + PROPOSAL_RESET
 * 
 * Mapeo: FR-009, PL-010
 * 
 * Politica de reintento:
 * - No hay reintento automatico
 * - Usuario debe ver error, revisar senal y re-aprobar explicitamente
 * - Cada reintento requiere nueva evaluacion de señal (la data de mercado
 *   puede haber cambiado significativamente)
 */

export interface FailureContext {
  proposalId: string;
  failureReason: string; // ej: "INSUFFICIENT_FUNDS", "BROKER_TIMEOUT", etc
  failureTimestamp: Date;
  executionAttempt: number;
  brokerErrorCode?: string;
  brokerErrorMessage?: string;
}

export interface RecoveryResult {
  proposalId: string;
  transitionedFrom: string;
  transitionedTo: 'PENDING_APPROVAL';
  recoveryEventId: string;
  allowsReapproval: boolean;
  retryWindowMinutes: number;
}

export interface BrokerDegradedState {
  broker: "IBKR" | "ALPACA";
  active: boolean;
  sinceUtc?: string;
  reason?: string;
  retriesScheduled: number;
  alertRaised: boolean;
}

export class FailureRecoveryService {
  private readonly degradedByBroker = new Map<"IBKR" | "ALPACA", BrokerDegradedState>();

  /**
   * Manejar fallo de ejecucion y transicionar propuesta de vuelta a PENDING_APPROVAL.
   * 
   * @param context FailureContext con detalles del fallo
   * @returns RecoveryResult con confirmacion de transicion
   */
  async handleExecutionFailure(context: FailureContext): Promise<RecoveryResult> {
    // FIC: Implementacion futura: transaccional con Supabase
    // 1. Leer propuesta actual
    // 2. Validar que estado es FAILED
    // 3. Limpiar aprobacion anterior (cleared_approval_at = now)
    // 4. Transicionar a PENDING_APPROVAL
    // 5. Emitir evento EXECUTION_FAILED + PROPOSAL_RESET
    // 6. Registrar razon del fallo

    const recoveryEventId = `rcv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.markBrokerDegraded("IBKR", context.failureReason, 1);

    return {
      proposalId: context.proposalId,
      transitionedFrom: 'FAILED',
      transitionedTo: 'PENDING_APPROVAL',
      recoveryEventId,
      allowsReapproval: true,
      retryWindowMinutes: 60, // Ventana para reintentar (usuario puede aprobar nuevamente en 60 min)
    };
  }

  markBrokerDegraded(
    broker: "IBKR" | "ALPACA",
    reason: string,
    retriesScheduled: number = 1
  ): BrokerDegradedState {
    const next: BrokerDegradedState = {
      broker,
      active: true,
      sinceUtc: new Date().toISOString(),
      reason,
      retriesScheduled: Math.max(1, retriesScheduled),
      alertRaised: true
    };

    this.degradedByBroker.set(broker, next);
    return next;
  }

  clearBrokerDegraded(broker: "IBKR" | "ALPACA"): BrokerDegradedState {
    const next: BrokerDegradedState = {
      broker,
      active: false,
      retriesScheduled: 0,
      alertRaised: false
    };
    this.degradedByBroker.set(broker, next);
    return next;
  }

  getBrokerDegradedState(broker: "IBKR" | "ALPACA"): BrokerDegradedState {
    return (
      this.degradedByBroker.get(broker) ?? {
        broker,
        active: false,
        retriesScheduled: 0,
        alertRaised: false
      }
    );
  }

  canAcceptNewDecision(broker: "IBKR" | "ALPACA"): boolean {
    const state = this.getBrokerDegradedState(broker);
    return !state.active;
  }

  /**
   * Verificar si una propuesta tiene derecho a reintentar (sin haber excedido limites).
   * 
   * @param proposalId ID de propuesta fallida
   * @returns true si puede reintentar, false si excedió limites
   */
  async canRetry(proposalId: string): Promise<boolean> {
    // FIC: Implementacion futura: consultar Supabase
    // - Contar execution_attempts por proposal_id
    // - Si > MAX_ATTEMPTS (ej: 3), rechazar reintento
    // - Si ultimo fallo fue hace > 60 min, rechazar

    const MAX_ATTEMPTS = 3;
    // const attempts = await getAttemptCount(proposalId);
    // if (attempts >= MAX_ATTEMPTS) return false;

    return true;
  }

  /**
   * Registrar fallo en auditoria con detalles completos.
   * 
   * Campos obligatorios para evento EXECUTION_FAILED:
   * - event_id, timestamp_utc, correlation_id
   * - proposal_id, user_id, execution_id
   * - previous_state (EXECUTING), new_state (FAILED)
   * - failure_code, failure_message
   * - broker, instrument, quantity, order_type
   * - recovery_allowed, retry_window_minutes
   */
  async registerFailureInAudit(context: FailureContext): Promise<string> {
    // FIC: Implementacion futura: emitir evento a auditoria
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const auditEvent = {
      event_id: eventId,
      timestamp_utc: context.failureTimestamp,
      action_type: 'EXECUTION_FAILED',
      proposal_id: context.proposalId,
      error_code: context.failureReason,
      error_message: context.brokerErrorMessage || context.failureReason,
      previous_state: 'EXECUTING',
      new_state: 'FAILED',
      recovery_allowed: true,
      retry_window_minutes: 60,
    };

    console.log('[Audit] Execution Failure Event:', auditEvent);
    return eventId;
  }

  /**
   * Emitir evento de reinicio de propuesta (PROPOSAL_RESET) para que la UI se actualice.
   * 
   * Este evento indica que la propuesta volvio a PENDING_APPROVAL y el usuario debe
   * revisar nuevamente antes de intentar una nueva ejecucion.
   */
  async emitProposalResetEvent(proposalId: string): Promise<void> {
    // FIC: Implementacion futura: pubsub/websocket para notificar frontend en tiempo real
    const resetEvent = {
      event_type: 'PROPOSAL_RESET',
      proposal_id: proposalId,
      new_state: 'PENDING_APPROVAL',
      timestamp: new Date().toISOString(),
      message: 'Execution failed. Proposal returned to PENDING_APPROVAL. Please review and re-approve.',
    };

    console.log('[Event] Proposal Reset:', resetEvent);
  }

  /**
   * Obtener historial de intentos fallidos para una propuesta.
   * 
   * FIC: Implementacion futura: consultar Supabase
   */
  async getFailureHistory(proposalId: string): Promise<FailureContext[]> {
    // FIC: Stub. Implementar consulta a Supabase.
    return [];
  }

  /**
   * Validar que propuesta tiene la version correcta antes de aplicar transicion.
   * 
   * FIC: Implementacion futura: consultar version en Supabase y comparar
   */
  async validateProposalVersion(proposalId: string, expectedVersion: number): Promise<boolean> {
    // FIC: Stub.
    return true;
  }

  /**
   * Limpiar datos de aprobacion anterior cuando se resetea propuesta.
   * 
   * Esto garantiza que el usuario deba pasar nuevamente por aprobacion
   * y validar MFA, sin poder reutilizar la aprobacion anterior.
   */
  async clearPreviousApproval(proposalId: string): Promise<void> {
    // FIC: Implementacion futura: eliminar/marcar as cleared
    // - approved_by = NULL
    // - approved_at = NULL
    // - mfa_context_id = NULL
    // - approval_version = NULL
    console.log(`[Recovery] Cleared previous approval for proposal ${proposalId}`);
  }
}
