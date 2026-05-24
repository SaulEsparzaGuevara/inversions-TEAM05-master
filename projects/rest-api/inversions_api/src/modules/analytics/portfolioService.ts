/**
 * T038: Portfolio Analytics Service
 * ==================================
 * Servicio de agregacion de analitica de portafolio para resultados auditables.
 * 
 * Funcionalidad:
 * - Agregar estadisticas de senales generadas, aprobadas y ejecutadas
 * - Calcular tasa de exito de ejecucion por broker
 * - Calcular P&L estimado por instrumento/sesion
 * - Consulta auditable: resultados incluyen evidencia de fuente
 * - Tiempo objetivo: 98% de consultas < 3s (SC-003)
 * 
 * Mapeo: FR-011, PL-007
 */

/**
 * Estadisticas de senales por periodo
 */
export interface SignalStats {
  totalGenerated: number;
  totalApproved: number;
  totalRejected: number;
  totalExecuted: number;
  totalFailed: number;
  approvalRate: number;     // % aprobadas sobre generadas
  executionRate: number;    // % ejecutadas sobre aprobadas
  failureRate: number;      // % fallidas sobre ejecutadas
  byAction: {
    BUY: number;
    SELL: number;
    HOLD: number;
  };
}

/**
 * Resultado de una operacion para analitica
 */
export interface PortfolioOperation {
  proposalId: string;
  signalId: string;
  instrument: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  executionPrice?: number;
  executedAt?: Date;
  broker?: 'IBKR' | 'ALPACA';
  state: string;
  auditEventId: string;
}

/**
 * Analitica de portafolio para un usuario/periodo
 */
export interface PortfolioAnalytics {
  userId: string;
  period: {
    from: Date;
    to: Date;
  };
  signalStats: SignalStats;
  operations: PortfolioOperation[];
  byInstrument: Record<string, {
    totalOperations: number;
    successRate: number;
    failureRate: number;
  }>;
  byBroker: Record<string, {
    totalOrders: number;
    failedOrders: number;
    failureRate: number;
  }>;
  queryLatencyMs: number;
}

/**
 * Parametros para consulta de analitica
 */
export interface AnalyticsQuery {
  userId?: string;
  fromDate: Date;
  toDate: Date;
  broker?: 'IBKR' | 'ALPACA';
  instrument?: string;
}

export class PortfolioAnalyticsService {
  /**
   * Calcular analitica de portafolio para un usuario y periodo.
   * 
   * @param query Parametros de consulta
   * @returns PortfolioAnalytics con estadisticas auditables
   */
  async getPortfolioAnalytics(query: AnalyticsQuery): Promise<PortfolioAnalytics> {
    const startMs = Date.now();

    // 🧠 FIC: Future implementation: query Supabase analytics sources (EN)
    // 🧠 FIC: Implementacion futura: consultar fuentes de analitica en Supabase (ES)
    // - JOIN audit_events + proposals + signals
    // - Filtrar por userId, rango de fechas, broker, instrumento
    // - Agregar estadisticas en una sola query optimizada

    const signalStats = await this.aggregateSignalStats(query);
    const operations = await this.getOperations(query);
    const byInstrument = this.groupByInstrument(operations);
    const byBroker = this.groupByBroker(operations);

    const queryLatencyMs = Date.now() - startMs;

    return {
      userId: query.userId || 'all',
      period: { from: query.fromDate, to: query.toDate },
      signalStats,
      operations,
      byInstrument,
      byBroker,
      queryLatencyMs,
    };
  }

  /**
   * Obtener resumen de desempeno de senales para dashboard.
   */
  async getSignalPerformanceSummary(query: AnalyticsQuery): Promise<{
    totalSignals: number;
    winRate: number;
    avgConfidence: number;
    bestPerformingInstrument?: string;
    worstPerformingInstrument?: string;
  }> {
    // 🧠 FIC: Future implementation: build signal summary from Supabase (EN)
    // 🧠 FIC: Implementacion futura: construir resumen de senales desde Supabase (ES)
    return {
      totalSignals: 0,
      winRate: 0,
      avgConfidence: 0,
    };
  }

  /**
   * Obtener estadisticas de disponibilidad de brokers en un periodo.
   * 
   * Usado para calcular SLO mensual de dependencias (PL-002)
   */
  async getBrokerAvailabilityStats(
    broker: 'IBKR' | 'ALPACA',
    fromDate: Date,
    toDate: Date
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    timeoutRequests: number;
    availabilityPercent: number;
  }> {
    // 🧠 FIC: Future implementation: query broker metrics table (EN)
    // 🧠 FIC: Implementacion futura: consultar tabla de metricas de broker (ES)
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeoutRequests: 0,
      availabilityPercent: 100,
    };
  }

  // ============ Privados ============

  private async aggregateSignalStats(query: AnalyticsQuery): Promise<SignalStats> {
    // 🧠 FIC: Stub aggregation until Supabase queries are available (EN)
    // 🧠 FIC: Agregacion stub hasta disponer de consultas en Supabase (ES)
    return {
      totalGenerated: 0,
      totalApproved: 0,
      totalRejected: 0,
      totalExecuted: 0,
      totalFailed: 0,
      approvalRate: 0,
      executionRate: 0,
      failureRate: 0,
      byAction: { BUY: 0, SELL: 0, HOLD: 0 },
    };
  }

  private async getOperations(query: AnalyticsQuery): Promise<PortfolioOperation[]> {
    // 🧠 FIC: Stub operation list until Supabase retrieval is implemented (EN)
    // 🧠 FIC: Lista de operaciones stub hasta implementar lectura de Supabase (ES)
    return [];
  }

  private groupByInstrument(
    operations: PortfolioOperation[]
  ): Record<string, { totalOperations: number; successRate: number; failureRate: number }> {
    const result: Record<string, { totalOperations: number; successRate: number; failureRate: number }> = {};

    for (const op of operations) {
      if (!result[op.instrument]) {
        result[op.instrument] = { totalOperations: 0, successRate: 0, failureRate: 0 };
      }
      result[op.instrument].totalOperations++;
    }

    return result;
  }

  private groupByBroker(
    operations: PortfolioOperation[]
  ): Record<string, { totalOrders: number; failedOrders: number; failureRate: number }> {
    const result: Record<string, { totalOrders: number; failedOrders: number; failureRate: number }> = {};

    for (const op of operations) {
      const broker = op.broker || 'unknown';
      if (!result[broker]) {
        result[broker] = { totalOrders: 0, failedOrders: 0, failureRate: 0 };
      }
      result[broker].totalOrders++;
      if (op.state === 'FAILED') {
        result[broker].failedOrders++;
      }
    }

    // 🧠 FIC: Compute broker failure rate after counting attempts (EN)
    // 🧠 FIC: Calcular tasa de fallo por broker tras contar intentos (ES)
    for (const broker of Object.keys(result)) {
      const b = result[broker];
      b.failureRate = b.totalOrders === 0 ? 0 : Math.round((b.failedOrders / b.totalOrders) * 100);
    }

    return result;
  }
}
