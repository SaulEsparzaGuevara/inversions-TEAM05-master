-- FIC: Broker accounts for demo and real trading modes
-- FIC: Cuentas de broker para modos demo y operativa real

BEGIN;

-- FIC: Create broker_accounts table with demo/real mode support (EN)
-- FIC: Crear tabla broker_accounts con soporte de modos demo/real (ES)
CREATE TABLE IF NOT EXISTS broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES broker_configurations(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL,
  account_name TEXT,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'margin', 'futures', 'options', 'forex')),
  mode TEXT NOT NULL CHECK (mode IN ('demo', 'real')),
  is_active BOOLEAN DEFAULT true,
  credentials_encrypted JSONB,
  available_balance NUMERIC(15, 2),
  buying_power NUMERIC(15, 2),
  used_margin NUMERIC(15, 2),
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'unknown' CHECK (sync_status IN ('synced', 'pending', 'error', 'unknown')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIC: Create composite unique constraint for broker + account + mode (EN)
-- FIC: Restricción única compuesta para broker + cuenta + modo (ES)
CREATE UNIQUE INDEX IF NOT EXISTS idx_broker_accounts_unique 
  ON broker_accounts(broker_id, account_number, mode);

-- FIC: Create index for fast lookup by mode (EN)
-- FIC: Índice para búsqueda rápida por modo (ES)
CREATE INDEX IF NOT EXISTS idx_broker_accounts_mode ON broker_accounts(mode);
CREATE INDEX IF NOT EXISTS idx_broker_accounts_active ON broker_accounts(is_active);

-- FIC: Enable RLS on broker_accounts table (EN)
-- FIC: Habilitar RLS en tabla de cuentas (ES)
ALTER TABLE broker_accounts ENABLE ROW LEVEL SECURITY;

-- FIC: RLS policy: users can only see their own accounts (EN)
-- FIC: Política RLS: usuarios solo ven sus propias cuentas (ES)
CREATE POLICY broker_accounts_user_access ON broker_accounts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT DISTINCT user_id FROM user_broker_account_mappings
      WHERE broker_account_id = id
    )
    OR auth.jwt() ->> 'role' = 'admin'
  );

-- FIC: RLS policy: admin can update any account (EN)
-- FIC: Política RLS: admin puede actualizar cualquier cuenta (ES)
CREATE POLICY broker_accounts_admin_update ON broker_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- FIC: Update trigger for updated_at timestamp (EN)
-- FIC: Trigger para actualizar timestamp updated_at (ES)
CREATE OR REPLACE FUNCTION update_broker_accounts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS broker_accounts_update_timestamp ON broker_accounts;
CREATE TRIGGER broker_accounts_update_timestamp
  BEFORE UPDATE ON broker_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_broker_accounts_timestamp();

-- FIC: Create junction table for user-account mappings (EN)
-- FIC: Crear tabla de unión para mapeos usuario-cuenta (ES)
CREATE TABLE IF NOT EXISTS user_broker_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_account_id UUID NOT NULL REFERENCES broker_accounts(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  can_trade BOOLEAN DEFAULT true,
  can_view BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, broker_account_id)
);

-- FIC: Index for fast user-account lookup (EN)
-- FIC: Índice para búsqueda rápida usuario-cuenta (ES)
CREATE INDEX IF NOT EXISTS idx_user_broker_mappings_user 
  ON user_broker_account_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_broker_mappings_account 
  ON user_broker_account_mappings(broker_account_id);

-- FIC: Enable RLS on user_broker_account_mappings (EN)
-- FIC: Habilitar RLS en tabla de mapeos (ES)
ALTER TABLE user_broker_account_mappings ENABLE ROW LEVEL SECURITY;

-- FIC: RLS policy: users can only see their own mappings (EN)
-- FIC: Política RLS: usuarios solo ven sus propios mapeos (ES)
CREATE POLICY user_broker_mappings_read ON user_broker_account_mappings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

COMMIT;
