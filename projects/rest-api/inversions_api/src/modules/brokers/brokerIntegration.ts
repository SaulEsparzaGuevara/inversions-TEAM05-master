import type { IBrokerAdapter, NormalizedOrderResponse } from "./brokerAdapter.js";
import { BrokerAdapterRegistry } from "./brokerAdapter.js";

export interface BrokerOrderPayload {
  broker: "IBKR" | "ALPACA";
  instrument: string;
  orderType: "BUY" | "SELL";
  quantity: number;
  price?: number;
  idempotencyKey?: string;
}

export interface BrokerExecutionResult {
  ok: boolean;
  order?: NormalizedOrderResponse;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
}

/**
 * FIC: Decoupled broker wiring for execution flow with normalized error handling.
 * Centralizes adapter lookup and converts adapter exceptions into a stable result contract.
 *
 * FIC: Integración desacoplada de brokers para flujo de ejecución con manejo normalizado de errores.
 * Centraliza lookup de adaptador y convierte excepciones en un contrato estable de resultado.
 */
export class BrokerIntegrationService {
  constructor(private readonly registry: BrokerAdapterRegistry) {}

  async executeOrder(payload: BrokerOrderPayload): Promise<BrokerExecutionResult> {
    const adapter = this.registry.getAdapter(payload.broker);
    if (!adapter) {
      return {
        ok: false,
        errorCode: "BROKER_ADAPTER_NOT_AVAILABLE",
        errorMessage: `No adapter registered for broker ${payload.broker}`,
        retryable: false
      };
    }

    try {
      const order = await adapter.submitOrder(
        payload.instrument,
        payload.orderType,
        payload.quantity,
        payload.price,
        payload.idempotencyKey
      );

      return {
        ok: true,
        order
      };
    } catch (error) {
      const normalized = adapter.normalizeError(error);
      return {
        ok: false,
        errorCode: normalized.errorCode,
        errorMessage: normalized.errorMessage,
        retryable: normalized.isRetryable
      };
    }
  }
}
