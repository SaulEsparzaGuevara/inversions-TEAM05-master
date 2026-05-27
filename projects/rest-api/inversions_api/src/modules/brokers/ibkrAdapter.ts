/**
 * T029: IBKR Broker Adapter Implementation
 * ========================================
 * Adaptador concreto para Interactive Brokers (IBKR).
 * 
 * Funcionalidad:
 * - Implementar submitOrder con reintentos y backoff exponencial (timeout 5s, 2 reintentos)
 * - Normalizar respuestas de IBKR a tipos comunes
 * - Mapear estados IBKR a estados canonicos (Submitted, Filled, etc.)
 * - Implementar idempotencia via idempotency_key
 * - Manejar errores y codigos de fallo estandar
 * 
 * Mapeo: FR-008, PL-002, PL-010 (degradacion por timeout)
 * 
 * @note En produccion: usar package `ibkr-api` o similar.
 *       Por ahora es stub con tipos para compilacion.
 */

import {
  BaseBrokerAdapter,
  OrderType,
  OrderState,
  NormalizedOrderResponse,
  NormalizedBrokerError,
} from './brokerAdapter.js';

/**
 * Tipos nativos de IBKR (simplificados para ejemplo)
 */
interface IBKROrderRequest {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MKT' | 'LMT'; // Market o Limit
  lmtPrice?: number;
  account: string;
}

interface IBKROrderResponse {
  orderId: number;
  status: string; // Submitted, Filled, Cancelled, etc.
  filled: number;
  remaining: number;
  avgPrice: number;
}

/**
 * Mapeo de estados IBKR a estados canonicos
 */
const IBKR_STATE_MAP: Record<string, OrderState> = {
  'Submitted': 'SUBMITTED',
  'PreSubmitted': 'PENDING',
  'ApiPending': 'PENDING',
  'ApiCancelled': 'CANCELLED',
  'Cancelled': 'CANCELLED',
  'Filled': 'FILLED',
  'PartialFilled': 'PARTIALLY_FILLED',
  'Inactive': 'REJECTED',
};

export class IBKRAdapter extends BaseBrokerAdapter {
  brokerId: 'IBKR' = 'IBKR';
  private apiKey: string;
  private accountId: string;
  private requestTimeout: number = 5000; // 5s
  private maxRetries: number = 2;

  constructor(apiKey: string, accountId: string) {
    super();
    this.apiKey = apiKey;
    this.accountId = accountId;
  }

  /**
   * Enviar orden a IBKR con reintentos y backoff exponencial.
   */
  async submitOrder(
    instrument: string,
    orderType: OrderType,
    quantity: number,
    price?: number,
    idempotencyKey?: string
  ): Promise<NormalizedOrderResponse> {
    const idemKey = this.getOrCreateIdempotencyKey(idempotencyKey);

    // FIC: Implementacion futura: verificar si existe orden anterior con mismo idemKey
    // para garantizar idempotencia (devolver respuesta cacheada)

    const request: IBKROrderRequest = {
      symbol: instrument,
      action: orderType,
      quantity,
      orderType: price ? 'LMT' : 'MKT',
      lmtPrice: price,
      account: this.accountId,
    };

    let lastError: Error | null = null;

    // Reintentos con backoff exponencial
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.submitOrderWithTimeout(request, this.requestTimeout);
        return this.normalizeResponse(response, instrument, orderType);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        if (attempt < this.maxRetries) {
          await this.sleep(backoffMs);
        }
      }
    }

    throw this.normalizeError(lastError);
  }

  /**
   * Consultar estado de orden en IBKR.
   */
  async getOrderStatus(orderId: string): Promise<NormalizedOrderResponse> {
    // FIC: Implementacion futura: llamar a IBKR API para obtener estado
    // Por ahora stub
    return {
      orderId,
      state: 'PENDING',
      instrument: '',
      orderType: 'BUY',
      quantity: 0,
      filledQuantity: 0,
      timestamp: new Date(),
      metadata: {
        broker: 'IBKR',
        nativeOrderId: orderId,
        nativeState: 'Submitted',
        brokerId: this.accountId,
      },
    };
  }

  /**
   * Cancelar orden en IBKR.
   */
  async cancelOrder(orderId: string): Promise<NormalizedOrderResponse> {
    // FIC: Implementacion futura: llamar a IBKR API para cancelar
    // Por ahora stub
    return {
      orderId,
      state: 'CANCELLED',
      instrument: '',
      orderType: 'BUY',
      quantity: 0,
      filledQuantity: 0,
      timestamp: new Date(),
      metadata: {
        broker: 'IBKR',
        nativeOrderId: orderId,
        nativeState: 'Cancelled',
        brokerId: this.accountId,
      },
    };
  }

  /**
   * Verificar disponibilidad de fondos en IBKR.
   */
  async verifyFunds(orderType: OrderType, quantity: number, price: number): Promise<boolean> {
    const balance = await this.getAccountBalance();
    const requiredFunds = quantity * price;

    if (orderType === 'BUY') {
      return balance.buyingPower >= requiredFunds;
    } else {
      // SELL: verificar que posicion existe (implementacion futura)
      return true;
    }
  }

  /**
   * Obtener saldo de cuenta IBKR.
   */
  async getAccountBalance(): Promise<{
    cash: number;
    equity: number;
    buyingPower: number;
  }> {
    // FIC: Implementacion futura: llamar a IBKR API
    // Por ahora stub
    return {
      cash: 100000,
      equity: 100000,
      buyingPower: 100000,
    };
  }

  /**
   * Normalizar error IBKR a tipo estandar.
   */
  normalizeError(nativeError: unknown): NormalizedBrokerError {
    const errorMessage =
      nativeError instanceof Error ? nativeError.message : String(nativeError);

    // Mapear errores comunes de IBKR
    let errorCode = 'UNKNOWN_ERROR';
    let isRetryable = false;

    if (errorMessage.includes('Invalid symbol')) {
      errorCode = 'INVALID_SYMBOL';
    } else if (errorMessage.includes('Insufficient funds')) {
      errorCode = 'INSUFFICIENT_FUNDS';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      errorCode = 'TIMEOUT';
      isRetryable = true;
    } else if (errorMessage.includes('rate limit')) {
      errorCode = 'RATE_LIMIT';
      isRetryable = true;
    } else if (errorMessage.includes('Connection refused')) {
      errorCode = 'NETWORK_ERROR';
      isRetryable = true;
    }

    return {
      errorCode,
      errorMessage,
      isRetryable: super['isRetryableError'](errorCode) || isRetryable,
      timestamp: new Date(),
    };
  }

  // ============ Privados ============

  /**
   * Helper: Ejecutar request HTTP con timeout.
   */
  private async submitOrderWithTimeout(
    request: IBKROrderRequest,
    timeout: number
  ): Promise<IBKROrderResponse> {
    // FIC: Implementacion futura: usar package `ibkr-api` o HTTP request
    // Con timeout y manejo de errores
    // Por ahora stub que simula exito

    return {
      orderId: Math.floor(Math.random() * 1000000),
      status: 'Submitted',
      filled: 0,
      remaining: request.quantity,
      avgPrice: 0,
    };
  }

  /**
   * Helper: Normalizar respuesta IBKR a NormalizedOrderResponse.
   */
  private normalizeResponse(
    response: IBKROrderResponse,
    instrument: string,
    orderType: OrderType
  ): NormalizedOrderResponse {
    const state = IBKR_STATE_MAP[response.status] || 'ERROR';

    return {
      orderId: String(response.orderId),
      state,
      instrument,
      orderType,
      quantity: response.remaining + response.filled,
      filledQuantity: response.filled,
      executionPrice: response.avgPrice || undefined,
      timestamp: new Date(),
      metadata: {
        broker: 'IBKR',
        nativeOrderId: String(response.orderId),
        nativeState: response.status,
        brokerId: this.accountId,
      },
    };
  }

  /**
   * Helper: Dormir N milisegundos.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
