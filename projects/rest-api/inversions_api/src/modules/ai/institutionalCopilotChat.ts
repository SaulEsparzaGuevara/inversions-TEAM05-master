/**
 * ============================================================================
 * institutionalCopilotChat.ts
 * ============================================================================
 *
 * FIC: T121: Institutional Copilot Chat — Gemini 2.5 Flash integration with contextual system prompt, async polling, and graceful degradation.
 */

import crypto from "node:crypto";
import type { CoverageStrategyResult } from "../strategies/coverage/coverageTypes.js";
import type { InstitutionalZone, InstitutionalZonesResult } from "../institutional/institutionalZonesEngine.js";

export type AIAnalystRole = "analyst" | "risk_manager";

export interface InstitutionalCopilotContext {
  contextId: string;
  ticker: string;
  currentPrice: number;
  zones: InstitutionalZonesResult;
  coverageStrategies: CoverageStrategyResult[];
  question: string;
  userRole: AIAnalystRole;
  requestedAt: string;
}

export interface InstitutionalCopilotEvidence {
  evidenceId: string;
  sourceType: "zone" | "strategy" | "metric" | "alert";
  label: string;
  value: string;
}

export interface InstitutionalCopilotScenarioAnalysisItem {
  label: string;
  description: string;
  protectionLevel: "low" | "medium" | "high";
  potentialPnL: number;
}

export interface InstitutionalCopilotResponse {
  contextId: string;
  context_id?: string;
  responseId: string;
  response_id?: string;
  ticker: string;
  narrative: string;
  reasoning: string[];
  scenarioAnalysis: InstitutionalCopilotScenarioAnalysisItem[];
  recommendation: string;
  evidenceIds: string[];
  evidence_ids?: string[];
  modelVersion: string;
  model_version?: string;
  responseHash: string;
  response_hash?: string;
  ai_unavailable: boolean;
  timestamp: string;
}

export interface InstitutionalCopilotAcceptedResponse {
  status: "pending";
  contextId: string;
  responseId: string;
  pollingUrl: string;
  retryAfterSeconds: number;
  ai_unavailable: false;
  timestamp: string;
}

export type InstitutionalCopilotSubmissionResponse =
  | InstitutionalCopilotResponse
  | InstitutionalCopilotAcceptedResponse;

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiResponse = {
  candidates?: GeminiCandidate[];
};

interface InstitutionalCopilotJob {
  context: InstitutionalCopilotContext;
  evidence: InstitutionalCopilotEvidence[];
  responseId: string;
  pollingUrl: string;
  createdAt: number;
  attempts: number;
  status: "pending" | "completed" | "expired";
  result?: InstitutionalCopilotResponse;
}

interface GeminiParsedPayload {
  narrative: string;
  reasoning: string[];
  scenarioAnalysis: InstitutionalCopilotScenarioAnalysisItem[];
  recommendation: string;
}

export class InstitutionalCopilotChat {
  // Modelo: Gemini 2.5 Flash — balance óptimo entre velocidad y calidad
  // para análisis financiero en tiempo real.
  // POR QUÉ FLASH vs PRO: Flash es significativamente más rápido y económico,
  // suficiente para análisis de cobertura institucional donde la latencia
  // importa (polling cada 2s).
  private readonly modelVersion = "gemini/gemini-2.5-flash";
  private readonly endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  // Timeout de 30s para la request a Gemini.
  private readonly timeoutMs = 30_000;

  // Ventana de decisión inicial: 5s. Si Gemini responde antes, se devuelve
  // respuesta directa (sin polling). Si no, se devuelve 202 Accepted y
  // el frontend hace polling cada 2s.
  // POR QUÉ 5s: Es un balance entre UX (respuesta rápida) y realismo
  // (Gemini puede tardar 3-10s en generar contenido complejo).
  private readonly initialDecisionWindowMs = 5_000;
  private readonly pollingIntervalMs = 2_000;
  private readonly maxPollingAttempts = 15;
  // TTL del job: 30s — si el usuario no completa el polling en 30s,
  // el job expira y se devuelve "AI unavailable".
  private readonly jobTtlMs = 30_000;
  private readonly jobs = new Map<string, InstitutionalCopilotJob>();

  async chat(context: InstitutionalCopilotContext): Promise<InstitutionalCopilotSubmissionResponse> {
    return this.submit(context);
  }

  /**
   * Envía una consulta al copilot y decide entre respuesta directa o polling.
   *
   * ESTRATEGIA DE POLLING (Promise.race):
   * 1. Se inicia la ejecución de Gemini inmediatamente.
   * 2. Se espera hasta initialDecisionWindowMs (5s).
   * 3. Si Gemini responde antes de 5s → se devuelve respuesta directa.
   * 4. Si Gemini tarda más → se devuelve 202 Accepted con pollingUrl.
   * 5. El frontend hace GET a /api/ai/institutional-chat/poll/:id cada 2s.
   *
   * POR QUÉ ESTE DISEÑO (vs espera síncrona):
   * - Las APIs de Gemini pueden tardar 3-15s en generar respuestas complejas.
   * - Una espera síncrona de >10s causa timeouts en proxies/load balancers.
   * - El polling permite mejor UX (spinner + resultado cuando esté listo).
   * - Si Gemini falla (timeout, API key inválida), se degrada gracefulmente
   *   con ai_unavailable=true.
   */
  async submit(context: InstitutionalCopilotContext): Promise<InstitutionalCopilotSubmissionResponse> {
    this.assertAllowedRole(context.userRole);

    const evidence = this.extractEvidence(context);
    const responseId = this.generateId("copilot-response");
    const job: InstitutionalCopilotJob = {
      context,
      evidence,
      responseId,
      pollingUrl: `/api/ai/institutional-chat/poll/${responseId}`,
      createdAt: Date.now(),
      attempts: 0,
      status: "pending"
    };

    this.jobs.set(responseId, job);

    // Inicia la ejecución de Gemini en background (no await).
    const execution = this.runGeminiWorkflow(job)
      .then((result) => {
        job.status = "completed";
        job.result = result;
        return result;
      })
      .catch((error) => {
        // DEGRADACIÓN GRACEFUL: Si Gemini falla, se genera respuesta
        // con ai_unavailable=true en lugar de lanzar error HTTP 500.
        job.status = "completed";
        job.result = this.buildUnavailableResponse(context, evidence, responseId, error);
        return job.result;
      });

    // Race entre ejecución de Gemini y ventana de decisión.
    const decision = await Promise.race([
      execution.then((result) => ({ kind: "completed" as const, result })),
      this.delay(this.initialDecisionWindowMs).then(() => ({ kind: "pending" as const }))
    ]);

    if (decision.kind === "completed") {
      return decision.result;
    }

    // Respuesta 202 Accepted — el frontend debe hacer polling.
    return {
      status: "pending",
      contextId: context.contextId,
      responseId,
      pollingUrl: job.pollingUrl,
      retryAfterSeconds: this.pollingIntervalMs / 1000,
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };
  }

  async poll(responseId: string): Promise<InstitutionalCopilotResponse | InstitutionalCopilotAcceptedResponse> {
    const job = this.jobs.get(responseId);
    if (!job) {
      return this.buildUnavailableFromResponseId(responseId, "Polling record not found.");
    }

    job.attempts += 1;

    if (job.result) {
      this.jobs.delete(responseId);
      return job.result;
    }

    if (this.isExpired(job)) {
      job.status = "expired";
      this.jobs.delete(responseId);
      return this.buildUnavailableResponse(job.context, job.evidence, job.responseId, new Error("Polling window expired."));
    }

    return {
      status: "pending",
      contextId: job.context.contextId,
      responseId: job.responseId,
      pollingUrl: job.pollingUrl,
      retryAfterSeconds: this.pollingIntervalMs / 1000,
      ai_unavailable: false,
      timestamp: new Date().toISOString()
    };
  }

  private async runGeminiWorkflow(job: InstitutionalCopilotJob): Promise<InstitutionalCopilotResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing.");
    }

    const prompt = this.buildPrompt(job.context, job.evidence);
    const response = await this.requestGemini(prompt, apiKey);
    const parsed = this.parseGeminiResponse(response);
    return this.buildSuccessResponse(job.context, job.evidence, job.responseId, parsed);
  }

  private assertAllowedRole(role: AIAnalystRole): void {
    if (role !== "analyst" && role !== "risk_manager") {
      throw new Error(`Role ${role} is not authorized for institutional chat.`);
    }
  }

  private async requestGemini(prompt: string, apiKey: string): Promise<GeminiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.endpoint}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.9,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Gemini request failed with status ${response.status}.`);
      }

      return (await response.json()) as GeminiResponse;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Gemini request timed out.");
      }

      throw error instanceof Error ? error : new Error("Gemini request failed.");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private parseGeminiResponse(response: GeminiResponse): GeminiParsedPayload {
    const text = this.extractCandidateText(response);
    if (!text) {
      throw new Error("Gemini response did not include text.");
    }

    const payload = this.safeJsonParse(text);
    if (!payload || typeof payload !== "object") {
      throw new Error("Gemini response was not valid JSON.");
    }

    const record = payload as Record<string, unknown>;
    const narrative = this.coerceString(record.narrative);
    const reasoning = this.coerceStringArray(record.reasoning);
    const scenarioAnalysis = this.coerceScenarioArray(record.scenarioAnalysis);
    const recommendation = this.coerceString(record.recommendation);

    if (!narrative || reasoning.length === 0 || scenarioAnalysis.length === 0 || !recommendation) {
      throw new Error("Gemini response is missing required fields.");
    }

    return {
      narrative,
      reasoning,
      scenarioAnalysis,
      recommendation
    };
  }

  private extractCandidateText(response: GeminiResponse): string {
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    return parts.map((part) => part.text ?? "").join("\n").trim();
  }

  private safeJsonParse(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return null;
      }

      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  private coerceString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
  }

  private coerceStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }

  private coerceScenarioArray(value: unknown): InstitutionalCopilotScenarioAnalysisItem[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const candidate = item as Record<string, unknown>;
        const label = this.coerceString(candidate.label);
        const description = this.coerceString(candidate.description);
        const protectionLevelRaw = this.coerceString(candidate.protectionLevel);
        const protectionLevel =
          protectionLevelRaw === "low" || protectionLevelRaw === "medium" || protectionLevelRaw === "high"
            ? protectionLevelRaw
            : "medium";
        const potentialPnL = typeof candidate.potentialPnL === "number" && Number.isFinite(candidate.potentialPnL)
          ? candidate.potentialPnL
          : 0;

        if (!label || !description) {
          return null;
        }

        return {
          label,
          description,
          protectionLevel,
          potentialPnL
        };
      })
      .filter((item): item is InstitutionalCopilotScenarioAnalysisItem => item !== null);
  }

  private buildPrompt(context: InstitutionalCopilotContext, evidence: InstitutionalCopilotEvidence[]): string {
    const zoneSummary = this.summarizeZones(context.zones.zones);
    const strategySummary = this.summarizeStrategies(context.coverageStrategies);
    const evidenceSummary = evidence
      .map((item) => `- [${item.evidenceId}] ${item.label}: ${item.value}`)
      .join("\n");

    return [
      "You are an institutional coverage analyst assistant.",
      "Return only valid JSON with this exact structure:",
      "{",
      '  "narrative": string,',
      '  "reasoning": string[],',
      '  "scenarioAnalysis": [{ "label": string, "description": string, "protectionLevel": "low" | "medium" | "high", "potentialPnL": number }],',
      '  "recommendation": string',
      "}",
      "Do not include markdown fences or extra keys.",
      "",
      `Context ID: ${context.contextId}`,
      `Ticker: ${context.ticker}`,
      `Current Price: ${context.currentPrice.toFixed(2)}`,
      `Requested At: ${context.requestedAt}`,
      `Question: ${context.question}`,
      `Role: ${context.userRole}`,
      "",
      "Institutional zones:",
      zoneSummary,
      "",
      "Coverage strategies:",
      strategySummary,
      "",
      "Evidence:",
      evidenceSummary || "- none",
      "",
      "Explain likely coverage scenarios, protection trade-offs, and what institutional evidence supports the recommendation."
    ].join("\n");
  }

  private summarizeZones(zones: InstitutionalZone[]): string {
    if (zones.length === 0) {
      return "- none";
    }

    return zones
      .map((zone) => {
        const direction = zone.type === "support" ? "support" : "resistance";
        return `- ${direction} @ ${zone.price.toFixed(2)} | strength=${zone.strength.toFixed(2)} | confidence=${zone.confidence.toFixed(2)} | touches=${zone.touches}`;
      })
      .join("\n");
  }

  private summarizeStrategies(strategies: CoverageStrategyResult[]): string {
    if (strategies.length === 0) {
      return "- none";
    }

    return strategies
      .map((strategy) => {
        const netPremium = strategy.riskMetrics.netPremium;
        const maxProtection = strategy.riskMetrics.maxProtection;
        return `- ${strategy.strategyKind} | ticker=${strategy.ticker} | currentPrice=${strategy.currentPrice.toFixed(2)} | netPremium=${netPremium.toFixed(2)} | maxProtection=${maxProtection.toFixed(2)} | alerts=${strategy.alerts.length}`;
      })
      .join("\n");
  }

  private extractEvidence(context: InstitutionalCopilotContext): InstitutionalCopilotEvidence[] {
    const evidence: InstitutionalCopilotEvidence[] = [];

    for (const zone of context.zones.zones) {
      evidence.push({
        evidenceId: this.generateId(`zone-${zone.type}`),
        sourceType: "zone",
        label: `${zone.type.toUpperCase()} at $${zone.price.toFixed(2)}`,
        value: `strength=${zone.strength.toFixed(2)} confidence=${zone.confidence.toFixed(2)} touches=${zone.touches} liquidity=${zone.liquidity}`
      });
    }

    for (const strategy of context.coverageStrategies) {
      evidence.push({
        evidenceId: this.generateId(`strategy-${strategy.strategyKind}`),
        sourceType: "strategy",
        label: `${strategy.strategyKind} strategy`,
        value: `netPremium=${strategy.riskMetrics.netPremium.toFixed(2)} maxProtection=${strategy.riskMetrics.maxProtection.toFixed(2)} alerts=${strategy.alerts.length}`
      });

      for (const alert of strategy.alerts) {
        evidence.push({
          evidenceId: this.generateId(`alert-${strategy.strategyKind}`),
          sourceType: "alert",
          label: `${strategy.strategyKind} alert ${alert.code}`,
          value: `${alert.severity}: ${alert.message}`
        });
      }
    }

    return evidence;
  }

  private buildSuccessResponse(
    context: InstitutionalCopilotContext,
    evidence: InstitutionalCopilotEvidence[],
    responseId: string,
    parsed: GeminiParsedPayload
  ): InstitutionalCopilotResponse {
    const timestamp = new Date().toISOString();
    const evidenceIds = evidence.map((item) => item.evidenceId);
    const responseHash = this.hashContent(
      JSON.stringify({
        contextId: context.contextId,
        responseId,
        evidenceIds,
        modelVersion: this.modelVersion,
        narrative: parsed.narrative,
        reasoning: parsed.reasoning,
        scenarioAnalysis: parsed.scenarioAnalysis,
        recommendation: parsed.recommendation,
        timestamp
      })
    );

    return {
      contextId: context.contextId,
      context_id: context.contextId,
      responseId,
      response_id: responseId,
      ticker: context.ticker,
      narrative: parsed.narrative,
      reasoning: parsed.reasoning,
      scenarioAnalysis: parsed.scenarioAnalysis,
      recommendation: parsed.recommendation,
      evidenceIds,
      evidence_ids: evidenceIds,
      modelVersion: this.modelVersion,
      model_version: this.modelVersion,
      responseHash,
      response_hash: responseHash,
      ai_unavailable: false,
      timestamp
    };
  }

  private buildUnavailableResponse(
    context: InstitutionalCopilotContext,
    evidence: InstitutionalCopilotEvidence[],
    responseId: string,
    error: unknown
  ): InstitutionalCopilotResponse {
    const message = error instanceof Error ? error.message : "Unknown error in Gemini integration.";
    const timestamp = new Date().toISOString();
    const evidenceIds = evidence.map((item) => item.evidenceId);
    const responseHash = this.hashContent(
      JSON.stringify({
        contextId: context.contextId,
        responseId,
        evidenceIds,
        modelVersion: this.modelVersion,
        error: message,
        timestamp
      })
    );

    return {
      contextId: context.contextId,
      context_id: context.contextId,
      responseId,
      response_id: responseId,
      ticker: context.ticker,
      narrative: `AI unavailable for ${context.ticker}.`,
      reasoning: [message],
      scenarioAnalysis: [],
      recommendation: "AI unavailable. Retry later or review institutional context manually.",
      evidenceIds,
      evidence_ids: evidenceIds,
      modelVersion: this.modelVersion,
      model_version: this.modelVersion,
      responseHash,
      response_hash: responseHash,
      ai_unavailable: true,
      timestamp
    };
  }

  private buildUnavailableFromResponseId(responseId: string, message: string): InstitutionalCopilotResponse {
    const timestamp = new Date().toISOString();
    const responseHash = this.hashContent(JSON.stringify({ responseId, message, modelVersion: this.modelVersion, timestamp }));

    return {
      contextId: responseId,
      responseId,
      ticker: "",
      narrative: "AI unavailable.",
      reasoning: [message],
      scenarioAnalysis: [],
      recommendation: "AI unavailable. Retry later or review institutional context manually.",
      evidenceIds: [],
      modelVersion: this.modelVersion,
      responseHash,
      ai_unavailable: true,
      timestamp
    };
  }

  private isExpired(job: InstitutionalCopilotJob): boolean {
    return job.attempts >= this.maxPollingAttempts || Date.now() - job.createdAt >= this.jobTtlMs;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateId(prefix: string): string {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  private hashContent(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }
}

export default InstitutionalCopilotChat;
