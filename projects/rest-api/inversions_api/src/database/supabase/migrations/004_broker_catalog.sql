-- FIC: Broker catalog for professional trading workspace
-- FIC: Catálogo de brokers para espacio de trabajo profesional de trading

BEGIN;

-- FIC: Create broker_configurations table (EN)
-- FIC: Crear tabla broker_configurations con soporte multi-broker y capabilities dinámicas (ES)
CREATE TABLE IF NOT EXISTS broker_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  broker_type TEXT NOT NULL CHECK (broker_type IN (
    'alpaca', 'ibkr', 'capital', 'blackbull', 'forexcom', 'blueberry', 'tradestation', 'local'
  )),
  is_active BOOLEAN DEFAULT true,
  api_endpoint TEXT,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  timeout_ms INTEGER DEFAULT 5000 CHECK (timeout_ms > 0),
  priority INTEGER DEFAULT 0,
  capabilities JSONB DEFAULT '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": false,
    "historical": true,
    "granularities": ["1d"]
  }'::jsonb,
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'offline', 'unknown')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIC: Create index for fast broker lookup (EN)
-- FIC: Índice para búsqueda rápida de brokers (ES)
CREATE INDEX IF NOT EXISTS idx_broker_configurations_type ON broker_configurations(broker_type);
CREATE INDEX IF NOT EXISTS idx_broker_configurations_active ON broker_configurations(is_active);

-- FIC: Insert broker catalog entries (EN)
-- FIC: Insertar catálogo inicial de brokers profesionales (ES)
INSERT INTO broker_configurations (name, broker_type, api_endpoint, timeout_ms, priority, capabilities) VALUES
  ('Interactive Brokers (IBKR)', 'ibkr', 'https://www.ibkr.com/api', 10000, 1, '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]
  }'::jsonb),
  
  ('Alpaca', 'alpaca', 'https://api.alpaca.markets', 5000, 2, '{
    "ohlc": true,
    "symbols": true,
    "indicators": false,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]
  }'::jsonb),
  
  ('Capital.com', 'capital', 'https://api-capital.backend-capital.com', 8000, 3, '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w"]
  }'::jsonb),
  
  ('BlackBull Markets', 'blackbull', 'https://api.blackbull.com', 6000, 4, '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d"]
  }'::jsonb),
  
  ('Forex.com', 'forexcom', 'https://api.forex.com', 7000, 5, '{
    "ohlc": true,
    "symbols": true,
    "indicators": false,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w"]
  }'::jsonb),
  
  ('Blueberry Markets', 'blueberry', 'https://api.blueberrymarkets.com', 6500, 6, '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d"]
  }'::jsonb),
  
  ('TradeStation', 'tradestation', 'https://api.tradestation.com', 8500, 7, '{
    "ohlc": true,
    "symbols": true,
    "indicators": true,
    "real_time": true,
    "historical": true,
    "granularities": ["1m", "5m", "15m", "1h", "4h", "1d", "1w", "1M"]
  }'::jsonb),
  
  ('Local Cache', 'local', 'internal', 1000, 100, '{
    "ohlc": true,
    "symbols": true,
    "indicators": false,
    "real_time": false,
    "historical": true,
    "granularities": ["1d"]
  }'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- FIC: Enable RLS on broker_configurations table (EN)
-- FIC: Habilitar RLS en tabla de configuraciones de broker (ES)
ALTER TABLE broker_configurations ENABLE ROW LEVEL SECURITY;

-- FIC: Create RLS policy to allow authenticated users read-only access to active brokers (EN)
-- FIC: Política RLS para permitir lectura de brokers activos a usuarios autenticados (ES)
CREATE POLICY broker_configurations_read ON broker_configurations
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- FIC: Create RLS policy for admin-only updates (EN)
-- FIC: Política RLS para actualizaciones solo de administrador (ES)
CREATE POLICY broker_configurations_admin_update ON broker_configurations
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- FIC: Update trigger for updated_at timestamp (EN)
-- FIC: Trigger para actualizar timestamp updated_at (ES)
CREATE OR REPLACE FUNCTION update_broker_configurations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS broker_configurations_update_timestamp ON broker_configurations;
CREATE TRIGGER broker_configurations_update_timestamp
  BEFORE UPDATE ON broker_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_configurations_timestamp();

COMMIT;
