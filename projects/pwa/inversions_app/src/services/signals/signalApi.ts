/**
 * ============================================================================
 * signalApi.ts
 * ============================================================================
 *
 * FIC: Signal API placeholder — getSignals GET /api/signals for future trading signal integration.
 */

export type SignalDirection = "BUY" | "SELL" | "HOLD";

export interface SourceVerdict {
  sourceId: string;
  verdict: SignalDirection;
  confidence: number;
  rationale: string;
}

export interface EvaluateSignalRequest {
  instrument: string;
  verdicts: SourceVerdict[];
}

export interface EvaluateSignalResponse {
  signalId: string;
  correlationId: string;
  instrument: string;
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
  explainability: {
    summary: string;
    evidence: SourceVerdict[];
  };
}

export interface SignalDetailsResponse {
  signalId: string;
  summary: string;
  evidence: SourceVerdict[];
}

export interface DashboardSignalCard {
  signalId: string;
  instrument: string;
  signal: SignalDirection;
  confidence: number;
  confluenceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  activeCores: string[];
  updatedAt: string;
  evidence: SourceVerdict[];
  metadata?: {
    timing_d?: string;
    timing_h?: string;
    pre_senal?: string;
    senal_real_activada?: boolean;
    stop?: number;
    objetivo?: number;
    divergencia?: string;
    z_extrema?: number;
    cantidad_sugerida?: number;
    vencimiento?: string;
    precio_ejercicio?: number;
    tipo_opcion?: "call" | "put";
    duracion?: number;
    bid?: number;
    ask?: number;
    zona_apertura?: string;
    zona_cierre?: string;
    stoploss_sugerido?: number;
    alerta_configurada?: boolean;
    referencia_maximos?: number;
    referencia_minimos?: number;
    variantes_ataque?: string;
    recolocacion_stoploss?: string;
    liquidez?: string;
    riesgo?: string;
    retorno_maximo?: number;
    perdida_maxima?: number;
  };
}

export interface DashboardOrchestratorResponse {
  timeframe: string;
  generatedAt: string;
  instruments: string[];
  cards: DashboardSignalCard[];
}

export interface DashboardQueryParams {
  instruments: string;
  timeframe: string;
}

interface ApiErrorPayload {
  code?: string;
}

const API_BASE = "/api/signals";

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const storageToken =
    typeof window !== "undefined" ? window.localStorage.getItem("inversions.dev.token") ?? undefined : undefined;
  const envToken = import.meta.env.VITE_DEV_BEARER_TOKEN as string | undefined;
  const token = storageToken || envToken;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function evaluateSignal(payload: EvaluateSignalRequest): Promise<EvaluateSignalResponse> {
  const response = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error al evaluar senal: ${response.status}`);
  }

  return (await response.json()) as EvaluateSignalResponse;
}

export async function getSignalDetails(signalId: string): Promise<SignalDetailsResponse> {
  const response = await fetch(`${API_BASE}/${signalId}/details`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    throw new Error(`Error al obtener detalle de senal: ${response.status}`);
  }

  return (await response.json()) as SignalDetailsResponse;
}

/**
 * FIC: Fetch dashboard orchestrator payload with instrument/timeframe filters.
 *
 * FIC: Obtiene payload del orquestador del dashboard con filtros de instrumento/timeframe.
 */
export async function getDashboardOrchestrator(
  params: DashboardQueryParams
): Promise<DashboardOrchestratorResponse> {
  const query = new URLSearchParams({
    instruments: params.instruments,
    timeframe: params.timeframe
  }).toString();

  const response = await fetch(`/api/dashboard/orchestrator?${query}`, {
    headers: {
      ...getAuthHeaders()
    }
  });

  if (!response.ok) {
    let apiCode: string | undefined;

    try {
      const payload = (await response.clone().json()) as ApiErrorPayload;
      apiCode = payload.code;
    } catch {
      // Keep generic fallback when body is not JSON.
    }

    if (response.status === 401) {
      if (apiCode === "AUTH_CONTEXT_MISSING") {
        throw new Error(
          "No hay token de autenticacion. Configura AUTH_BYPASS=true en backend para desarrollo o define inversions.dev.token/VITE_DEV_BEARER_TOKEN en frontend."
        );
      }

      if (apiCode === "AUTH_CONTEXT_INVALID_TOKEN") {
        throw new Error(
          "Token de autenticacion invalido. Verifica JWT_SECRET en backend y actualiza inversions.dev.token o VITE_DEV_BEARER_TOKEN."
        );
      }
    }

    throw new Error(`Error al consultar dashboard orquestador: ${response.status}`);
  }

  return (await response.json()) as DashboardOrchestratorResponse;
}
