/**
 * FIC: Strategy Output Standard - Transversal contract for all strategy outputs.
 * Ensures consistent structure and metadata across all signal generation modules.
 * 
 * FIC: Estándar de Salida de Estrategia - Contrato transversal para todas las salidas de estrategia.
 * Asegura estructura consistente y metadatos en todos los módulos de generación de señales.
 * 
 * Constraint: All strategy modules (signals, market analysis, technical analysis, etc.)
 * MUST conform to this contract when emitting recommendations.
 * This enables:
 *   - Standardized scoring and confidence metrics
 *   - Unified traceability (trace_id, senal_id)
 *   - Consistent RLS policy enforcement
 *   - Audit-ready evidence linking
 * 
 * Restricción: Todos los módulos de estrategia (señales, análisis de mercado, análisis técnico, etc.)
 * DEBEN conformarse a este contrato al emitir recomendaciones.
 * Esto permite:
 *   - Métricas de puntuación y confianza estandarizadas
 *   - Trazabilidad unificada (trace_id, senal_id)
 *   - Aplicación consistente de políticas RLS
 *   - Vinculación de evidencia lista para auditoría
 */

/**
 * FIC: Enumeration of recommendation types across all strategy domains.
 * FIC: Enumeración de tipos de recomendaciones en todos los dominios de estrategia.
 */
export enum RecommendationType {
  COMPRA = "compra",
  VENTA = "venta",
  MANTENER = "mantener",
  COBERTURAS = "coberturas",
  REDUCIR_EXPOSICION = "reducir_exposicion",
}

/**
 * FIC: Enumeration of confidence levels based on decision quality.
 * ALTA: Strong confluence across multiple indicators; low false positive history
 * MEDIA: Mixed signals or moderate indicator agreement
 * BAJA: Weak signals; high uncertainty or conflicting indicators
 * 
 * FIC: Enumeración de niveles de confianza basados en calidad de decisión.
 * ALTA: Confluencia fuerte en múltiples indicadores; bajo historial de falsos positivos
 * MEDIA: Señales mixtas o acuerdo moderado de indicadores
 * BAJA: Señales débiles; alta incertidumbre o indicadores conflictivos
 */
export enum ConfidenceLevel {
  ALTA = "alta",
  MEDIA = "media",
  BAJA = "baja",
}

/**
 * FIC: Enumeration of strategy module sources.
 * Used to track which strategy generated the recommendation.
 * 
 * FIC: Enumeración de fuentes de módulos de estrategia.
 * Se utiliza para rastrear qué estrategia generó la recomendación.
 */
export enum StrategySource {
  TECNICO = "tecnico",
  FUNDAMENTAL = "fundamental",
  CONFLUENCE = "confluence",
  MECANICO = "mecanico",
  MACHINE_LEARNING = "machine_learning",
}

/**
 * FIC: Evidence metadata structure for supporting a recommendation.
 * Each piece of evidence must include type, data, and source for audit trail.
 * 
 * FIC: Estructura de metadatos de evidencia para respaldar una recomendación.
 * Cada pieza de evidencia debe incluir tipo, datos y fuente para registro de auditoría.
 */
export interface EvidenceMetadata {
  /**
   * FIC: Canonical evidence type (e.g., "precio_mercado", "volatilidad", "volumen")
   * FIC: Tipo de evidencia canónico (p.ej., "precio_mercado", "volatilidad", "volumen")
   */
  tipo: string;

  /**
   * FIC: Evidence data as JSON (e.g., { "precio": 150.25, "volumen": 1000000 })
   * FIC: Datos de evidencia como JSON (p.ej., { "precio": 150.25, "volumen": 1000000 })
   */
  datos: Record<string, any>;

  /**
   * FIC: Source of evidence (e.g., "ALPACA", "IBKR", "YAHOO_FINANCE")
   * FIC: Fuente de evidencia (p.ej., "ALPACA", "IBKR", "YAHOO_FINANCE")
   */
  fuente: string;

  /**
   * FIC: Timestamp of evidence collection
   * FIC: Marca de tiempo de recopilación de evidencia
   */
  capturada_en: Date;

  /**
   * FIC: Confidence in this evidence (0.0 to 1.0)
   * FIC: Confianza en esta evidencia (0.0 a 1.0)
   */
  confianza?: number;
}

/**
 * FIC: Scoring breakdown for transparency.
 * Allows decision makers to understand how the recommendation score was calculated.
 * 
 * FIC: Desglose de puntuación para transparencia.
 * Permite a los tomadores de decisiones entender cómo se calculó la puntuación de recomendación.
 */
export interface ScoreBreakdown {
  /**
   * FIC: Total confluence score (0.0 to 1.0)
   * FIC: Puntuación de confluencia total (0.0 a 1.0)
   */
  total: number;

  /**
   * FIC: Individual component scores (weighted)
   * FIC: Puntuaciones de componentes individuales (ponderados)
   * Example: { "tecnico": 0.8, "fundamental": 0.6, "mecanico": 0.9 }
   */
  componentes: Record<StrategySource, number>;

  /**
   * FIC: Rationale for the score (human-readable explanation)
   * FIC: Justificación de la puntuación (explicación legible por humanos)
   */
  razon: string;

  /**
   * FIC: Number of agreeing strategies
   * FIC: Número de estrategias que concuerdan
   */
  num_estrategias_coincidentes: number;

  /**
   * FIC: Number of conflicting strategies
   * FIC: Número de estrategias en conflicto
   */
  num_estrategias_conflictivas: number;
}

/**
 * FIC: Standard output contract for all strategy modules.
 * This interface MUST be implemented by every strategy emitting recommendations.
 * 
 * FIC: Contrato de salida estándar para todos los módulos de estrategia.
 * Esta interfaz DEBE ser implementada por cada estrategia que emita recomendaciones.
 * 
 * Usage: When a strategy module generates a signal, it creates a StrategyOutput,
 * populates all fields, and passes it to the confluenceEngine for aggregation.
 * 
 * Uso: Cuando un módulo de estrategia genera una señal, crea un StrategyOutput,
 * rellena todos los campos y lo pasa al confluenceEngine para agregación.
 */
export interface StrategyOutput {
  /**
   * FIC: Globally unique identifier for this output (UUID v4)
   * FIC: Identificador único global para esta salida (UUID v4)
   */
  id: string;

  /**
   * FIC: Trace ID for correlated logging and debugging.
   * Should be propagated from request context or generated here.
   * 
   * FIC: ID de rastreo para logging y debugging correlacionados.
   * Debe propagarse desde el contexto de solicitud o generarse aquí.
   */
  trace_id: string;

  /**
   * FIC: Source strategy module that generated this output
   * FIC: Módulo de estrategia de origen que generó esta salida
   */
  source: StrategySource;

  /**
   * FIC: Instrument identifier (e.g., "AAPL", "SPY/250321C100")
   * FIC: Identificador de instrumento (p.ej., "AAPL", "SPY/250321C100")
   */
  instrumento: string;

  /**
   * FIC: Recommendation type (compra, venta, mantener, etc.)
   * FIC: Tipo de recomendación (compra, venta, mantener, etc.)
   */
  tipo_recomendacion: RecommendationType;

  /**
   * FIC: Confluence score (0.0 to 1.0) for this individual strategy.
   * Will be aggregated with other strategies in confluenceEngine.
   * 
   * FIC: Puntuación de confluencia (0.0 a 1.0) para esta estrategia individual.
   * Se agregará con otras estrategias en confluenceEngine.
   */
  confluencia_score: number;

  /**
   * FIC: Confidence level (ALTA, MEDIA, BAJA)
   * FIC: Nivel de confianza (ALTA, MEDIA, BAJA)
   */
  confianza_nivel: ConfidenceLevel;

  /**
   * FIC: Detailed score breakdown for transparency
   * FIC: Desglose detallado de puntuación para transparencia
   */
  score_breakdown: ScoreBreakdown;

  /**
   * FIC: Supporting evidence for this recommendation
   * Array of evidence items; each must be logged to evidencia_operacion table
   * 
   * FIC: Evidencia de apoyo para esta recomendación
   * Array de elementos de evidencia; cada uno debe registrarse en la tabla evidencia_operacion
   */
  evidencia: EvidenceMetadata[];

  /**
   * FIC: Optional parameters or context specific to this strategy
   * (e.g., { "lookback_period": "30d", "technical_indicators": [...] })
   * 
   * FIC: Parámetros opcionales o contexto específico de esta estrategia
   * (p.ej., { "lookback_period": "30d", "technical_indicators": [...] })
   */
  parametros_contexto?: Record<string, any>;

  /**
   * FIC: Timestamp when this output was generated
   * FIC: Marca de tiempo cuando se generó esta salida
   */
  generada_en: Date;

  /**
   * FIC: ID of the user/system that generated this output (optional)
   * FIC: ID del usuario/sistema que generó esta salida (opcional)
   */
  generado_por?: string;

  /**
   * FIC: Status of this output (active, archived, superseded)
   * FIC: Estado de esta salida (activa, archivada, superada)
   */
  estado?: "activa" | "archivada" | "superada";

  /**
   * FIC: Optional human-readable summary or insight
   * FIC: Resumen opcional legible por humanos o insight
   */
  resumen?: string;
}

/**
 * FIC: Validation helper to ensure a StrategyOutput conforms to the contract.
 * FIC: Helper de validación para asegurar que un StrategyOutput cumpla con el contrato.
 */
export function validateStrategyOutput(output: unknown): output is StrategyOutput {
  const o = output as any;

  // FIC: Check required fields
  if (!o.id || typeof o.id !== "string") return false;
  if (!o.trace_id || typeof o.trace_id !== "string") return false;
  if (!o.source || !Object.values(StrategySource).includes(o.source)) return false;
  if (!o.instrumento || typeof o.instrumento !== "string") return false;
  if (!o.tipo_recomendacion || !Object.values(RecommendationType).includes(o.tipo_recomendacion))
    return false;
  if (typeof o.confluencia_score !== "number" || o.confluencia_score < 0 || o.confluencia_score > 1)
    return false;
  if (!o.confianza_nivel || !Object.values(ConfidenceLevel).includes(o.confianza_nivel))
    return false;
  if (!o.score_breakdown || typeof o.score_breakdown !== "object") return false;
  if (!Array.isArray(o.evidencia)) return false;
  if (!(o.generada_en instanceof Date)) return false;

  // FIC: If all checks pass, it conforms to the contract
  return true;
}

/**
 * FIC: Factory function to create a StrategyOutput with defaults and validation.
 * FIC: Función de fábrica para crear un StrategyOutput con valores predeterminados y validación.
 */
export function createStrategyOutput(
  source: StrategySource,
  instrumento: string,
  tipo: RecommendationType,
  confluencia: number,
  confidence: ConfidenceLevel,
  breakdown: ScoreBreakdown,
  evidencia: EvidenceMetadata[],
  traceId?: string
): StrategyOutput {
  const output: StrategyOutput = {
    id: Math.random().toString(36).substr(2, 9), // Simple ID; consider uuid package for UUIDs
    trace_id: traceId || Math.random().toString(36).substr(2, 9),
    source,
    instrumento,
    tipo_recomendacion: tipo,
    confluencia_score: confluencia,
    confianza_nivel: confidence,
    score_breakdown: breakdown,
    evidencia,
    generada_en: new Date(),
    estado: "activa",
  };

  if (!validateStrategyOutput(output)) {
    throw new Error("Failed to create valid StrategyOutput. Falló al crear StrategyOutput válido.");
  }

  return output;
}

export default StrategyOutput;
