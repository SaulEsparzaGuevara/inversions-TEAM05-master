/**
 * T028: Broker Adapter Interface and Normalization
 * ==================================================
 * Interfaz base y normas de normalizacion para adaptadores de brokers.
 * 
 * Funcionalidad:
 * - Definir contrato comun para adaptadores IBKR y Alpaca
 * - Normalizar respuestas de broker a tipos comunes
 * - Mapear codigos de error de brokers a codigos estandar
 * - Manejar idempotencia via idempotency_key
 * 
 * Mapeo: FR-008, FR-014, PL-002
 */

/**
 * Tipos de orden soportados
 */
export type OrderType = 'BUY' | 'SELL';

/**
 * Estados de orden normalizados (mapping desde estados broker nativos)
 */
export type OrderState =
  | 'PENDING'           // Esperando ser enviado al broker
  | 'SUBMITTED'         // Enviado al broker, pendiente confirmacion
  | 'ACCEPTED'          // Broker acepto y esta buscando contraparte
  | 'FILLED'            // Completamente ejecutado
  | 'PARTIALLY_FILLED'  // Parcialmente ejecutado
  | 'CANCELLED'         // Cancelado
  | 'REJECTED'          // Broker rechazó
  | 'ERROR';            // Error en procesamiento

/**
 * Respuesta normalizada de envío de orden
 */
export interface NormalizedOrderResponse {
  orderId: string;
  state: OrderState;
  instrument: string;
  orderType: OrderType;
  quantity: number;
  filledQuantity: number;
  price?: number;
  executionPrice?: number;
  timestamp: Date;
  brokerTimestamp?: Date;
  metadata: {
    broker: 'IBKR' | 'ALPACA';
    nativeOrderId: string;
    nativeState: string;
    brokerId: string;
  };
}

/**
 * Error normalizado de broker
 */
export interface NormalizedBrokerError {
  errorCode: string; // estandar: INVALID_SYMBOL, INSUFFICIENT_FUNDS, etc.
  errorMessage: string;
  isRetryable: boolean;
  nativeErrorCode?: string;
  nativeErrorMessage?: string;
  timestamp: Date;
}

/**
 * Interfaz base para adaptadores de brokers
 */
export interface IBrokerAdapter {
  /**
   * Identificador unico del broker
   */
  brokerId: 'IBKR' | 'ALPACA';

  /**
   * Enviar orden al broker.
   * 
   * @param instrument Codigo de instrumento (ej: AAPL, MSFT)
   * @param orderType BUY o SELL
   * @param quantity Cantidad a ejecutar
   * @param price Precio limite (opcional; si no especifica, market order)
   * @param idempotencyKey Clave para idempotencia (para detectar reintentos)
   * 
   * @returns NormalizedOrderResponse en caso de exito
   * @throws NormalizedBrokerError en caso de fallo
   */
  submitOrder(
    instrument: string,
    orderType: OrderType,
    quantity: number,
    price?: number,
    idempotencyKey?: string
  ): Promise<NormalizedOrderResponse>;

  /**
   * Consultar estado de orden existente.
   * 
   * @param orderId ID nativo del broker
   * @returns NormalizedOrderResponse con estado actualizado
   * @throws NormalizedBrokerError en caso de fallo
   */
  getOrderStatus(orderId: string): Promise<NormalizedOrderResponse>;

  /**
   * Cancelar orden existente.
   * 
   * @param orderId ID nativo del broker
   * @returns NormalizedOrderResponse con estado CANCELLED
   * @throws NormalizedBrokerError en caso de fallo
   */
  cancelOrder(orderId: string): Promise<NormalizedOrderResponse>;

  /**
   * Verificar disponibilidad de margen/fondos para una orden.
   * 
   * @param orderType BUY o SELL
   * @param quantity Cantidad
   * @param price Precio unitario
   * @returns true si hay suficientes fondos, false en caso contrario
   */
  verifyFunds(orderType: OrderType, quantity: number, price: number): Promise<boolean>;

  /**
   * Obtener saldo de cuenta (cash + equidad)
   * 
   * @returns { cash: number, equity: number, buyingPower: number }
   */
  getAccountBalance(): Promise<{
    cash: number;
    equity: number;
    buyingPower: number;
  }>;

  /**
   * Normalizar codigo de error nativo a codigo estandar
   */
  normalizeError(nativeError: unknown): NormalizedBrokerError;
}

/**
 * Clase base para implementaciones de IBrokerAdapter
 */
export abstract class BaseBrokerAdapter implements IBrokerAdapter {
  abstract brokerId: 'IBKR' | 'ALPACA';

  abstract submitOrder(
    instrument: string,
    orderType: OrderType,
    quantity: number,
    price?: number,
    idempotencyKey?: string
  ): Promise<NormalizedOrderResponse>;

  abstract getOrderStatus(orderId: string): Promise<NormalizedOrderResponse>;

  abstract cancelOrder(orderId: string): Promise<NormalizedOrderResponse>;

  abstract verifyFunds(orderType: OrderType, quantity: number, price: number): Promise<boolean>;

  abstract getAccountBalance(): Promise<{
    cash: number;
    equity: number;
    buyingPower: number;
  }>;

  abstract normalizeError(nativeError: unknown): NormalizedBrokerError;

  /**
   * Helper para verificar si el error es recuperable
   */
  protected isRetryableError(errorCode: string): boolean {
    const retryableErrors = [
      'RATE_LIMIT',
      'TIMEOUT',
      'TEMPORARY_UNAVAILABLE',
      'NETWORK_ERROR',
    ];
    return retryableErrors.includes(errorCode);
  }

  /**
   * Helper para generar idempotency key si no existe
   */
  protected getOrCreateIdempotencyKey(key?: string): string {
    return key || `idem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Registro de adaptadores disponibles
 */
export class BrokerAdapterRegistry {
  private adapters: Map<string, IBrokerAdapter> = new Map();

  register(adapter: IBrokerAdapter): void {
    this.adapters.set(adapter.brokerId, adapter);
  }

  getAdapter(brokerId: 'IBKR' | 'ALPACA'): IBrokerAdapter | undefined {
    return this.adapters.get(brokerId);
  }

  getAdapters(): IBrokerAdapter[] {
    return Array.from(this.adapters.values());
  }
}
