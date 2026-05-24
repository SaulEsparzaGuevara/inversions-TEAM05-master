/**
 * T043: History Metrics Service (Observability)
 * ===============================================
 * Servicio de metricas de observabilidad para el modulo de historial de auditoria.
 * 
 * Funcionalidad:
 * - Registrar latencia de consultas de historial (P50/P95/P99)
 * - Registrar completitud de traza (traceCompletenessPercent por ventana)
 * - Verificar SLO: 98% de consultas < 3000ms (SC-003)
 * - Exportar snapshot de metricas para monitoreo
 * 
 * Mapeo: SC-003, PL-006
 */

/**
 * Percentiles calculados sobre una ventana de muestras
 */
export interface LatencyPercentiles {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
  sampleCount: number;
}

/**
 * Estado de cumplimiento de SLO
 */
export interface SLOStatus {
  sloTarget: number;      // Porcentaje objetivo (ej: 98)
  sloWindow: number;      // Ventana en ms (ej: 3000)
  currentPercent: number; // % de consultas dentro del SLO
  isCompliant: boolean;
  violationsInWindow: number;
  totalInWindow: number;
}

/**
 * Snapshot de metricas exportable para monitoreo
 */
export interface HistoryMetricsSnapshot {
  capturedAt: Date;
  queryLatency: LatencyPercentiles;
  traceCompleteness: {
    averagePercent: number;
    minPercent: number;
    sampleCount: number;
  };
  sloStatus: SLOStatus;
}

/**
 * Capacidad maxima del buffer circular de muestras
 */
const MAX_SAMPLES = 1000;

/**
 * Tiempo maximo de consulta aceptable para SLO (SC-003)
 */
const SLO_LATENCY_THRESHOLD_MS = 3000;

/**
 * Objetivo de SLO: 98% de consultas dentro del umbral
 */
const SLO_TARGET_PERCENT = 98;

/**
 * Calcular percentil sobre un array ordenado de numeros
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export class HistoryMetricsService {
  private latencySamples: number[] = [];
  private traceCompletenessSamples: number[] = [];

  /**
   * Registrar latencia de una consulta de historial.
   * 
   * @param latencyMs Duracion de la consulta en milisegundos
   */
  recordQueryLatency(latencyMs: number): void {
    if (latencyMs < 0) return;

    this.latencySamples.push(latencyMs);

    // 🧠 FIC: Keep a bounded circular buffer for latency samples (EN)
    // 🧠 FIC: Mantener un buffer circular acotado para muestras de latencia (ES)
    if (this.latencySamples.length > MAX_SAMPLES) {
      this.latencySamples.shift();
    }
  }

  /**
   * Registrar completitud de traza de una consulta.
   * 
   * @param completenessPercent Porcentaje de items con traza completa (0-100)
   */
  recordTraceCompleteness(completenessPercent: number): void {
    if (completenessPercent < 0 || completenessPercent > 100) return;

    this.traceCompletenessSamples.push(completenessPercent);

    if (this.traceCompletenessSamples.length > MAX_SAMPLES) {
      this.traceCompletenessSamples.shift();
    }
  }

  /**
   * Calcular percentiles P50, P95, P99 sobre muestras de latencia.
   */
  getLatencyPercentiles(): LatencyPercentiles {
    if (this.latencySamples.length === 0) {
      return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, mean: 0, sampleCount: 0 };
    }

    const sorted = [...this.latencySamples].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;

    return {
      p50: percentile(sorted, 50),
      p95: percentile(sorted, 95),
      p99: percentile(sorted, 99),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean),
      sampleCount: sorted.length,
    };
  }

  /**
   * Calcular estado de cumplimiento del SLO SC-003.
   * 
   * SLO: 98% de consultas de historial < 3000ms
   */
  getSLOStatus(): SLOStatus {
    if (this.latencySamples.length === 0) {
      return {
        sloTarget: SLO_TARGET_PERCENT,
        sloWindow: SLO_LATENCY_THRESHOLD_MS,
        currentPercent: 100,
        isCompliant: true,
        violationsInWindow: 0,
        totalInWindow: 0,
      };
    }

    const violations = this.latencySamples.filter((ms) => ms > SLO_LATENCY_THRESHOLD_MS).length;
    const total = this.latencySamples.length;
    const withinSLO = total - violations;
    const currentPercent = Math.round((withinSLO / total) * 100);

    return {
      sloTarget: SLO_TARGET_PERCENT,
      sloWindow: SLO_LATENCY_THRESHOLD_MS,
      currentPercent,
      isCompliant: currentPercent >= SLO_TARGET_PERCENT,
      violationsInWindow: violations,
      totalInWindow: total,
    };
  }

  /**
   * Exportar snapshot completo de metricas.
   * 
   * Util para endpoints de health/metrics.
   */
  getSnapshot(): HistoryMetricsSnapshot {
    const latency = this.getLatencyPercentiles();
    const sloStatus = this.getSLOStatus();

    let avgTrace = 0;
    let minTrace = 100;

    if (this.traceCompletenessSamples.length > 0) {
      avgTrace = Math.round(
        this.traceCompletenessSamples.reduce((a, b) => a + b, 0) /
          this.traceCompletenessSamples.length
      );
      minTrace = Math.min(...this.traceCompletenessSamples);
    }

    return {
      capturedAt: new Date(),
      queryLatency: latency,
      traceCompleteness: {
        averagePercent: avgTrace,
        minPercent: minTrace,
        sampleCount: this.traceCompletenessSamples.length,
      },
      sloStatus,
    };
  }

  /**
   * Resetear todas las muestras (util para testing).
   */
  reset(): void {
    this.latencySamples = [];
    this.traceCompletenessSamples = [];
  }
}
