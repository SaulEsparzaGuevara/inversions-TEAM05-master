/**
 * T030: Alpaca Broker Adapter Implementation
 * ==========================================
 * Adaptador concreto para Alpaca broker.
 * 
 * Funcionalidad:
 * - Implementar submitOrder con reintentos y backoff exponencial (timeout 5s, 2 reintentos)
 * - Normalizar respuestas de Alpaca a tipos comunes
 * - Mapear estados Alpaca a estados canonicos
 * - Implementar idempotencia via idempotency_key
 * - Manejar errores y codigos de fallo estandar
 * 
 * Mapeo: FR-008, PL-002, PL-010
 * 
 * @note En produccion: usar package `alpaca-trade-api` o similar.
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
 * Tipos nativos de Alpaca (simplificados para ejemplo)
 */
interface AlpacaOrderRequest {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  limit_price?: number;
  time_in_force: 'day' | 'gtc';
}

interface AlpacaOrderResponse {
  id: string;
  symbol: string;
  qty: number;
  filled_qty: number;
  status: string; // pending_new, accepted, filled, cancelled, rejected, expired
  filled_avg_price?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Mapeo de estados Alpaca a estados canonicos
 */
const ALPACA_STATE_MAP: Record<string, OrderState> = {
  'pending_new': 'PENDING',
  'accepted': 'ACCEPTED',
  'new': 'SUBMITTED',
  'partially_filled': 'PARTIALLY_FILLED',
  'filled': 'FILLED',
  'done_for_day': 'FILLED',
  'cancelled': 'CANCELLED',
  'expired': 'CANCELLED',
  'rejected': 'REJECTED',
  'suspended': 'ERROR',
  'stopped': 'ERROR',
};

export class AlpacaAdapter extends BaseBrokerAdapter {
  brokerId: 'ALPACA' = 'ALPACA';
  private apiKey: string;
  private apiSecret: string;
  private paperTradingMode: boolean;
  private requestTimeout: number = 5000; // 5s
  private maxRetries: number = 2;

  constructor(apiKey: string, apiSecret: string, paperTrading: boolean = true) {
    super();
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.paperTradingMode = paperTrading;
  }

  /**
   * Enviar orden a Alpaca con reintentos y backoff exponencial.
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

    const request: AlpacaOrderRequest = {
      symbol: instrument,
      qty: quantity,
      side: orderType.toLowerCase() as 'buy' | 'sell',
      type: price ? 'limit' : 'market',
      limit_price: price,
      time_in_force: 'day',
    };

    let lastError: Error | null = null;

    // Reintentos con backoff exponencial
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.submitOrderWithTimeout(request, this.requestTimeout, idemKey);
        return this.normalizeResponse(response);
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
   * Consultar estado de orden en Alpaca.
   */
  async getOrderStatus(orderId: string): Promise<NormalizedOrderResponse> {
    // FIC: Implementacion futura: llamar a Alpaca API para obtener estado
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
        broker: 'ALPACA',
        nativeOrderId: orderId,
        nativeState: 'pending_new',
        brokerId: this.paperTradingMode ? 'paper' : 'live',
      },
    };
  }

  /**
   * Cancelar orden en Alpaca.
   */
  async cancelOrder(orderId: string): Promise<NormalizedOrderResponse> {
    // FIC: Implementacion futura: llamar a Alpaca API para cancelar
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
        broker: 'ALPACA',
        nativeOrderId: orderId,
        nativeState: 'cancelled',
        brokerId: this.paperTradingMode ? 'paper' : 'live',
      },
    };
  }

  /**
   * Verificar disponibilidad de fondos en Alpaca.
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
   * Obtener saldo de cuenta Alpaca.
   */
  async getAccountBalance(): Promise<{
    cash: number;
    equity: number;
    buyingPower: number;
  }> {
    // FIC: Implementacion futura: llamar a Alpaca API
    // Por ahora stub
    return {
      cash: 100000,
      equity: 100000,
      buyingPower: 100000,
    };
  }

  /**
   * Normalizar error Alpaca a tipo estandar.
   */
  normalizeError(nativeError: unknown): NormalizedBrokerError {
    const errorMessage =
      nativeError instanceof Error ? nativeError.message : String(nativeError);

    // Mapear errores comunes de Alpaca
    let errorCode = 'UNKNOWN_ERROR';
    let isRetryable = false;

    if (errorMessage.includes('symbol not found')) {
      errorCode = 'INVALID_SYMBOL';
    } else if (errorMessage.includes('insufficient buying power')) {
      errorCode = 'INSUFFICIENT_FUNDS';
    } else if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
      errorCode = 'TIMEOUT';
      isRetryable = true;
    } else if (errorMessage.includes('rate limit')) {
      errorCode = 'RATE_LIMIT';
      isRetryable = true;
    } else if (errorMessage.includes('connection')) {
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
   * Helper: Ejecutar request HTTP a Alpaca con timeout.
   */
  private async submitOrderWithTimeout(
    request: AlpacaOrderRequest,
    timeout: number,
    idempotencyKey: string
  ): Promise<AlpacaOrderResponse> {
    // FIC: Implementacion futura: usar package `alpaca-trade-api` o HTTP request
    // Con timeout, header de idempotencia y manejo de errores
    // Por ahora stub que simula exito

    const now = new Date();
    return {
      id: `${idempotencyKey}_${Date.now()}`,
      symbol: request.symbol,
      qty: request.qty,
      filled_qty: 0,
      status: 'pending_new',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
  }

  /**
   * Helper: Normalizar respuesta Alpaca a NormalizedOrderResponse.
   */
  private normalizeResponse(response: AlpacaOrderResponse): NormalizedOrderResponse {
    const state = ALPACA_STATE_MAP[response.status] || 'ERROR';

    return {
      orderId: response.id,
      state,
      instrument: response.symbol,
      orderType: 'BUY', // FIC: Deberia venir de request, aqui es stub
      quantity: response.qty,
      filledQuantity: response.filled_qty,
      executionPrice: response.filled_avg_price || undefined,
      timestamp: new Date(response.updated_at),
      brokerTimestamp: new Date(response.created_at),
      metadata: {
        broker: 'ALPACA',
        nativeOrderId: response.id,
        nativeState: response.status,
        brokerId: this.paperTradingMode ? 'paper' : 'live',
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
