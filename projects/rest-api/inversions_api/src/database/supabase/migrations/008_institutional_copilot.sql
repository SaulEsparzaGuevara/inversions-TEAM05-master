-- FIC: Institutional copilot persistence for chat contexts, evidence blobs and explanation responses.
-- FIC: Persistencia del copilot institucional para contextos, evidencias y respuestas explicativas.

BEGIN;

CREATE TABLE IF NOT EXISTS public.institutional_contexts (
  "contextId" text PRIMARY KEY,
  ticker text NOT NULL,
  "currentPrice" numeric(18,6) NOT NULL,
  zones jsonb NOT NULL DEFAULT '[]'::jsonb,
  "coverageStrategies" jsonb NOT NULL DEFAULT '[]'::jsonb,
  question text NOT NULL,
  "userRole" text NOT NULL CHECK ("userRole" IN ('analyst', 'risk_manager')),
  "requestedAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.evidence_blobs (
  "evidenceId" text PRIMARY KEY,
  "contextId" text NOT NULL REFERENCES public.institutional_contexts("contextId") ON DELETE CASCADE,
  "sourceType" text NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.explanation_responses (
  "responseId" text PRIMARY KEY,
  "contextId" text NOT NULL REFERENCES public.institutional_contexts("contextId") ON DELETE CASCADE,
  narrative text NOT NULL,
  reasoning jsonb NOT NULL DEFAULT '[]'::jsonb,
  "scenarioAnalysis" jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendation text NOT NULL,
  "evidenceIds" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "modelVersion" text NOT NULL,
  "responseHash" text NOT NULL,
  ai_unavailable boolean NOT NULL DEFAULT false,
  "timestamp" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS explanation_responses_response_hash_uidx
  ON public.explanation_responses ("responseHash");

CREATE INDEX IF NOT EXISTS institutional_contexts_ticker_idx
  ON public.institutional_contexts (ticker);

CREATE INDEX IF NOT EXISTS evidence_blobs_context_id_idx
  ON public.evidence_blobs ("contextId");

CREATE INDEX IF NOT EXISTS explanation_responses_context_id_idx
  ON public.explanation_responses ("contextId");

COMMIT;
