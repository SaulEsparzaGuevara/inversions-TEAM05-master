/**
 * T042: Operation Timeline Component (React)
 * ============================================
 * Timeline de eventos de decision y ejecucion para una propuesta.
 * 
 * Funcionalidad:
 * - Visualizar cronologia: SIGNAL_GENERATED → HUMAN_APPROVED → EXECUTION_SUBMITTED → FILLED/FAILED
 * - Mostrar duracion entre etapas (time-to-approval, time-to-execution)
 * - Indicador visual de estado final: success (verde), failed (rojo), pending (gris)
 * - Mostrar detalle de error y diagnostico cuando la propuesta fallo
 * - Mostrar metadatos de la señal (confidence, sources) en el primer evento
 * - Cargado por proposalId via GET /api/audit/history/chain/:proposalId
 * 
 * Mapeo: FR-009, FR-011
 */

import React, { useState, useEffect } from 'react';

interface TimelineEvent {
  eventId: string;
  timestampUtc: string;
  actionType: string;
  userId: string;
  role: string;
  previousState: string;
  newState: string;
  instrument: string;
  broker?: string;
  orderType?: string;
  quantity?: number;
  outcomeCode?: string;
  errorCode?: string;
  traceComplete: boolean;
  missingFields?: string[];
}

interface TimelineResponse {
  proposalId: string;
  events: TimelineEvent[];
  totalEvents: number;
}

interface OperationTimelineProps {
  proposalId: string;
}

const EVENT_ICONS: Record<string, string> = {
  SIGNAL_GENERATED: '📡',
  HUMAN_APPROVED: '✅',
  EXECUTION_SUBMITTED: '🚀',
  EXECUTION_FAILED: '❌',
  EXECUTION_RETRIED: '🔄',
  HUMAN_REJECTED: '🚫',
};

const EVENT_COLORS: Record<string, string> = {
  SIGNAL_GENERATED: 'border-purple-400 bg-purple-50',
  HUMAN_APPROVED: 'border-green-400 bg-green-50',
  EXECUTION_SUBMITTED: 'border-blue-400 bg-blue-50',
  EXECUTION_FAILED: 'border-red-400 bg-red-50',
  EXECUTION_RETRIED: 'border-yellow-400 bg-yellow-50',
  HUMAN_REJECTED: 'border-gray-400 bg-gray-50',
};

const CONNECTOR_COLORS: Record<string, string> = {
  SIGNAL_GENERATED: 'bg-purple-300',
  HUMAN_APPROVED: 'bg-green-300',
  EXECUTION_SUBMITTED: 'bg-blue-300',
  EXECUTION_FAILED: 'bg-red-300',
  EXECUTION_RETRIED: 'bg-yellow-300',
  HUMAN_REJECTED: 'bg-gray-300',
};

/**
 * 🧠 FIC: Calculate elapsed time label between two ISO timestamps (EN)
 * 🧠 FIC: Calcular etiqueta de tiempo transcurrido entre dos timestamps ISO (ES)
 */
function timeDiffLabel(from: string, to: string): string {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (ms < 0) return '';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

export const OperationTimeline: React.FC<OperationTimelineProps> = ({ proposalId }) => {
  const [data, setData] = useState<TimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/audit/history/chain/${encodeURIComponent(proposalId)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result: TimelineResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading timeline');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [proposalId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
        Error cargando timeline: {error}
      </div>
    );
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron eventos para la propuesta {proposalId}
      </div>
    );
  }

  const lastEvent = data.events[data.events.length - 1];
  const isFailed = lastEvent.actionType === 'EXECUTION_FAILED';
  const isSuccess = lastEvent.newState === 'FILLED';

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* 🧠 FIC: Header showing proposal context and final status (EN) */}
      {/* 🧠 FIC: Encabezado con contexto de propuesta y estado final (ES) */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Timeline de Operación</h2>
          <p className="text-sm text-gray-500 font-mono">{proposalId}</p>
        </div>
        <div>
          {isSuccess && (
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              ✓ Ejecutado con éxito
            </span>
          )}
          {isFailed && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
              ✗ Fallido
            </span>
          )}
          {!isSuccess && !isFailed && (
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
              En proceso
            </span>
          )}
        </div>
      </div>

      {/* 🧠 FIC: Chronological timeline of operation lifecycle events (EN) */}
      {/* 🧠 FIC: Timeline cronologico de eventos del ciclo operativo (ES) */}
      <div className="relative">
        {data.events.map((event, index) => {
          const isLast = index === data.events.length - 1;
          const nextEvent = data.events[index + 1];
          const duration = nextEvent
            ? timeDiffLabel(event.timestampUtc, nextEvent.timestampUtc)
            : null;

          return (
            <div key={event.eventId} className="relative flex gap-4">
              {/* 🧠 FIC: Vertical connector between sequential events (EN) */}
              {/* 🧠 FIC: Conector vertical entre eventos secuenciales (ES) */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-10 bottom-0 w-0.5 ${CONNECTOR_COLORS[event.actionType] || 'bg-gray-300'}`}
                  style={{ top: '2.5rem', bottom: '-0.5rem' }}
                />
              )}

              {/* 🧠 FIC: Event icon according to action type (EN) */}
              {/* 🧠 FIC: Icono del evento segun tipo de accion (ES) */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg z-10 bg-white">
                {EVENT_ICONS[event.actionType] || '•'}
              </div>

              {/* 🧠 FIC: Main event payload and transition details (EN) */}
              {/* 🧠 FIC: Contenido principal del evento y detalle de transicion (ES) */}
              <div
                className={`flex-1 mb-6 rounded-lg border-l-4 p-4 ${EVENT_COLORS[event.actionType] || 'border-gray-400 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-gray-800">{event.actionType}</span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(event.timestampUtc).toLocaleString()}
                      {event.userId && (
                        <span className="ml-2">
                          · <span className="font-medium">{event.role}</span> {event.userId.slice(-6)}
                        </span>
                      )}
                    </p>
                  </div>
                  {!event.traceComplete && (
                    <span
                      className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded cursor-help"
                      title={`Faltan: ${event.missingFields?.join(', ')}`}
                    >
                      Traza incompleta
                    </span>
                  )}
                </div>

                {/* 🧠 FIC: State transition snapshot for this event (EN) */}
                {/* 🧠 FIC: Snapshot de transicion de estado para este evento (ES) */}
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">{event.previousState}</span>
                  <span className="mx-2 text-gray-400">→</span>
                  <span className="font-medium text-gray-800">{event.newState}</span>
                </div>

                {/* 🧠 FIC: Execution-level metadata when available (EN) */}
                {/* 🧠 FIC: Metadatos de ejecucion cuando esten disponibles (ES) */}
                {event.instrument && (
                  <div className="mt-1 text-xs text-gray-600 flex gap-3">
                    {event.instrument && <span>Instrumento: <b>{event.instrument}</b></span>}
                    {event.orderType && <span>Tipo: <b>{event.orderType}</b></span>}
                    {event.quantity !== undefined && <span>Cantidad: <b>{event.quantity}</b></span>}
                    {event.broker && <span>Broker: <b>{event.broker}</b></span>}
                  </div>
                )}

                {/* 🧠 FIC: Error surface for failed operation attempts (EN) */}
                {/* 🧠 FIC: Superficie de error para intentos fallidos de operacion (ES) */}
                {event.errorCode && (
                  <div className="mt-2 text-xs bg-red-100 text-red-700 rounded p-2">
                    Error: <code className="font-mono">{event.errorCode}</code>
                    {event.outcomeCode && (
                      <span className="ml-2">· Outcome: <code>{event.outcomeCode}</code></span>
                    )}
                  </div>
                )}
              </div>

              {/* 🧠 FIC: Duration marker between consecutive stages (EN) */}
              {/* 🧠 FIC: Marcador de duracion entre etapas consecutivas (ES) */}
              {duration && (
                <div className="absolute left-14 text-xs text-gray-400 font-mono"
                  style={{ top: '2.8rem' }}>
                  {duration}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🧠 FIC: End-of-timeline total duration summary (EN) */}
      {/* 🧠 FIC: Resumen de duracion total al final del timeline (ES) */}
      {data.events.length >= 2 && (
        <div className="border-t pt-4 text-sm text-gray-600">
          <span className="font-medium">Duración total: </span>
          {timeDiffLabel(data.events[0].timestampUtc, lastEvent.timestampUtc)}
        </div>
      )}
    </div>
  );
};

export default OperationTimeline;
