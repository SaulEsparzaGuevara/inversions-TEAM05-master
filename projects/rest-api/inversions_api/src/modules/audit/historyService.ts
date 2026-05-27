/**
 * T037: Audit History Service
 * ============================
 * Servicio de consulta de historial de auditoria con filtros de correlacion.
 * 
 * Funcionalidad:
 * - Consultar eventos de auditoria por proposal_id, signal_id, user_id, correlation_id
 * - Paginacion (page + pageSize)
 * - Filtros por rango de fechas, action_type, broker, instrumento
 * - Metadata de completitud de traza (todos los campos minimos presentes)
 * - Tiempo objetivo de consulta: 98% de consultas < 3s (SC-003)
 * 
 * Mapeo: FR-011, PL-006, SC-003
 */

/**
 * Filtros disponibles para consultar historial de auditoria
 */
export interface AuditHistoryFilters {
  proposalId?: string;
  signalId?: string;
  userId?: string;
  correlationId?: string;
  broker?: 'IBKR' | 'ALPACA';
  instrument?: string;
  actionTypes?: string[];
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Parametros de paginacion
 */
export interface PaginationParams {
  page: number;        // 1-based
  pageSize: number;    // max 100
}

/**
 * Entrada de historial de auditoria normalizada
 */
export interface AuditHistoryEntry {
  eventId: string;
  timestampUtc: Date;
  correlationId: string;

  signalId: string;
  proposalId: string;
  userId: string;
  role: string;

  actionType: string;
  previousState: string;
  newState: string;

  broker?: string;
  instrument: string;
  orderType?: string;
  quantity?: number;
  price?: number;
  orderId?: string;

  outcomeCode?: string;
  errorCode?: string;
  errorMessage?: string;

  mfaUsed?: string;

  /**
   * Indicador de completitud de traza.
   * true = todos los campos minimos obligatorios estan presentes
   */
  traceComplete: boolean;
  /**
   * Campos faltantes para completitud de traza (si traceComplete=false)
   */
  missingFields?: string[];
}

/**
 * Respuesta paginada del historial de auditoria
 */
export interface AuditHistoryPage {
  items: AuditHistoryEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  queryLatencyMs: number;
  traceCompletenessPercent: number; // % de items con trazabilidad completa
}

/**
 * Campos minimos obligatorios para trazabilidad completa (segun PL-006)
 */
const REQUIRED_TRACE_FIELDS: (keyof AuditHistoryEntry)[] = [
  'eventId',
  'timestampUtc',
  'correlationId',
  'signalId',
  'proposalId',
  'userId',
  'actionType',
  'previousState',
  'newState',
  'instrument',
];

export class AuditHistoryService {
  /**
   * Consultar historial de auditoria con filtros y paginacion.
   * 
   * Objetivo: 98% de consultas < 3s (SC-003)
   * 
   * @param filters Filtros de busqueda
   * @param pagination Parametros de paginacion
   * @returns AuditHistoryPage con items y metadata de completitud
   */
  async queryHistory(
    filters: AuditHistoryFilters,
    pagination: PaginationParams
  ): Promise<AuditHistoryPage> {
    const startMs = Date.now();

    // 🧠 FIC: Future implementation: query Supabase with filters (EN)
    // 🧠 FIC: Implementacion futura: consultar Supabase con filtros (ES)
    // - JOIN audit_events + proposals + signals
    // - WHERE filtros aplicables
    // - ORDER BY timestamp_utc DESC
    // - LIMIT pageSize OFFSET (page-1)*pageSize
    // - INDEX en (proposal_id, timestamp_utc), (user_id, timestamp_utc), (signal_id)

    // 🧠 FIC: Stub response with empty items and valid metadata (EN)
    // 🧠 FIC: Respuesta stub con items vacios y metadata valida (ES)
    const items: AuditHistoryEntry[] = [];
    const total = 0;

    // 🧠 FIC: Compute trace completeness for the current page (EN)
    // 🧠 FIC: Calcular completitud de traza para la pagina actual (ES)
    const analyzed = this.analyzeTraceCompleteness(items);
    const traceCompletenessPercent = total === 0 ? 100 : analyzed.completePercent;

    const queryLatencyMs = Date.now() - startMs;

    return {
      items: analyzed.items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      hasMore: pagination.page * pagination.pageSize < total,
      queryLatencyMs,
      traceCompletenessPercent,
    };
  }

  /**
   * Obtener la cadena completa de eventos para una propuesta.
   * 
   * Esto incluye todos los eventos desde evaluacion hasta ejecucion/fallo,
   * ordenados cronologicamente por correlation_id.
   */
  async getEventChain(proposalId: string): Promise<AuditHistoryEntry[]> {
    // 🧠 FIC: Future implementation: query Supabase event chain (EN)
    // 🧠 FIC: Implementacion futura: consultar cadena de eventos en Supabase (ES)
    // SELECT * FROM audit_events WHERE proposal_id = $proposalId ORDER BY timestamp_utc ASC
    return [];
  }

  /**
   * Obtener eventos recientes de un usuario (ultimos N eventos).
   */
  async getRecentByUser(userId: string, limit: number = 50): Promise<AuditHistoryEntry[]> {
    // 🧠 FIC: Future implementation: query recent events by user in Supabase (EN)
    // 🧠 FIC: Implementacion futura: consultar eventos recientes por usuario en Supabase (ES)
    return [];
  }

  /**
   * Calcular completitud de trazabilidad de un conjunto de items.
   * 
   * Para cada item, verificar que todos los campos minimos obligatorios esten presentes.
   */
  private analyzeTraceCompleteness(items: AuditHistoryEntry[]): {
    items: AuditHistoryEntry[];
    completePercent: number;
  } {
    if (items.length === 0) {
      return { items, completePercent: 100 };
    }

    let completeCount = 0;
    const enriched = items.map((item) => {
      const missingFields = REQUIRED_TRACE_FIELDS.filter(
        (field) => !item[field] || item[field] === null || item[field] === undefined
      ) as string[];

      const traceComplete = missingFields.length === 0;
      if (traceComplete) completeCount++;

      return {
        ...item,
        traceComplete,
        missingFields: traceComplete ? undefined : missingFields,
      };
    });

    return {
      items: enriched,
      completePercent: Math.round((completeCount / items.length) * 100),
    };
  }

  /**
   * Obtener estadisticas de completitud de traza para un rango de fechas.
   * 
  * 🧠 FIC: Future implementation: aggregate daily/weekly quality metrics (EN)
  * 🧠 FIC: Implementacion futura: agregar metricas de calidad por dia/semana (ES)
   */
  async getTraceCompletenessStats(fromDate: Date, toDate: Date): Promise<{
    totalEvents: number;
    completeEvents: number;
    completenessPercent: number;
    byDay: Array<{ date: string; total: number; complete: number }>;
  }> {
    // 🧠 FIC: Stub values until persistence and aggregations are implemented (EN)
    // 🧠 FIC: Valores stub hasta implementar persistencia y agregaciones (ES)
    return {
      totalEvents: 0,
      completeEvents: 0,
      completenessPercent: 100,
      byDay: [],
    };
  }
}
