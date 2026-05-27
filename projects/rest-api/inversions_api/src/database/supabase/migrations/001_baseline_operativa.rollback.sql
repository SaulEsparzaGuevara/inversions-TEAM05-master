-- FIC: Rollback script for baseline migration (001_baseline_operativa.sql)
-- FIC: Script de retroceso para migración baseline (001_baseline_operativa.sql)
--
-- Purpose: Safely drop all tables and policies created in 001_baseline_operativa.sql
-- Propósito: Eliminar de forma segura todas las tablas y políticas creadas en 001_baseline_operativa.sql
--
-- Constraint: This script MUST be idempotent (safe to run multiple times)
-- Restricción: Este script DEBE ser idempotente (seguro de ejecutar varias veces)

-- FIC: Disable RLS on all tables before dropping
-- FIC: Deshabilitar RLS en todas las tablas antes de eliminar
ALTER TABLE IF EXISTS senal_confluente DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS decision_humana DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS intento_ejecucion DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evento_auditoria DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS evidencia_operacion DISABLE ROW LEVEL SECURITY;

-- FIC: Drop policies (if they exist) before dropping tables
-- FIC: Eliminar políticas (si existen) antes de eliminar tablas

-- senal_confluente policies
DROP POLICY IF EXISTS "senal_confluente_read_all" ON senal_confluente;
DROP POLICY IF EXISTS "senal_confluente_insert_service" ON senal_confluente;

-- decision_humana policies
DROP POLICY IF EXISTS "decision_humana_read_own" ON decision_humana;
DROP POLICY IF EXISTS "decision_humana_insert_own" ON decision_humana;

-- intento_ejecucion policies
DROP POLICY IF EXISTS "intento_ejecucion_read_own" ON intento_ejecucion;

-- evento_auditoria policies
DROP POLICY IF EXISTS "evento_auditoria_read_all" ON evento_auditoria;
DROP POLICY IF EXISTS "evento_auditoria_insert_service" ON evento_auditoria;

-- evidencia_operacion policies
DROP POLICY IF EXISTS "evidencia_operacion_read_all" ON evidencia_operacion;
DROP POLICY IF EXISTS "evidencia_operacion_insert_service" ON evidencia_operacion;

-- FIC: Drop indexes in dependency order (foreign keys must be resolved)
-- FIC: Eliminar índices en orden de dependencia (claves foráneas deben resolverse)
DROP INDEX IF EXISTS idx_evidencia_operacion_tipo;
DROP INDEX IF EXISTS idx_evidencia_operacion_senal_id;
DROP INDEX IF EXISTS idx_evento_auditoria_ocurrido_en;
DROP INDEX IF EXISTS idx_evento_auditoria_tipo;
DROP INDEX IF EXISTS idx_evento_auditoria_senal_id;
DROP INDEX IF EXISTS idx_evento_auditoria_trace_id;
DROP INDEX IF EXISTS idx_evento_auditoria_entidad;
DROP INDEX IF EXISTS idx_intento_ejecucion_intentado_en;
DROP INDEX IF EXISTS idx_intento_ejecucion_estado;
DROP INDEX IF EXISTS idx_intento_ejecucion_broker;
DROP INDEX IF EXISTS idx_intento_ejecucion_decision_id;
DROP INDEX IF EXISTS idx_decision_humana_tipo;
DROP INDEX IF EXISTS idx_decision_humana_decidida_en;
DROP INDEX IF EXISTS idx_decision_humana_decidido_por;
DROP INDEX IF EXISTS idx_decision_humana_senal_id;
DROP INDEX IF EXISTS idx_senal_confluente_creada_en;
DROP INDEX IF EXISTS idx_senal_confluente_trace_id;
DROP INDEX IF EXISTS idx_senal_confluente_estado;
DROP INDEX IF EXISTS idx_senal_confluente_instrumento;

-- FIC: Drop tables in reverse dependency order
-- FIC: Eliminar tablas en orden inverso de dependencia
--  evidencia_operacion depends on senal_confluente
--  intento_ejecucion depends on decision_humana
--  decision_humana depends on senal_confluente

DROP TABLE IF EXISTS evidencia_operacion CASCADE;
DROP TABLE IF EXISTS evento_auditoria CASCADE;
DROP TABLE IF EXISTS intento_ejecucion CASCADE;
DROP TABLE IF EXISTS decision_humana CASCADE;
DROP TABLE IF EXISTS senal_confluente CASCADE;

-- FIC: Note: UUID extension is left intact (may be used by other migrations)
-- FIC: Nota: la extensión UUID se deja intacta (puede ser usada por otras migraciones)
