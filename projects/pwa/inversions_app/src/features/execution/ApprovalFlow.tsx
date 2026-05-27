/**
 * T034: Approval Flow Component (React)
 * ======================================
 * Componente React que implementa el flujo de aprobacion de propuestas operativas.
 * 
 * Funcionalidad:
 * - Mostrar propuesta con detalles (instrumento, cantidad, tipo, señal origen)
 * - Mostrar disclaimer de no-asesoria con checkbox de acknowledge
 * - Requerir entrada de MFA (TOTP, SMS, etc) segun rol
 * - Enviar POST /execution/approve con validacion local
 * - Manejo de errores: MFA expirado, permissions, etc
 * - Confirmacion visual tras aprobacion exitosa
 * 
 * Mapeo: FR-004, FR-013, FR-019, SC-002, SC-008
 * 
 * UI Flow:
 * 1. [Propuesta Summary] - detalles de la orden
 * 2. [Disclaimer Panel] - texto + checkbox "I acknowledge"
 * 3. [MFA Input] - opcional si viewer, requerido si trader/admin
 * 4. [Buttons] - Approve / Cancel
 * 5. [Confirmation] - "Approved! Next: Execute" o "Rejected"
 */

import React, { useState, useEffect } from 'react';

export interface Proposal {
  proposalId: string;
  signalId: string;
  instrument: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  version: number;
  confidence?: number; // 0-100
  evidence?: Array<{ source: string; signal: string; confidence: number }>;
}

export interface ApprovalFlowProps {
  proposal: Proposal;
  userRole: 'viewer' | 'trader' | 'admin';
  onApproved: (approvalId: string) => void;
  onRejected: () => void;
  onError: (error: string) => void;
}

export interface ApprovalState {
  step: 'summary' | 'disclaimer' | 'mfa' | 'submitting' | 'confirmed' | 'error';
  disclaimerAcknowledged: boolean;
  mfaMethod?: 'totp' | 'sms' | 'hardware_key';
  mfaToken?: string;
  error?: string;
  approvalId?: string;
  serverVersion?: number;
}

/**
 * Componente ApprovalFlow
 */
export const ApprovalFlow: React.FC<ApprovalFlowProps> = ({
  proposal,
  userRole,
  onApproved,
  onRejected,
  onError,
}) => {
  const [state, setState] = useState<ApprovalState>({
    step: 'summary',
    disclaimerAcknowledged: false,
  });

  const disclaimerText = `
DESCARGO DE RESPONSABILIDAD

Esta plataforma proporciona señales y recomendaciones de inversión basadas en análisis técnico e inteligencia artificial.
Estas recomendaciones NO constituyen asesoría financiera profesional.

Usted es responsable de:
- Evaluar independientemente cada propuesta operativa
- Verificar que sea consistente con su estrategia de inversión y tolerancia al riesgo
- Entender completamente los riesgos asociados con cada orden antes de ejecutar

La plataforma y sus desarrolladores no son responsables por pérdidas derivadas de la ejecución de órdenes generadas o recomendadas por este sistema.

Al hacer clic en "Aprobar", usted reconoce haber leído y aceptado este descargo.
  `.trim();

  /**
   * Manejar transicion de paso en el flujo
   */
  const handleNextStep = () => {
    if (state.step === 'summary') {
      setState({ ...state, step: 'disclaimer' });
    } else if (state.step === 'disclaimer') {
      if (!state.disclaimerAcknowledged) {
        setState({ ...state, error: 'Must acknowledge disclaimer' });
        return;
      }
      // Si es viewer, ir directo a submission; si es trader/admin, requiere MFA
      const nextStep = userRole === 'viewer' ? 'submitting' : 'mfa';
      setState({ ...state, step: nextStep, error: undefined });
    } else if (state.step === 'mfa') {
      if (!state.mfaToken || state.mfaToken.trim().length === 0) {
        setState({ ...state, error: 'MFA token is required' });
        return;
      }
      setState({ ...state, step: 'submitting', error: undefined });
    }
  };

  /**
   * Enviar aprobacion al backend
   */
  const handleSubmit = async () => {
    try {
      setState({ ...state, step: 'submitting', error: undefined });

      const response = await fetch('/api/execution/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposal.proposalId,
          proposalVersion: proposal.version,
          disclaimerAcknowledged: state.disclaimerAcknowledged,
          disclaimerText: disclaimerText,
          mfaContext: state.mfaToken
            ? {
                method: state.mfaMethod || 'totp',
                verificationToken: state.mfaToken,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const code = error.code as string | undefined;
        const details = error.details as Record<string, unknown> | undefined;

        let message = error.error || 'Approval failed';
        if (code === 'OPERATIONAL_RESTRICTION') {
          message = 'No tienes permisos para aprobar esta propuesta. Requiere rol trader/admin.';
        } else if (code === 'DECISION_VERSION_CONFLICT') {
          message = 'La propuesta cambió mientras decidías. Actualiza y vuelve a aprobar.';
        } else if (code === 'MFA_REQUIRED') {
          message = 'Se requiere MFA válido para continuar con la aprobación.';
        }

        setState({
          ...state,
          step: 'error',
          error: message,
          serverVersion: typeof details?.serverVersion === 'number' ? (details.serverVersion as number) : undefined,
        });
        onError(message);
        return;
      }

      const result = await response.json();
      setState({
        ...state,
        step: 'confirmed',
        approvalId: result.approvalId,
      });
      onApproved(result.approvalId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setState({ ...state, step: 'error', error: errorMsg });
      onError(errorMsg);
    }
  };

  /**
   * Renderizar paso actual
   */
  const renderStep = () => {
    switch (state.step) {
      case 'summary':
        return (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold">Propuesta de Ejecución</h2>
            <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
              Aviso: esta recomendación no es asesoría financiera. La decisión final de ejecución es humana.
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Instrumento:</span>
                <p className="font-semibold">{proposal.instrument}</p>
              </div>
              <div>
                <span className="text-gray-600">Tipo:</span>
                <p className="font-semibold">{proposal.orderType}</p>
              </div>
              <div>
                <span className="text-gray-600">Cantidad:</span>
                <p className="font-semibold">{proposal.quantity}</p>
              </div>
              <div>
                <span className="text-gray-600">Confianza:</span>
                <p className="font-semibold">{proposal.confidence}%</p>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                Esta propuesta proviene de la señal <code>{proposal.signalId}</code>.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Revisa la evidencia en el panel lateral antes de proceder.
              </p>
            </div>
            <button
              onClick={handleNextStep}
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
            >
              Continuar
            </button>
          </div>
        );

      case 'disclaimer':
        return (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">Descargo de Responsabilidad</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 max-h-60 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">{disclaimerText}</pre>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={state.disclaimerAcknowledged}
                onChange={(e) =>
                  setState({ ...state, disclaimerAcknowledged: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Reconozco haber leído y acepto este descargo</span>
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setState({ ...state, step: 'summary' })}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400"
              >
                Atrás
              </button>
              <button
                onClick={handleNextStep}
                disabled={!state.disclaimerAcknowledged}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 'mfa':
        return (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold">Verificación de Seguridad (MFA)</h2>
            <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
              Confirma únicamente órdenes que entiendas y hayas validado; esta plataforma no sustituye asesoría financiera.
            </div>
            <p className="text-sm text-gray-700">
              Como {userRole === 'admin' ? 'administrador' : 'trader'}, debe verificar su identidad.
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Método:</label>
              <select
                value={state.mfaMethod || 'totp'}
                onChange={(e) =>
                  setState({
                    ...state,
                    mfaMethod: e.target.value as 'totp' | 'sms' | 'hardware_key',
                  })
                }
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="totp">Authenticator (TOTP)</option>
                <option value="sms">SMS</option>
                <option value="hardware_key">Hardware Key</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {state.mfaMethod === 'totp' ? 'Token (6 dígitos)' : 'Código recibido'}
              </label>
              <input
                type="text"
                value={state.mfaToken || ''}
                onChange={(e) => setState({ ...state, mfaToken: e.target.value })}
                placeholder="000000"
                maxLength={6}
                className="w-full border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setState({ ...state, step: 'disclaimer' })}
                className="flex-1 bg-gray-300 text-gray-800 font-semibold py-2 rounded hover:bg-gray-400"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
              >
                Aprobar
              </button>
            </div>
          </div>
        );

      case 'submitting':
        return (
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <p className="text-gray-600">Enviando aprobación...</p>
          </div>
        );

      case 'confirmed':
        return (
          <div className="bg-green-50 rounded-lg shadow p-6 space-y-4 border border-green-200">
            <h2 className="text-xl font-bold text-green-800">✓ Aprobado</h2>
            <p className="text-green-700">
              La propuesta ha sido aprobada. Approval ID: <code className="bg-white p-1 rounded text-xs">{state.approvalId}</code>
            </p>
            <p className="text-sm text-gray-700">Puedes proceder a ejecutar la orden cuando estés listo.</p>
          </div>
        );

      case 'error':
        return (
          <div className="bg-red-50 rounded-lg shadow p-6 space-y-4 border border-red-200">
            <h2 className="text-xl font-bold text-red-800">✗ Error</h2>
            <p className="text-red-700">{state.error}</p>
            {state.serverVersion ? (
              <p className="text-xs text-gray-700">Versión actual del servidor: {state.serverVersion}</p>
            ) : null}
            <button
              onClick={() => setState({ ...state, step: 'summary' })}
              className="w-full bg-red-600 text-white font-semibold py-2 rounded hover:bg-red-700"
            >
              Intentar de nuevo
            </button>
          </div>
        );
    }
  };

  return <div className="max-w-md mx-auto">{renderStep()}</div>;
};

export default ApprovalFlow;
