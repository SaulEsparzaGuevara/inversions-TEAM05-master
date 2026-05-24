-- FIC: Canonical schema replacement for TEAM-01 dashboard and cross-team investment platform.
-- FIC: Reemplazo canónico de esquema para dashboard TEAM-01 y plataforma de inversiones multi-equipo.
--
-- WARNING / ADVERTENCIA:
-- This migration is designed for EMPTY databases only.
-- Esta migración está diseñada solo para bases de datos VACÍAS.
--
-- It intentionally drops legacy tables and recreates a definitive schema.
-- Intencionalmente elimina tablas legacy y recrea un esquema definitivo.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- FIC: Safety guard - fail migration if any relevant legacy table has data.
-- FIC: Guarda de seguridad - fallar migración si cualquier tabla legacy relevante tiene datos.
DO $$
DECLARE
  table_name text;
  row_count bigint;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'ai_confirmation_archive','alert_log','broker_accounts','broker_connection_log','closed_trades',
    'event_calendar','fundamental_snapshots','institutional_flow_archive','news_archive',
    'opportunity_ranking_history','option_chain_snapshots','orders','positions','risk_config',
    'signal_events_archive','signal_performance','strategies','users','watchlist_symbols','watchlists',
    'senal_confluente','decision_humana','intento_ejecucion','evento_auditoria','evidencia_operacion'
  ]
  LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO row_count;
      IF row_count > 0 THEN
        RAISE EXCEPTION 'Migration 003 aborted: table % contains % rows. Empty DB required.', table_name, row_count;
      END IF;
    END IF;
  END LOOP;
END $$;

-- FIC: Drop legacy and interim tables (safe because guard above enforces empty state).
-- FIC: Eliminar tablas legacy e intermedias (seguro porque la guarda anterior exige estado vacío).
DROP TABLE IF EXISTS public.ai_confirmation_archive CASCADE;
DROP TABLE IF EXISTS public.alert_log CASCADE;
DROP TABLE IF EXISTS public.broker_connection_log CASCADE;
DROP TABLE IF EXISTS public.closed_trades CASCADE;
DROP TABLE IF EXISTS public.event_calendar CASCADE;
DROP TABLE IF EXISTS public.fundamental_snapshots CASCADE;
DROP TABLE IF EXISTS public.institutional_flow_archive CASCADE;
DROP TABLE IF EXISTS public.news_archive CASCADE;
DROP TABLE IF EXISTS public.opportunity_ranking_history CASCADE;
DROP TABLE IF EXISTS public.option_chain_snapshots CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.positions CASCADE;
DROP TABLE IF EXISTS public.risk_config CASCADE;
DROP TABLE IF EXISTS public.signal_performance CASCADE;
DROP TABLE IF EXISTS public.signal_events_archive CASCADE;
DROP TABLE IF EXISTS public.strategies CASCADE;
DROP TABLE IF EXISTS public.watchlist_symbols CASCADE;
DROP TABLE IF EXISTS public.watchlists CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TABLE IF EXISTS public.intento_ejecucion CASCADE;
DROP TABLE IF EXISTS public.decision_humana CASCADE;
DROP TABLE IF EXISTS public.evidencia_operacion CASCADE;
DROP TABLE IF EXISTS public.evento_auditoria CASCADE;
DROP TABLE IF EXISTS public.senal_confluente CASCADE;
DROP TABLE IF EXISTS public.broker_accounts CASCADE;

DROP TYPE IF EXISTS public.broker_name CASCADE;
DROP TYPE IF EXISTS public.signal_action CASCADE;
DROP TYPE IF EXISTS public.signal_status CASCADE;
DROP TYPE IF EXISTS public.decision_type CASCADE;
DROP TYPE IF EXISTS public.execution_status CASCADE;
DROP TYPE IF EXISTS public.order_type CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.alert_channel CASCADE;
DROP TYPE IF EXISTS public.alert_type CASCADE;
DROP TYPE IF EXISTS public.sentiment_type CASCADE;

-- FIC: Canonical enums for consistency and strong constraints.
-- FIC: Enums canónicos para consistencia y restricciones fuertes.
CREATE TYPE public.broker_name AS ENUM ('ibkr', 'alpaca', 'other');
CREATE TYPE public.signal_action AS ENUM ('BUY', 'SELL', 'HOLD');
CREATE TYPE public.signal_status AS ENUM ('active', 'approved', 'rejected', 'executed', 'dismissed', 'expired');
CREATE TYPE public.decision_type AS ENUM ('approved', 'rejected');
CREATE TYPE public.execution_status AS ENUM ('pending', 'sent', 'filled', 'partial', 'failed', 'cancelled');
CREATE TYPE public.order_type AS ENUM ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT');
CREATE TYPE public.order_status AS ENUM ('PENDING', 'SENT', 'FILLED', 'PARTIAL', 'CANCELLED', 'REJECTED');
CREATE TYPE public.alert_channel AS ENUM ('ui', 'email', 'both');
CREATE TYPE public.alert_type AS ENUM (
  'SIGNAL_HIGH_CONFIDENCE',
  'SIGNAL_MEDIUM',
  'DAILY_OPPORTUNITY',
  'EVENT_RISK',
  'POSITION_STOP_LOSS',
  'POSITION_TAKE_PROFIT',
  'CONNECTION_LOST',
  'AI_CONFIRMATION'
);
CREATE TYPE public.sentiment_type AS ENUM ('bullish', 'bearish', 'neutral');

-- FIC: Shared trigger function for updated_at maintenance.
-- FIC: Función trigger compartida para mantenimiento de updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- FIC: Team model for multi-team operation and scoped governance.
-- FIC: Modelo de equipos para operación multi-equipo y gobernanza segmentada.
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'trader', 'approver', 'auditor', 'viewer')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- FIC: Optional profile extension mapped 1:1 to Supabase auth user.
-- FIC: Extensión opcional de perfil mapeada 1:1 al usuario auth de Supabase.
CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  timezone text NOT NULL DEFAULT 'UTC',
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  preset_code text UNIQUE,
  is_preset boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  enabled_cores jsonb NOT NULL DEFAULT '{}'::jsonb,
  indicator_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  structure_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  institutional_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  news_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  fundamentals_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_advisor_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  option_strategies text[] NOT NULL DEFAULT '{}'::text[],
  recommended_timeframes text[] NOT NULL DEFAULT '{}'::text[],
  min_confidence_threshold numeric(5,4) NOT NULL DEFAULT 0.50 CHECK (min_confidence_threshold BETWEEN 0 AND 1),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.broker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker public.broker_name NOT NULL,
  account_id text,
  environment text NOT NULL DEFAULT 'paper' CHECK (environment IN ('paper', 'live')),
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, broker, account_id)
);

-- FIC: Canonical signal table for confluence workflow.
-- FIC: Tabla canónica de señales para flujo de confluencia.
CREATE TABLE public.senal_confluente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE RESTRICT,
  strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL,
  trace_id uuid NOT NULL UNIQUE,
  symbol text NOT NULL,
  timeframe text NOT NULL,
  action public.signal_action NOT NULL,
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  confluencia_score numeric(5,4) NOT NULL CHECK (confluencia_score BETWEEN 0 AND 1),
  score numeric(12,6),
  score_max numeric(12,6),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  selected_cores text[] NOT NULL DEFAULT '{}'::text[],
  indicators jsonb NOT NULL DEFAULT '{}'::jsonb,
  cores jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_confirmation jsonb NOT NULL DEFAULT '{}'::jsonb,
  suggested_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  context_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  status public.signal_status NOT NULL DEFAULT 'active',
  price_at_signal numeric(18,6),
  occurred_at timestamptz NOT NULL,
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.evidencia_operacion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senal_id uuid NOT NULL REFERENCES public.senal_confluente(id) ON DELETE CASCADE,
  tipo_evidencia text NOT NULL,
  datos jsonb NOT NULL DEFAULT '{}'::jsonb,
  fuente text,
  captured_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.decision_humana (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senal_id uuid NOT NULL UNIQUE REFERENCES public.senal_confluente(id) ON DELETE CASCADE,
  decision public.decision_type NOT NULL,
  reason text,
  expected_risk jsonb NOT NULL DEFAULT '{}'::jsonb,
  decided_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  decided_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.intento_ejecucion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid NOT NULL REFERENCES public.decision_humana(id) ON DELETE CASCADE,
  broker_account_id uuid REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
  broker public.broker_name NOT NULL,
  status public.execution_status NOT NULL DEFAULT 'pending',
  broker_order_id text,
  broker_error_code text,
  broker_error_message text,
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_account_id uuid REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
  signal_id uuid REFERENCES public.senal_confluente(id) ON DELETE SET NULL,
  strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity numeric(18,8) NOT NULL CHECK (quantity > 0),
  order_type public.order_type NOT NULL,
  limit_price numeric(18,6),
  stop_price numeric(18,6),
  stop_loss numeric(18,6),
  take_profit numeric(18,6),
  time_in_force text NOT NULL DEFAULT 'DAY' CHECK (time_in_force IN ('DAY', 'GTC', 'IOC', 'FOK')),
  asset_type text NOT NULL DEFAULT 'STOCK' CHECK (asset_type IN ('STOCK', 'OPTION')),
  status public.order_status NOT NULL DEFAULT 'PENDING',
  filled_qty numeric(18,8) NOT NULL DEFAULT 0,
  filled_avg_price numeric(18,6),
  notes text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  filled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_account_id uuid REFERENCES public.broker_accounts(id) ON DELETE SET NULL,
  open_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  quantity numeric(18,8) NOT NULL CHECK (quantity > 0),
  entry_price numeric(18,6) NOT NULL,
  current_price numeric(18,6),
  stop_loss numeric(18,6),
  take_profit numeric(18,6),
  unrealized_pnl numeric(18,6),
  unrealized_pnl_pct numeric(10,6),
  asset_type text NOT NULL DEFAULT 'STOCK' CHECK (asset_type IN ('STOCK', 'OPTION')),
  is_open boolean NOT NULL DEFAULT true,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.closed_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position_id uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  signal_id uuid REFERENCES public.senal_confluente(id) ON DELETE SET NULL,
  strategy_id uuid REFERENCES public.strategies(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity numeric(18,8) NOT NULL,
  entry_price numeric(18,6) NOT NULL,
  exit_price numeric(18,6) NOT NULL,
  pnl numeric(18,6) NOT NULL,
  pnl_pct numeric(10,6) NOT NULL,
  broker public.broker_name,
  broker_order_id text,
  entry_time timestamptz NOT NULL,
  exit_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.evento_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  trace_id uuid,
  senal_id uuid REFERENCES public.senal_confluente(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type public.alert_type NOT NULL,
  channel public.alert_channel NOT NULL,
  symbol text,
  message text NOT NULL,
  delivered boolean NOT NULL DEFAULT false,
  acknowledged boolean NOT NULL DEFAULT false,
  related_signal_id uuid REFERENCES public.senal_confluente(id) ON DELETE SET NULL,
  related_position_id uuid REFERENCES public.positions(id) ON DELETE SET NULL,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  acknowledged_at timestamptz
);

CREATE TABLE public.risk_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  max_position_size_pct numeric(8,4) NOT NULL DEFAULT 5.00,
  max_daily_loss_pct numeric(8,4) NOT NULL DEFAULT 2.00,
  default_stop_loss_pct numeric(8,4) NOT NULL DEFAULT 1.50,
  default_take_profit_pct numeric(8,4) NOT NULL DEFAULT 3.00,
  max_concurrent_positions integer NOT NULL DEFAULT 5,
  max_iv_percentile integer NOT NULL DEFAULT 80,
  preferred_dte_min integer NOT NULL DEFAULT 7,
  preferred_dte_max integer NOT NULL DEFAULT 45,
  max_option_premium_pct numeric(8,4) NOT NULL DEFAULT 2.00,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.watchlist_symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  instrument_type text NOT NULL DEFAULT 'Stock' CHECK (instrument_type IN ('Stock', 'ETF', 'Index', 'Option')),
  sector text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (watchlist_id, symbol)
);

-- FIC: Market intelligence snapshots retained for analytics and explainability.
-- FIC: Snapshots de inteligencia de mercado conservados para analítica y explicabilidad.
CREATE TABLE public.option_chain_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES public.senal_confluente(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  expiration date NOT NULL,
  strike numeric(18,6) NOT NULL,
  option_type text NOT NULL CHECK (option_type IN ('CALL', 'PUT')),
  bid numeric(18,6),
  ask numeric(18,6),
  last numeric(18,6),
  volume integer,
  open_interest integer,
  implied_volatility numeric(10,6),
  iv_percentile numeric(10,6),
  dte integer,
  greeks jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL CHECK (source IN ('IBKR', 'ALPACA', 'OTHER')),
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.fundamental_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  revenue_growth numeric(18,6),
  eps numeric(18,6),
  eps_surprise numeric(18,6),
  guidance text,
  analyst_rating text,
  revenue_ttm numeric(18,6),
  gross_margin numeric(18,6),
  pe_ratio numeric(18,6),
  ps_ratio numeric(18,6),
  market_cap numeric(22,2),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.news_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text,
  headline text NOT NULL,
  summary text,
  sentiment public.sentiment_type,
  relevance_score numeric(10,6),
  source text,
  url text,
  published_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.institutional_flow_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('uoa', 'oi_change', 'sweep', 'block', 'other')),
  side text CHECK (side IN ('bullish', 'bearish', 'neutral')),
  notional_value numeric(22,2),
  strike numeric(18,6),
  expiration date,
  option_type text CHECK (option_type IN ('CALL', 'PUT')),
  open_interest integer,
  volume integer,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  occurred_at timestamptz NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.event_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text,
  event_type text NOT NULL CHECK (event_type IN ('earnings', 'guidance', 'dividend', 'split', 'macro', 'analyst_update', 'other')),
  title text NOT NULL,
  description text,
  expected_impact text CHECK (expected_impact IN ('high', 'medium', 'low', 'unknown')),
  event_date date NOT NULL,
  event_time time,
  is_confirmed boolean NOT NULL DEFAULT false,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_broker_accounts_user ON public.broker_accounts(user_id, broker);
CREATE INDEX idx_signal_team_status ON public.senal_confluente(team_id, status, occurred_at DESC);
CREATE INDEX idx_signal_trace_id ON public.senal_confluente(trace_id);
CREATE INDEX idx_signal_symbol_timeframe ON public.senal_confluente(symbol, timeframe, occurred_at DESC);
CREATE INDEX idx_evidencia_senal ON public.evidencia_operacion(senal_id, captured_at DESC);
CREATE INDEX idx_decision_senal ON public.decision_humana(senal_id, decided_at DESC);
CREATE INDEX idx_intento_decision ON public.intento_ejecucion(decision_id, attempted_at DESC);
CREATE INDEX idx_orders_user_status ON public.orders(user_id, status, submitted_at DESC);
CREATE INDEX idx_positions_user_open ON public.positions(user_id, is_open, updated_at DESC);
CREATE INDEX idx_closed_trades_user_exit ON public.closed_trades(user_id, exit_time DESC);
CREATE INDEX idx_audit_trace_time ON public.evento_auditoria(trace_id, occurred_at DESC);
CREATE INDEX idx_alert_user_time ON public.alert_log(user_id, triggered_at DESC);
CREATE INDEX idx_watchlist_symbols_symbol ON public.watchlist_symbols(symbol);
CREATE INDEX idx_option_chain_symbol_time ON public.option_chain_snapshots(symbol, captured_at DESC);
CREATE INDEX idx_fundamentals_symbol_time ON public.fundamental_snapshots(symbol, captured_at DESC);
CREATE INDEX idx_news_symbol_time ON public.news_archive(symbol, published_at DESC);
CREATE INDEX idx_institutional_symbol_time ON public.institutional_flow_archive(symbol, occurred_at DESC);
CREATE INDEX idx_event_calendar_symbol_date ON public.event_calendar(symbol, event_date);

-- Updated-at triggers
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_strategies_updated_at BEFORE UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_broker_accounts_updated_at BEFORE UPDATE ON public.broker_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_signals_updated_at BEFORE UPDATE ON public.senal_confluente FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_decision_updated_at BEFORE UPDATE ON public.decision_humana FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_intento_updated_at BEFORE UPDATE ON public.intento_ejecucion FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_risk_config_updated_at BEFORE UPDATE ON public.risk_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_watchlists_updated_at BEFORE UPDATE ON public.watchlists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_event_calendar_updated_at BEFORE UPDATE ON public.event_calendar FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- FIC: RLS helper to check if current auth user belongs to team.
-- FIC: Helper RLS para comprobar si el usuario auth actual pertenece al equipo.
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = p_team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
  );
$$;

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.senal_confluente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencia_operacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_humana ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intento_ejecucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closed_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_symbols ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE POLICY team_members_read ON public.team_members
FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- Broker accounts
CREATE POLICY broker_accounts_rw_owner ON public.broker_accounts
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- Signals and related entities
CREATE POLICY signal_read_team ON public.senal_confluente
FOR SELECT USING (public.is_team_member(team_id) OR auth.role() = 'service_role');
CREATE POLICY signal_write_service ON public.senal_confluente
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY evidence_read_parent_team ON public.evidencia_operacion
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.senal_confluente s
    WHERE s.id = evidencia_operacion.senal_id
      AND (public.is_team_member(s.team_id) OR auth.role() = 'service_role')
  )
);
CREATE POLICY evidence_write_service ON public.evidencia_operacion
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY decision_read_parent_team ON public.decision_humana
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.senal_confluente s
    WHERE s.id = decision_humana.senal_id
      AND (public.is_team_member(s.team_id) OR auth.role() = 'service_role')
  )
);
CREATE POLICY decision_write_actor_or_service ON public.decision_humana
FOR INSERT WITH CHECK (decided_by = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY decision_update_service ON public.decision_humana
FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY intento_read_parent_team ON public.intento_ejecucion
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM public.decision_humana d
    JOIN public.senal_confluente s ON s.id = d.senal_id
    WHERE d.id = intento_ejecucion.decision_id
      AND (public.is_team_member(s.team_id) OR auth.role() = 'service_role')
  )
);
CREATE POLICY intento_write_service ON public.intento_ejecucion
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Trading entities
CREATE POLICY orders_rw_owner_or_service ON public.orders
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY positions_rw_owner_or_service ON public.positions
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY closed_trades_read_owner_or_service ON public.closed_trades
FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'service_role');
CREATE POLICY closed_trades_write_service ON public.closed_trades
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY audit_read_team ON public.evento_auditoria
FOR SELECT USING (
  team_id IS NULL OR public.is_team_member(team_id) OR auth.role() = 'service_role'
);
CREATE POLICY audit_write_service ON public.evento_auditoria
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY alerts_rw_owner_or_service ON public.alert_log
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY risk_rw_owner_or_service ON public.risk_config
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY watchlists_rw_owner_or_service ON public.watchlists
FOR ALL USING (user_id = auth.uid() OR auth.role() = 'service_role')
WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY watchlist_symbols_rw_owner_or_service ON public.watchlist_symbols
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.watchlists w
    WHERE w.id = watchlist_symbols.watchlist_id
      AND (w.user_id = auth.uid() OR auth.role() = 'service_role')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.watchlists w
    WHERE w.id = watchlist_symbols.watchlist_id
      AND (w.user_id = auth.uid() OR auth.role() = 'service_role')
  )
);

COMMIT;
