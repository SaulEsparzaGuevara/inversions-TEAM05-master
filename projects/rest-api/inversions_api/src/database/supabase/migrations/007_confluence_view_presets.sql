-- FIC: Confluence view presets table for user/role-based saved views
-- FIC: Tabla de presets de vista de confluencia para vistas guardadas por usuario/rol

BEGIN;

-- FIC: Create confluence_view_presets table (EN)
-- FIC: Crear tabla confluence_view_presets (ES)
CREATE TABLE IF NOT EXISTS confluence_view_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT,
  is_public BOOLEAN DEFAULT false,
  column_fields TEXT[] NOT NULL DEFAULT '{}',
  column_order JSONB DEFAULT '{}'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  sort_by TEXT DEFAULT 'timestamp',
  sort_order TEXT DEFAULT 'desc' CHECK (sort_order IN ('asc', 'desc')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FIC: Create indexes for fast lookup (EN)
-- FIC: Crear índices para búsqueda rápida (ES)
CREATE INDEX IF NOT EXISTS idx_confluence_presets_user 
  ON confluence_view_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_confluence_presets_role 
  ON confluence_view_presets(role);
CREATE INDEX IF NOT EXISTS idx_confluence_presets_public 
  ON confluence_view_presets(is_public);

-- FIC: Enable RLS on confluence_view_presets (EN)
-- FIC: Habilitar RLS en tabla de presets (ES)
ALTER TABLE confluence_view_presets ENABLE ROW LEVEL SECURITY;

-- FIC: RLS policy: users can see their own presets and public role presets (EN)
-- FIC: Política RLS: usuarios ven sus presets y presets públicos por rol (ES)
CREATE POLICY confluence_presets_read ON confluence_view_presets
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR (is_public = true AND role = auth.jwt() ->> 'role')
  );

-- FIC: RLS policy: users can insert their own presets (EN)
-- FIC: Política RLS: usuarios pueden insertar sus propios presets (ES)
CREATE POLICY confluence_presets_insert ON confluence_view_presets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- FIC: RLS policy: users can update only their own presets (EN)
-- FIC: Política RLS: usuarios solo pueden actualizar sus propios presets (ES)
CREATE POLICY confluence_presets_update ON confluence_view_presets
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- FIC: RLS policy: users can delete only their own presets (EN)
-- FIC: Política RLS: usuarios solo pueden eliminar sus propios presets (ES)
CREATE POLICY confluence_presets_delete ON confluence_view_presets
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- FIC: Create trigger for updated_at timestamp (EN)
-- FIC: Crear trigger para actualizar timestamp updated_at (ES)
CREATE OR REPLACE FUNCTION update_confluence_view_presets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS confluence_view_presets_update_timestamp ON confluence_view_presets;
CREATE TRIGGER confluence_view_presets_update_timestamp
  BEFORE UPDATE ON confluence_view_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_confluence_view_presets_timestamp();

COMMIT;
