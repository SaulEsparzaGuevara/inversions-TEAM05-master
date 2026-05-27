-- FIC: Adds context snapshot field to canonical signal table for decision reconstruction.
-- FIC: Agrega campo context snapshot a la tabla canónica de señales para reconstrucción de decisiones.

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.senal_confluente') IS NULL THEN
    RAISE NOTICE 'Skipping 002_context_snapshot: table public.senal_confluente does not exist yet.';
    RETURN;
  END IF;

  ALTER TABLE public.senal_confluente
    ADD COLUMN IF NOT EXISTS context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

  COMMENT ON COLUMN public.senal_confluente.context_snapshot IS
    'Serialized decision input context used to reconstruct historical human decisions.';
END $$;

COMMIT;
