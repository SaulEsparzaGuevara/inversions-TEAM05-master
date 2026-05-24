/**
 * T035: Execution Panel Component (React)
 * =======================================
 * Componente React que implementa el panel de ejecucion de propuestas aprobadas.
 * 
 * Funcionalidad:
 * - Mostrar propuesta aprobada con detalles
 * - Mostrar estado de aprobacion: quien, cuando, MFA usado
 * - Botón "Execute" para enviar POST /execution/execute
 * - Manejo de errores: ORDER_VERSION_STALE (409), RATE_LIMITED (429), EXECUTION_BLOCKED (400)
 * - En caso de ORDER_VERSION_STALE: sugerir refresh y re-approval
 * - En caso de RATE_LIMITED: mostrar cooldown y contar regresiva
 * - En caso de exito: mostrar orderId del broker y estado FILLED/PENDING
 * - Manejo de fallo: transiciona a PENDING_APPROVAL, permitir nuevo reintento
 * 
 * Mapeo: FR-015, FR-016, SC-002, PL-005, PL-009
 */

import React, { useState, useEffect } from 'react';

export interface ApprovedProposal {
  proposalId: string;
  signalId: string;
  instrument: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  version: number;
  approvedBy: string;
  approvedAt: Date;
  mfaMethod: string;
}

export interface ExecutionPanelProps {
  proposal: ApprovedProposal;
  onExecutionStart: () => void;
  onExecutionSuccess: (orderId: string) => void;
  onExecutionFailed: (reason: string) => void;
  onVersionStale: () => void;
}

export interface ExecutionState {
  status: 'idle' | 'executing' | 'success' | 'failed' | 'rate_limited' | 'version_stale';
  orderId?: string;
  errorMessage?: string;
  rateLimitCooldown?: number; // segundos restantes
  errorCode?: string;
}

/**
 * Componente ExecutionPanel
 */
export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  proposal,
  onExecutionStart,
  onExecutionSuccess,
  onExecutionFailed,
  onVersionStale,
}) => {
  const [state, setState] = useState<ExecutionState>({
    status: 'idle',
  });

  const approvalAgeSeconds = Math.floor((Date.now() - new Date(proposal.approvedAt).getTime()) / 1000);
  const isDecisionValid = approvalAgeSeconds <= 24 * 60 * 60;

  // Countdown para rate limit
  useEffect(() => {
    if (state.status === 'rate_limited' && state.rateLimitCooldown && state.rateLimitCooldown > 0) {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          rateLimitCooldown: (prev.rateLimitCooldown || 0) - 1,
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.rateLimitCooldown]);

  /**
   * Enviar orden aprobada al broker
   */
  const handleExecute = async () => {
    try {
      setState({ status: 'executing' });
      onExecutionStart();

      const response = await fetch('/api/execution/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.proposalId,
          proposalVersion: proposal.version,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Manejo de errores especificos
        if (response.status === 409) {
          // ORDER_VERSION_STALE - propuesta fue modificada
          setState({
            status: 'version_stale',
            errorCode: error.code,
            errorMessage: error.details?.message || 'Proposal version is outdated',
          });
          onVersionStale();
          return;
        }

        if (response.status === 429) {
          // RATE_LIMITED - demasiadas solicitudes
          setState({
            status: 'rate_limited',
            errorCode: error.code,
            errorMessage: error.details?.message || 'Rate limited',
            rateLimitCooldown: error.retryAfterSeconds || 120,
          });
          onExecutionFailed('RATE_LIMITED');
          return;
        }

        // Otros errores (400, 500, etc)
        setState({
          status: 'failed',
          errorCode: error.code,
          errorMessage: error.error || 'Execution failed',
        });
        onExecutionFailed(error.code);
        return;
      }

      const result = await response.json();
      setState({
        status: 'success',
        orderId: result.orderId,
      });
      onExecutionSuccess(result.orderId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setState({
        status: 'failed',
        errorMessage: errorMsg,
      });
      onExecutionFailed('NETWORK_ERROR');
    }
  };

  /**
   * Renderizar panel segun estado actual
   */
  const renderContent = () => {
    switch (state.status) {
      case 'idle':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ejecutar Orden</h3>
            <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Aprobado por:</span>
                <p className="font-semibold">{proposal.approvedBy}</p>
              </div>
              <div>
                <span className="text-gray-600">Aprobado hace:</span>
                <p className="font-semibold">
                  {approvalAgeSeconds}s
                </p>
              </div>
              <div>
                <span className="text-gray-600">Estado decisión:</span>
                <p className={`font-semibold ${isDecisionValid ? 'text-green-700' : 'text-red-700'}`}>
                  {isDecisionValid ? 'Válida para ejecución' : 'Expirada - requiere nueva aprobación'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">MFA usado:</span>
                <p className="font-semibold">{proposal.mfaMethod}</p>
              </div>
            </div>
            <button
              onClick={handleExecute}
              disabled={!isDecisionValid}
              className="w-full bg-green-600 text-white font-semibold py-3 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Ejecutar Ahora
            </button>
            {isDecisionValid ? (
              <p className="text-xs text-gray-600">
                Al hacer clic, se enviará la orden al broker. Esto no puede deshacerse inmediatamente.
              </p>
            ) : (
              <p className="text-xs text-red-700">
                Ejecución bloqueada: la decisión humana ya no es válida y requiere re-aprobación.
              </p>
            )}
          </div>
        );

      case 'executing':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="animate-spin">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-gray-600">Enviando orden al broker...</p>
          </div>
        );

      case 'success':
        return (
          <div className="bg-green-50 border border-green-200 rounded p-4 space-y-3">
            <h3 className="text-lg font-semibold text-green-800">✓ Orden Ejecutada</h3>
            <div className="bg-white p-3 rounded">
              <p className="text-sm text-gray-600">Order ID:</p>
              <code className="text-xs bg-gray-100 p-1 rounded font-mono block break-all">
                {state.orderId}
              </code>
            </div>
            <p className="text-sm text-gray-700">
              La orden ha sido enviada al broker y está siendo procesada. Consulta el historial para
              seguimiento.
            </p>
          </div>
        );

      case 'failed':
        return (
          <div className="bg-red-50 border border-red-200 rounded p-4 space-y-3">
            <h3 className="text-lg font-semibold text-red-800">✗ Ejecución Fallida</h3>
            <p className="text-sm text-gray-700">
              <strong>Error:</strong> {state.errorMessage}
            </p>
            {state.errorCode === 'APPROVAL_EXPIRED' && (
              <p className="text-xs text-gray-600">
                La ventana de aprobación (24h) ha expirado. Debes re-aprobar la propuesta antes de
                intentar nuevamente.
              </p>
            )}
            <button
              onClick={() => setState({ status: 'idle' })}
              className="w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700"
            >
              Intentar de nuevo
            </button>
          </div>
        );

      case 'rate_limited':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 space-y-3">
            <h3 className="text-lg font-semibold text-yellow-800">⏱ Límite de Tasa Alcanzado</h3>
            <p className="text-sm text-gray-700">
              Has excedido el límite de ejecuciones. Espera antes de intentar de nuevo.
            </p>
            <div className="bg-white p-3 rounded text-center">
              <p className="text-2xl font-mono font-bold text-yellow-600">
                {state.rateLimitCooldown}s
              </p>
              <p className="text-xs text-gray-600">hasta reintentar</p>
            </div>
          </div>
        );

      case 'version_stale':
        return (
          <div className="bg-red-50 border border-red-200 rounded p-4 space-y-3">
            <h3 className="text-lg font-semibold text-red-800">⚠ Propuesta Modificada</h3>
            <p className="text-sm text-gray-700">
              {state.errorMessage}
            </p>
            <p className="text-xs text-gray-600">
              Otra solicitud modificó esta propuesta mientras estabas esperando. Recarga la página y
              re-aprueba si deseas continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
            >
              Recargar Página
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <div className="grid grid-cols-2 gap-2 mb-6 pb-6 border-b">
        <div>
          <p className="text-xs text-gray-600">Instrumento</p>
          <p className="font-semibold">{proposal.instrument}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Tipo</p>
          <p className="font-semibold">{proposal.orderType}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Cantidad</p>
          <p className="font-semibold">{proposal.quantity}</p>
        </div>
        {proposal.price && (
          <div>
            <p className="text-xs text-gray-600">Precio Límite</p>
            <p className="font-semibold">${proposal.price}</p>
          </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default ExecutionPanel;
