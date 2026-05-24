/**
 * T040: Operation Detail API Endpoint
 * =====================================
 * Endpoint GET /audit/operations/:proposalId para consultar detalle operativo
 * de una propuesta especifica con diagnostico de fallos.
 * 
 * Funcionalidad:
 * - Retornar estado actual y ciclo de vida completo de la propuesta
 * - Incluir evidencia de la señal (confidence, sources)
 * - Incluir historial de aprobaciones/rechazos
 * - Incluir historial de intentos de ejecucion con errores broker
 * - Indicar causa raiz del fallo cuando aplica
 * - Diagnostico: recomendaciones de accion al usuario
 * 
 * Mapeo: FR-009, FR-011
 * 
 * GET /audit/operations/:proposalId
 * 
 * Response 200:
 * {
 *   "proposalId": "prop_xxx",
 *   "state": "FAILED",
 *   "signal": { ... },
 *   "approvalHistory": [...],
 *   "executionHistory": [...],
 *   "failureDiagnosis": { ... }
 * }
 */

import { Router, Request, Response } from 'express';

/**
 * Detalle de señal de la propuesta
 */
export interface SignalDetail {
  signalId: string;
  instrument: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  generatedAt: Date;
  sources: Array<{
    name: string;
    signal: string;
    weight: number;
    evidence: string;
  }>;
}

/**
 * Entrada de aprobacion/rechazo en historial
 */
export interface ApprovalHistoryEntry {
  approvalId: string;
  action: 'approve' | 'reject';
  userId: string;
  role: string;
  timestamp: Date;
  mfaMethod?: string;
  disclaimerAcknowledged: boolean;
  rationale?: string;
}

/**
 * Intento de ejecucion con resultado
 */
export interface ExecutionAttempt {
  attemptNumber: number;
  submittedAt: Date;
  state: 'FILLED' | 'FAILED' | 'CANCELLED';
  orderId?: string;
  broker?: string;
  errorCode?: string;
  errorMessage?: string;
  brokerNativeErrorCode?: string;
  isRetryable?: boolean;
}

/**
 * Diagnostico de fallo con recomendacion de accion
 */
export interface FailureDiagnosis {
  rootCause?: string;           // INSUFFICIENT_FUNDS, BROKER_TIMEOUT, etc
  recommendation: string;      // Texto legible de que hacer
  canRetry: boolean;
  retryWindowMinutes?: number;
  requiresNewApproval: boolean;
}

/**
 * Detalle completo de una propuesta operativa
 */
export interface OperationDetail {
  proposalId: string;
  correlationId: string;
  currentState: string;

  signal: SignalDetail | null;
  approvalHistory: ApprovalHistoryEntry[];
  executionHistory: ExecutionAttempt[];

  failureDiagnosis: FailureDiagnosis | null;

  // Tiempos de ciclo
  createdAt?: Date;
  lastUpdatedAt?: Date;
  timeToApprovalMs?: number;    // desde creacion hasta primera aprobacion
  timeToExecutionMs?: number;   // desde aprobacion hasta ejecucion
}

/**
 * Generar diagnostico de fallo segun codigos de error
 */
function buildFailureDiagnosis(
  lastAttempt: ExecutionAttempt | undefined
): FailureDiagnosis | null {
  if (!lastAttempt || lastAttempt.state !== 'FAILED') {
    return null;
  }

  const { errorCode } = lastAttempt;

  const diagnoses: Record<string, FailureDiagnosis> = {
    INSUFFICIENT_FUNDS: {
      rootCause: 'INSUFFICIENT_FUNDS',
      recommendation: 'Fondos insuficientes en la cuenta del broker. Deposita fondos adicionales o reduce la cantidad de la orden.',
      canRetry: true,
      retryWindowMinutes: 60,
      requiresNewApproval: true,
    },
    INVALID_SYMBOL: {
      rootCause: 'INVALID_SYMBOL',
      recommendation: 'El instrumento no está disponible en el broker seleccionado. Verifica el símbolo o cambia de broker.',
      canRetry: false,
      requiresNewApproval: false,
    },
    BROKER_TIMEOUT: {
      rootCause: 'BROKER_TIMEOUT',
      recommendation: 'El broker no respondió a tiempo. El mercado puede estar volátil. Reintenta después de unos minutos.',
      canRetry: true,
      retryWindowMinutes: 15,
      requiresNewApproval: true,
    },
    RATE_LIMIT: {
      rootCause: 'RATE_LIMIT',
      recommendation: 'Se alcanzó el límite de solicitudes al broker. Espera el período de cooldown antes de reintentar.',
      canRetry: true,
      retryWindowMinutes: 2,
      requiresNewApproval: false,
    },
    NETWORK_ERROR: {
      rootCause: 'NETWORK_ERROR',
      recommendation: 'Error de conectividad con el broker. Verifica la conexión e intenta nuevamente.',
      canRetry: true,
      retryWindowMinutes: 5,
      requiresNewApproval: true,
    },
  };

  return diagnoses[errorCode || ''] || {
    recommendation: 'Error desconocido. Contacta al soporte con el proposalId para diagnóstico.',
    canRetry: false,
    requiresNewApproval: false,
  };
}

export function createOperationDetailRouter(): Router {
  const router = Router();

  /**
   * GET /audit/operations/:proposalId
   */
  router.get('/operations/:proposalId', async (req: Request, res: Response) => {
    try {
      const { proposalId } = req.params;

      if (!proposalId || proposalId.trim() === '') {
        return res.status(400).json({
          error: 'missing_proposal_id',
          code: 'INVALID_PARAMS',
          details: { message: 'proposalId is required' },
        });
      }

      // 🧠 FIC: Future implementation: load operation detail from Supabase (EN)
      // 🧠 FIC: Implementacion futura: cargar detalle operativo desde Supabase (ES)
      // - Cargar propuesta con estado actual
      // - Cargar señal asociada con evidencia
      // - Cargar historial de aprobaciones
      // - Cargar historial de ejecuciones con errores
      // - Calcular tiempos de ciclo

      // 🧠 FIC: Stub flow for not-found behavior while persistence is pending (EN)
      // 🧠 FIC: Flujo stub para caso no-encontrado mientras se implementa persistencia (ES)
      const proposalExists = process.env.AUTH_BYPASS === 'true'; // 🧠 FIC: TODO query proposal existence in Supabase / TODO consultar existencia de propuesta en Supabase (EN/ES)

      if (!proposalExists) {
        return res.status(404).json({
          error: 'proposal_not_found',
          code: 'NOT_FOUND',
          details: { proposalId },
        });
      }

      // 🧠 FIC: Stub response until full operational joins are available (EN)
      // 🧠 FIC: Respuesta stub hasta disponer de joins operativos completos (ES)
      const lastAttempt: ExecutionAttempt | undefined = process.env.AUTH_BYPASS === 'true'
        ? {
            attemptNumber: 1,
            submittedAt: new Date(),
            state: 'FILLED',
            orderId: 'order-demo-1',
            broker: 'IBKR'
          }
        : undefined;
      const failureDiagnosis = buildFailureDiagnosis(lastAttempt);

      const detail: OperationDetail = {
        proposalId,
        correlationId: process.env.AUTH_BYPASS === 'true' ? 'corr-demo-1' : '',
        currentState: process.env.AUTH_BYPASS === 'true' ? 'FILLED' : 'PENDING_APPROVAL',
        signal: process.env.AUTH_BYPASS === 'true'
          ? {
              signalId: 'dev-signal',
              instrument: 'AAPL',
              recommendation: 'BUY',
              confidence: 0.72,
              generatedAt: new Date(),
              sources: [
                {
                  name: 'technical-rsi',
                  signal: 'BUY',
                  weight: 0.7,
                  evidence: 'Ruptura alcista con soporte de volumen'
                }
              ]
            }
          : null,
        approvalHistory: process.env.AUTH_BYPASS === 'true'
          ? [
              {
                approvalId: 'appr-demo-1',
                action: 'approve',
                userId: 'dev-user',
                role: 'trader',
                timestamp: new Date(),
                mfaMethod: 'totp',
                disclaimerAcknowledged: true,
                rationale: 'Aprobacion demo para validacion local'
              }
            ]
          : [],
        executionHistory: lastAttempt ? [lastAttempt] : [],
        failureDiagnosis,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        timeToApprovalMs: 1500,
        timeToExecutionMs: 2200,
      };

      res.status(200).json({
        ...detail,
        createdAt: detail.createdAt?.toISOString(),
        lastUpdatedAt: detail.lastUpdatedAt?.toISOString(),
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        error: 'internal_error',
        code: 'SERVER_ERROR',
        details: { message: errorMsg },
      });
    }
  });

  return router;
}
