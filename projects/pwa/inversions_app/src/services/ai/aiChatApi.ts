import { getAuthHeaders } from "../signals/signalApi";

// ── Request types ─────────────────────────────────────────

export interface AIChatRequest {
  ticker: string;
  currentPrice: number;
  question: string;
  zones?: unknown;
  coverageStrategies?: unknown[];
  userRole?: "analyst" | "risk_manager";
}

// ── Polling response (202) ────────────────────────────────

export interface AIChatPollingResponse {
  status: "pending" | "completed";
  contextId: string;
  responseId: string;
  pollingUrl?: string;
  retryAfterSeconds?: number;
  ai_unavailable: boolean;
  timestamp: string;
}

// ── Completed response (200) ──────────────────────────────

export interface ScenarioAnalysisItem {
  label: string;
  description: string;
  protectionLevel: "low" | "medium" | "high";
  potentialPnL: number;
}

export interface AIChatResponse {
  contextId: string;
  responseId: string;
  ticker: string;
  narrative: string;
  reasoning: string[];
  scenarioAnalysis: ScenarioAnalysisItem[];
  recommendation: string;
  evidenceIds: string[];
  modelVersion: string;
  responseHash: string;
  ai_unavailable: boolean;
  timestamp: string;
}

// ── API functions ─────────────────────────────────────────

const API_BASE = "/api/ai";

export async function submitChatQuestion(
  payload: AIChatRequest
): Promise<AIChatPollingResponse> {
  const response = await fetch(`${API_BASE}/institutional-chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });

  if (response.status === 503 || response.status === 500) {
    const body = await response.json().catch(() => ({}));
    return {
      status: "pending",
      contextId: "",
      responseId: "",
      ai_unavailable: body.ai_unavailable ?? true,
      timestamp: new Date().toISOString()
    };
  }

  if (!response.ok) {
    throw new Error(`Error al enviar consulta: ${response.status}`);
  }

  return (await response.json()) as AIChatPollingResponse;
}

export async function pollChatResponse(
  responseId: string
): Promise<AIChatResponse | AIChatPollingResponse> {
  const response = await fetch(
    `${API_BASE}/institutional-chat/poll/${encodeURIComponent(responseId)}`,
    {
      headers: { ...getAuthHeaders() }
    }
  );

  if (response.status === 503 || response.status === 500) {
    const body = await response.json().catch(() => ({}));
    return {
      status: "pending",
      contextId: "",
      responseId,
      ai_unavailable: body.ai_unavailable ?? true,
      timestamp: new Date().toISOString()
    };
  }

  if (!response.ok) {
    throw new Error(`Error al consultar respuesta: ${response.status}`);
  }

  const body = await response.json();

  if (body.status === "completed" || body.narrative) {
    return body as AIChatResponse;
  }

  return body as AIChatPollingResponse;
}

// ── Polling loop helper ───────────────────────────────────

export const POLL_INTERVAL_MS = 2000;
export const MAX_POLL_ATTEMPTS = 15;

export async function pollUntilComplete(
  responseId: string,
  onProgress?: (attempt: number) => void
): Promise<AIChatResponse> {
  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    onProgress?.(attempt);

    const result = await pollChatResponse(responseId);

    if ("ai_unavailable" in result && result.ai_unavailable) {
      throw new Error("AI_NO_AVAILABLE");
    }

    if ("narrative" in result && result.narrative) {
      return result as AIChatResponse;
    }

    if (attempt < MAX_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  throw new Error("POLL_TIMEOUT");
}
