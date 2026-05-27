-- FIC: Baseline migration for dashboard feature (inversions_app TEAM-01)
-- FIC: Migración baseline para feature de dashboard (inversions_app TEAM-01)
--
-- Purpose: Create core tables for signals, decisions, execution attempts, and audit trail.
-- Propósito: Crear tablas principales para señales, decisiones, intentos de ejecución y registro de auditoría.
--
-- Tables created:
--   1. senal_confluente: Consolidated signal with version for optimistic locking
--   2. decision_humana: Human decision (approve/reject) with decision maker and timestamp
--   3. intento_ejecucion: Execution attempt to broker with status and result
--   4. evento_auditoria: Audit trail for all state transitions
--   5. evidencia_operacion: Evidence supporting signal generation and decision

-- FIC: Enable UUID extension if not present
-- FIC: Habilitar extensión UUID si no está presente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- FIC: Table for consolidated signals (confluencia de recomendaciones)
-- FIC: Tabla para señales consolidadas (confluencia de recomendaciones)
-- Constraint: version field MUST be incremented atomically for optimistic locking
-- Restricción: campo version DEBE ser incrementado atómicamente para optimistic locking
CREATE TABLE IF NOT EXISTS senal_confluente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FIC: Signal metadata
  -- FIC: Metadatos de la señal
  instrumento VARCHAR(20) NOT NULL, -- e.g., "AAPL", "SPY/250321C100"
  tipo_senal VARCHAR(50) NOT NULL, -- e.g., "call", "put", "recomendacion_compra"
  confluencia_score NUMERIC(3, 2) NOT NULL CHECK (confluencia_score >= 0 AND confluencia_score <= 1),
  confianza NUMERIC(3, 2) NOT NULL CHECK (confianza >= 0 AND confianza <= 1),
  
  -- FIC: Versioning for optimistic locking
  -- FIC: Versionado para optimistic locking
  version INT NOT NULL DEFAULT 1 CHECK (version > 0),
  
  -- FIC: Operational state
  -- FIC: Estado operacional
  estado VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'rechazada', 'ejecutada', 'expirada')),
  
  -- FIC: Context snapshot: JSON of inputs to signal generation
  -- FIC: Snapshot del contexto: JSON de inputs a generación de señal
  -- (Field added in migration 002_context_snapshot.sql)
  -- (Campo agregado en migración 002_context_snapshot.sql)
  
  -- FIC: Traceability
  -- FIC: Trazabilidad
  trace_id VARCHAR(36) NOT NULL UNIQUE,
  
  -- FIC: Timestamps
  -- FIC: Marcas de tiempo
  creada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- FIC: Audit fields
  -- FIC: Campos de auditoría
  creado_por UUID,
  
  CONSTRAINT fk_senal_creado_por FOREIGN KEY (creado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- FIC: Indexes for common queries on senal_confluente
-- FIC: Índices para consultas comunes en senal_confluente
CREATE INDEX IF NOT EXISTS idx_senal_confluente_instrumento ON senal_confluente(instrumento);
CREATE INDEX IF NOT EXISTS idx_senal_confluente_estado ON senal_confluente(estado);
CREATE INDEX IF NOT EXISTS idx_senal_confluente_trace_id ON senal_confluente(trace_id);
CREATE INDEX IF NOT EXISTS idx_senal_confluente_creada_en ON senal_confluente(creada_en DESC);

-- FIC: Table for human decisions (aprobaciones/rechazos)
-- FIC: Tabla para decisiones humanas (aprobaciones/rechazos)
CREATE TABLE IF NOT EXISTS decision_humana (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FIC: Reference to signal being decided
  -- FIC: Referencia a la señal siendo decidida
  senal_id UUID NOT NULL UNIQUE,
  
  -- FIC: Decision type and rationale
  -- FIC: Tipo de decisión y justificación
  tipo_decision VARCHAR(20) NOT NULL CHECK (tipo_decision IN ('aprobado', 'rechazado')),
  razon_decision TEXT,
  
  -- FIC: Decision maker and timing
  -- FIC: Persona que decide y timing
  decidido_por UUID NOT NULL,
  decidida_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- FIC: RLS constraint: decision maker must be authenticated user
  -- FIC: Restricción RLS: persona que decide debe ser usuario autenticado
  CONSTRAINT fk_decision_senal FOREIGN KEY (senal_id) REFERENCES senal_confluente(id) ON DELETE CASCADE,
  CONSTRAINT fk_decision_decidido_por FOREIGN KEY (decidido_por) REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- FIC: Indexes for common queries on decision_humana
-- FIC: Índices para consultas comunes en decision_humana
CREATE INDEX IF NOT EXISTS idx_decision_humana_senal_id ON decision_humana(senal_id);
CREATE INDEX IF NOT EXISTS idx_decision_humana_decidido_por ON decision_humana(decidido_por);
CREATE INDEX IF NOT EXISTS idx_decision_humana_decidida_en ON decision_humana(decidida_en DESC);
CREATE INDEX IF NOT EXISTS idx_decision_humana_tipo ON decision_humana(tipo_decision);

-- FIC: Table for execution attempts (intentos de ejecución en brokers)
-- FIC: Tabla para intentos de ejecución (intentos de ejecución en brokers)
CREATE TABLE IF NOT EXISTS intento_ejecucion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FIC: Reference to decision
  -- FIC: Referencia a la decisión
  decision_id UUID NOT NULL,
  
  -- FIC: Broker and execution details
  -- FIC: Detalles de broker y ejecución
  broker VARCHAR(50) NOT NULL, -- e.g., "IBKR", "ALPACA"
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviado', 'ejecutado', 'fallo', 'cancelado')),
  resultado_ejecucion TEXT,
  
  -- FIC: Execution timing and metadata
  -- FIC: Timing de ejecución y metadatos
  intentado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completado_en TIMESTAMP,
  ejecutado_por UUID,
  
  -- FIC: Broker response fields
  -- FIC: Campos de respuesta del broker
  broker_order_id VARCHAR(100),
  broker_error_code VARCHAR(20),
  broker_error_message TEXT,
  
  CONSTRAINT fk_intento_decision FOREIGN KEY (decision_id) REFERENCES decision_humana(id) ON DELETE CASCADE,
  CONSTRAINT fk_intento_ejecutado_por FOREIGN KEY (ejecutado_por) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- FIC: Indexes for common queries on intento_ejecucion
-- FIC: Índices para consultas comunes en intento_ejecucion
CREATE INDEX IF NOT EXISTS idx_intento_ejecucion_decision_id ON intento_ejecucion(decision_id);
CREATE INDEX IF NOT EXISTS idx_intento_ejecucion_broker ON intento_ejecucion(broker);
CREATE INDEX IF NOT EXISTS idx_intento_ejecucion_estado ON intento_ejecucion(estado);
CREATE INDEX IF NOT EXISTS idx_intento_ejecucion_intentado_en ON intento_ejecucion(intentado_en DESC);

-- FIC: Table for audit events (eventos de auditoría transversales)
-- FIC: Tabla para eventos de auditoría (eventos de auditoría transversales)
-- Purpose: Immutable log of all state transitions for compliance and debugging
-- Propósito: Registro inmutable de todas las transiciones de estado para cumplimiento y debugging
CREATE TABLE IF NOT EXISTS evento_auditoria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FIC: Event categorization
  -- FIC: Categorización de eventos
  tipo_evento VARCHAR(50) NOT NULL, -- e.g., "senal_creada", "decision_aprobada", "ejecucion_exitosa", "conflicto_concurrencia"
  entidad_tipo VARCHAR(50) NOT NULL, -- e.g., "senal_confluente", "decision_humana", "intento_ejecucion"
  entidad_id UUID NOT NULL,
  
  -- FIC: Traceability
  -- FIC: Trazabilidad
  trace_id VARCHAR(36),
  senal_id UUID,
  
  -- FIC: Event details
  -- FIC: Detalles del evento
  detalles JSONB,
  
  -- FIC: Actor and timing
  -- FIC: Actor y timing
  actor_id UUID,
  ocurrido_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_evento_actor FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- FIC: Indexes for efficient audit queries
-- FIC: Índices para consultas de auditoría eficientes
CREATE INDEX IF NOT EXISTS idx_evento_auditoria_entidad ON evento_auditoria(entidad_tipo, entidad_id);
CREATE INDEX IF NOT EXISTS idx_evento_auditoria_trace_id ON evento_auditoria(trace_id);
CREATE INDEX IF NOT EXISTS idx_evento_auditoria_senal_id ON evento_auditoria(senal_id);
CREATE INDEX IF NOT EXISTS idx_evento_auditoria_tipo ON evento_auditoria(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_evento_auditoria_ocurrido_en ON evento_auditoria(ocurrido_en DESC);

-- FIC: Table for operation evidence (evidencia de operación)
-- FIC: Tabla para evidencia de operación (evidencia de operación)
-- Purpose: Stores supporting data for signals (market data, analysis results, etc.)
-- Propósito: Almacena datos de apoyo para señales (datos de mercado, resultados de análisis, etc.)
CREATE TABLE IF NOT EXISTS evidencia_operacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- FIC: Reference to signal
  -- FIC: Referencia a la señal
  senal_id UUID NOT NULL,
  
  -- FIC: Evidence classification
  -- FIC: Clasificación de evidencia
  tipo_evidencia VARCHAR(50) NOT NULL, -- e.g., "precio_mercado", "volatilidad", "volumen", "analisis_tecnico"
  
  -- FIC: Evidence data and provenance
  -- FIC: Datos de evidencia y procedencia
  datos JSONB NOT NULL,
  fuente VARCHAR(100),
  
  -- FIC: Timing
  -- FIC: Timing
  capturada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_evidencia_senal FOREIGN KEY (senal_id) REFERENCES senal_confluente(id) ON DELETE CASCADE
);

-- FIC: Indexes for evidence queries
-- FIC: Índices para consultas de evidencia
CREATE INDEX IF NOT EXISTS idx_evidencia_operacion_senal_id ON evidencia_operacion(senal_id);
CREATE INDEX IF NOT EXISTS idx_evidencia_operacion_tipo ON evidencia_operacion(tipo_evidencia);

-- FIC: Enable RLS on all tables
-- FIC: Habilitar RLS en todas las tablas
ALTER TABLE senal_confluente ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_humana ENABLE ROW LEVEL SECURITY;
ALTER TABLE intento_ejecucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencia_operacion ENABLE ROW LEVEL SECURITY;

-- FIC: RLS Policy: senal_confluente - public read (signals are operational data)
-- FIC: Política RLS: senal_confluente - lectura pública (las señales son datos operacionales)
CREATE POLICY IF NOT EXISTS "senal_confluente_read_all"
  ON senal_confluente
  FOR SELECT
  USING (true);

-- FIC: RLS Policy: senal_confluente - insert only by service role (via backend)
-- FIC: Política RLS: senal_confluente - insertar solo por rol de servicio (vía backend)
CREATE POLICY IF NOT EXISTS "senal_confluente_insert_service"
  ON senal_confluente
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- FIC: RLS Policy: decision_humana - read own decisions or all (based on role)
-- FIC: Política RLS: decision_humana - leer decisiones propias o todas (basado en rol)
CREATE POLICY IF NOT EXISTS "decision_humana_read_own"
  ON decision_humana
  FOR SELECT
  USING (
    auth.uid() = decidido_por OR
    auth.role() = 'service_role'
  );

-- FIC: RLS Policy: decision_humana - insert own decisions
-- FIC: Política RLS: decision_humana - insertar propias decisiones
CREATE POLICY IF NOT EXISTS "decision_humana_insert_own"
  ON decision_humana
  FOR INSERT
  WITH CHECK (auth.uid() = decidido_por);

-- FIC: RLS Policy: intento_ejecucion - read based on decision ownership
-- FIC: Política RLS: intento_ejecucion - leer basado en propiedad de decisión
CREATE POLICY IF NOT EXISTS "intento_ejecucion_read_own"
  ON intento_ejecucion
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT decidido_por FROM decision_humana WHERE id = decision_id
    ) OR
    auth.role() = 'service_role'
  );

-- FIC: RLS Policy: evento_auditoria - read all (audit is shared view)
-- FIC: Política RLS: evento_auditoria - leer todas (auditoría es vista compartida)
CREATE POLICY IF NOT EXISTS "evento_auditoria_read_all"
  ON evento_auditoria
  FOR SELECT
  USING (true);

-- FIC: RLS Policy: evento_auditoria - insert only by service role
-- FIC: Política RLS: evento_auditoria - insertar solo por rol de servicio
CREATE POLICY IF NOT EXISTS "evento_auditoria_insert_service"
  ON evento_auditoria
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- FIC: RLS Policy: evidencia_operacion - read all (evidence is operational)
-- FIC: Política RLS: evidencia_operacion - leer todas (evidencia es operacional)
CREATE POLICY IF NOT EXISTS "evidencia_operacion_read_all"
  ON evidencia_operacion
  FOR SELECT
  USING (true);

-- FIC: RLS Policy: evidencia_operacion - insert only by service role
-- FIC: Política RLS: evidencia_operacion - insertar solo por rol de servicio
CREATE POLICY IF NOT EXISTS "evidencia_operacion_insert_service"
  ON evidencia_operacion
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- FIC: Grant appropriate permissions to authenticated users and service role
-- FIC: Otorgar permisos apropiados a usuarios autenticados y rol de servicio
GRANT SELECT ON senal_confluente TO authenticated;
GRANT SELECT, INSERT, UPDATE ON decision_humana TO authenticated;
GRANT SELECT ON intento_ejecucion TO authenticated;
GRANT SELECT ON evento_auditoria TO authenticated;
GRANT SELECT ON evidencia_operacion TO authenticated;

-- All tables: full access to service_role (via backend)
-- Todas las tablas: acceso completo a service_role (vía backend)
GRANT ALL ON senal_confluente, decision_humana, intento_ejecucion, evento_auditoria, evidencia_operacion TO service_role;
