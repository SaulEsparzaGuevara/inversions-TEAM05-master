-- FIC: Dynamic confluence table column configuration catalog
-- FIC: Catálogo de configuración dinámica de columnas de tabla de confluencia

BEGIN;

-- FIC: Create confluence_column_configs table for metadata-driven column registry (EN)
-- FIC: Crear tabla confluence_column_configs para registro de columnas metadata-driven (ES)
CREATE TABLE IF NOT EXISTS confluence_column_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL CHECK (data_type IN (
    'string', 'number', 'boolean', 'timestamp', 'json', 'enum'
  )),
  visible BOOLEAN DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  source_path TEXT,
  format_rule TEXT,
  color_rule TEXT,
  is_filterable BOOLEAN DEFAULT true,
  is_sortable BOOLEAN DEFAULT true,
  is_exportable BOOLEAN DEFAULT true,
  min_width_px INTEGER DEFAULT 80,
  max_width_px INTEGER DEFAULT 400,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIC: Create index for fast column lookup (EN)
-- FIC: Índice para búsqueda rápida de columnas (ES)
CREATE INDEX IF NOT EXISTS idx_confluence_column_field_key 
  ON confluence_column_configs(field_key);
CREATE INDEX IF NOT EXISTS idx_confluence_column_visible 
  ON confluence_column_configs(visible);

-- FIC: Insert base column configuration set (EN)
-- FIC: Insertar conjunto base de configuración de columnas (ES)
INSERT INTO confluence_column_configs (
  field_key, label, description, data_type, visible, order_index, 
  is_filterable, is_sortable, is_exportable
) VALUES
  ('symbol', 'Símbolo', 'Código de instrumento', 'string', true, 1, true, true, true),
  ('direction', 'Dirección', 'Compra/Venta', 'enum', true, 2, true, true, true),
  ('price', 'Precio', 'Precio de entrada recomendado', 'number', true, 3, true, true, true),
  ('timestamp', 'Fecha/Hora', 'Marca temporal de la señal', 'timestamp', true, 4, true, true, true),
  ('week', 'Semana', 'Semana operativa', 'string', true, 5, true, true, true),
  
  ('delta', 'Delta', 'Delta de opción', 'number', true, 10, true, true, true),
  ('gamma', 'Gamma', 'Gamma de opción', 'number', true, 11, true, true, true),
  ('theta', 'Theta', 'Theta de opción', 'number', true, 12, true, true, true),
  ('vega', 'Vega', 'Vega de opción', 'number', true, 13, true, true, true),
  
  ('confidence', 'Confianza', 'Score de confianza de señal', 'number', true, 20, true, true, true),
  ('checklist_score', 'Puntuación Checklist', 'Score de validación de checklist', 'number', true, 21, true, true, true),
  ('strategy', 'Estrategia', 'Estrategia recomendada', 'string', true, 22, true, true, true),
  ('expected_return', 'Rendimiento Esperado', 'Retorno máximo objetivo', 'number', true, 23, true, true, true),
  ('max_loss', 'Pérdida Máxima', 'Pérdida máxima permitida', 'number', true, 24, true, true, true),
  ('decision_reasons', 'Motivos de Decisión', 'Justificación de la señal', 'string', true, 25, true, true, true),
  ('source', 'Fuente', 'Broker/API origen de la señal', 'string', true, 26, true, true, true),
  
  -- Advanced operational metadata (Phase 8)
  ('timing_d', 'Timing D', 'Timing diario', 'string', false, 30, true, true, true),
  ('timing_h', 'Timing H', 'Timing horario', 'string', false, 31, true, true, true),
  ('pre_senal', 'Pre-Señal', 'Señal anticipada (alcista/bajista)', 'string', false, 32, true, true, true),
  ('senal_real_activada', 'Señal Real Activada', 'Señal real confirmada', 'boolean', false, 33, true, true, true),
  ('stop', 'Stop', 'Nivel de stop loss', 'number', false, 34, true, true, true),
  ('objetivo', 'Objetivo', 'Nivel de objetivo/take profit', 'number', false, 35, true, true, true),
  ('divergencia', 'Divergencia', 'Divergencia detectada', 'string', false, 36, true, true, true),
  ('z_extrema', 'Z Extrema', 'Z-score extremo', 'number', false, 37, true, true, true),
  ('cantidad_sugerida', 'Cantidad Sugerida', 'Cantidad de contratos/acciones', 'number', false, 38, true, true, true),
  ('vencimiento', 'Vencimiento', 'Fecha de vencimiento de opción', 'timestamp', false, 39, true, true, true),
  ('precio_ejercicio', 'Precio de Ejercicio', 'Strike price para opciones', 'number', false, 40, true, true, true),
  ('tipo_opcion', 'Tipo de Opción', 'Call/Put', 'enum', false, 41, true, true, true),
  ('duracion', 'Duración', 'Duración de la posición (días)', 'number', false, 42, true, true, true),
  ('bid', 'Bid', 'Precio de compra actual', 'number', false, 43, true, true, true),
  ('ask', 'Ask', 'Precio de venta actual', 'number', false, 44, true, true, true),
  ('zona_apertura', 'Zona de Apertura', 'Zona exacta de entrada', 'string', false, 45, true, true, true),
  ('zona_cierre', 'Zona de Cierre', 'Zona exacta de salida', 'string', false, 46, true, true, true),
  ('stoploss_sugerido', 'Stoploss Sugerido', 'Nivel de SL recomendado', 'number', false, 47, true, true, true),
  ('alerta_configurada', 'Alerta Configurada', 'Si hay alerta activa', 'boolean', false, 48, true, true, true),
  ('referencia_maximos', 'Referencias Máximos', 'Máximos históricos de referencia', 'number', false, 49, true, true, true),
  ('referencia_minimos', 'Referencias Mínimos', 'Mínimos históricos de referencia', 'number', false, 50, true, true, true),
  ('variantes_ataque', 'Variantes de Ataque', 'Variaciones de entrada posibles', 'string', false, 51, true, true, true),
  ('recolocacion_stoploss', 'Recolocación de Stoploss', 'Estrategia de ajuste de SL', 'string', false, 52, true, true, true),
  ('liquidez', 'Liquidez', 'Nivel de liquidez del instrumento', 'string', false, 53, true, true, true),
  ('riesgo', 'Riesgo', 'Evaluación de riesgo', 'string', false, 54, true, true, true),
  ('retorno_maximo', 'Retorno Máximo', 'Retorno máximo posible', 'number', false, 55, true, true, true),
  ('perdida_maxima', 'Pérdida Máxima', 'Pérdida máxima posible', 'number', false, 56, true, true, true)
ON CONFLICT (field_key) DO NOTHING;

-- FIC: Create trigger for updated_at timestamp (EN)
-- FIC: Crear trigger para actualizar timestamp updated_at (ES)
CREATE OR REPLACE FUNCTION update_confluence_column_configs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS confluence_column_configs_update_timestamp ON confluence_column_configs;
CREATE TRIGGER confluence_column_configs_update_timestamp
  BEFORE UPDATE ON confluence_column_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_confluence_column_configs_timestamp();

-- FIC: Enable RLS on confluence_column_configs (EN)
-- FIC: Habilitar RLS en tabla de configuración de columnas (ES)
ALTER TABLE confluence_column_configs ENABLE ROW LEVEL SECURITY;

-- FIC: RLS policy: everyone can read column configs (EN)
-- FIC: Política RLS: todos pueden leer configuraciones de columnas (ES)
CREATE POLICY confluence_column_configs_read ON confluence_column_configs
  FOR SELECT
  TO authenticated
  USING (true);

-- FIC: RLS policy: only admins can modify (EN)
-- FIC: Política RLS: solo admins pueden modificar (ES)
CREATE POLICY confluence_column_configs_admin_modify ON confluence_column_configs
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

COMMIT;
