-- FIC: Rollback for 003_canonical_schema.sql
-- FIC: Rollback para 003_canonical_schema.sql
--
-- WARNING / ADVERTENCIA:
-- This rollback removes canonical schema tables and policies.
-- Este rollback elimina tablas y políticas del esquema canónico.
--
-- Use only in controlled environments where data loss is acceptable.
-- Usar solo en ambientes controlados donde la pérdida de datos sea aceptable.

BEGIN;

-- Safety guard: abort rollback if canonical tables contain data.
DO $$
DECLARE
  table_name text;
  row_count bigint;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'teams','team_members','user_profiles','strategies','broker_accounts',
    'senal_confluente','evidencia_operacion','decision_humana','intento_ejecucion',
    'orders','positions','closed_trades','evento_auditoria','alert_log','risk_config',
    'watchlists','watchlist_symbols','option_chain_snapshots','fundamental_snapshots',
    'news_archive','institutional_flow_archive','event_calendar'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO row_count;
      IF row_count > 0 THEN
        RAISE EXCEPTION 'Rollback 003 aborted: table % contains % rows.', table_name, row_count;
      END IF;
    END IF;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.is_team_member(uuid);
DROP FUNCTION IF EXISTS public.set_updated_at();

DROP TABLE IF EXISTS public.event_calendar CASCADE;
DROP TABLE IF EXISTS public.institutional_flow_archive CASCADE;
DROP TABLE IF EXISTS public.news_archive CASCADE;
DROP TABLE IF EXISTS public.fundamental_snapshots CASCADE;
DROP TABLE IF EXISTS public.option_chain_snapshots CASCADE;
DROP TABLE IF EXISTS public.watchlist_symbols CASCADE;
DROP TABLE IF EXISTS public.watchlists CASCADE;
DROP TABLE IF EXISTS public.risk_config CASCADE;
DROP TABLE IF EXISTS public.alert_log CASCADE;
DROP TABLE IF EXISTS public.evento_auditoria CASCADE;
DROP TABLE IF EXISTS public.closed_trades CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.intento_ejecucion CASCADE;
DROP TABLE IF EXISTS public.decision_humana CASCADE;
DROP TABLE IF EXISTS public.evidencia_operacion CASCADE;
DROP TABLE IF EXISTS public.senal_confluente CASCADE;
DROP TABLE IF EXISTS public.broker_accounts CASCADE;
DROP TABLE IF EXISTS public.strategies CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

DROP TYPE IF EXISTS public.sentiment_type CASCADE;
DROP TYPE IF EXISTS public.alert_type CASCADE;
DROP TYPE IF EXISTS public.alert_channel CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.order_type CASCADE;
DROP TYPE IF EXISTS public.execution_status CASCADE;
DROP TYPE IF EXISTS public.decision_type CASCADE;
DROP TYPE IF EXISTS public.signal_status CASCADE;
DROP TYPE IF EXISTS public.signal_action CASCADE;
DROP TYPE IF EXISTS public.broker_name CASCADE;

COMMIT;
