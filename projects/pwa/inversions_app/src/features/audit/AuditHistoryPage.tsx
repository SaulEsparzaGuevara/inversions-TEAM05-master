/**
 * T041: Audit History Dashboard (React)
 * =======================================
 * Dashboard de historial de auditoria con filtros e indicadores de latencia.
 * 
 * Funcionalidad:
 * - Tabla paginada de eventos de auditoria con filtros por proposalId, instrument, broker
 * - Rango de fechas (fromDate / toDate)
 * - Filtro por actionType (HUMAN_APPROVED, EXECUTION_SUBMITTED, EXECUTION_FAILED)
 * - Indicador visual de latencia de consulta (queryLatencyMs)
 * - Indicador de completitud de traza (traceCompletenessPercent)
 * - Badge traceComplete por fila (verde/rojo)
 * - Enlace a detalle de operacion (OperationTimeline)
 * 
 * Mapeo: SC-003, FR-011
 */

import React, { useState, useEffect, useCallback } from 'react';

interface AuditEntry {
  eventId: string;
  timestampUtc: string;
  correlationId: string;
  proposalId: string;
  signalId: string;
  userId: string;
  actionType: string;
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

interface AuditHistoryResponse {
  items: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  queryLatencyMs: number;
  traceCompletenessPercent: number;
}

interface AuditFilters {
  proposalId: string;
  signalId: string;
  instrument: string;
  broker: string;
  actionTypes: string[];
  fromDate: string;
  toDate: string;
}

const ACTION_TYPES = [
  'HUMAN_APPROVED',
  'EXECUTION_SUBMITTED',
  'EXECUTION_FAILED',
  'EXECUTION_RETRIED',
  'SIGNAL_GENERATED',
];

const ACTION_COLORS: Record<string, string> = {
  HUMAN_APPROVED: 'bg-green-100 text-green-800',
  EXECUTION_SUBMITTED: 'bg-blue-100 text-blue-800',
  EXECUTION_FAILED: 'bg-red-100 text-red-800',
  EXECUTION_RETRIED: 'bg-yellow-100 text-yellow-800',
  SIGNAL_GENERATED: 'bg-purple-100 text-purple-800',
};

export const AuditHistoryPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditFilters>({
    proposalId: '',
    signalId: '',
    instrument: '',
    broker: '',
    actionTypes: [],
    fromDate: '',
    toDate: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.proposalId) params.set('proposalId', filters.proposalId);
      if (filters.signalId) params.set('signalId', filters.signalId);
      if (filters.instrument) params.set('instrument', filters.instrument);
      if (filters.broker) params.set('broker', filters.broker);
      if (filters.actionTypes.length) params.set('actionTypes', filters.actionTypes.join(','));
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);
      params.set('page', String(page));
      params.set('pageSize', '20');

      const response = await fetch(`/api/audit/history?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result: AuditHistoryResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading history');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleFilterChange = (key: keyof AuditFilters, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // 🧠 FIC: Reset to first page when filters change / Reiniciar a la primera pagina al cambiar filtros (EN/ES)
  };

  const toggleActionType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      actionTypes: prev.actionTypes.includes(type)
        ? prev.actionTypes.filter((t) => t !== type)
        : [...prev.actionTypes, type],
    }));
    setPage(1);
  };

  const latencyColor = (ms: number) => {
    if (ms < 500) return 'text-green-600';
    if (ms < 1500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 🧠 FIC: Header with global audit metrics (EN) */}
        {/* 🧠 FIC: Encabezado con metricas globales de auditoria (ES) */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Auditoría</h1>
          {data && (
            <div className="flex items-center gap-6 text-sm">
              <span>
                Completitud de traza:{' '}
                <span
                  className={
                    data.traceCompletenessPercent >= 98
                      ? 'font-bold text-green-600'
                      : 'font-bold text-red-600'
                  }
                >
                  {data.traceCompletenessPercent}%
                </span>
              </span>
              <span>
                Latencia:{' '}
                <span className={`font-mono font-bold ${latencyColor(data.queryLatencyMs)}`}>
                  {data.queryLatencyMs}ms
                </span>
              </span>
              <span className="text-gray-600">Total: {data.total} eventos</span>
            </div>
          )}
        </div>

        {/* 🧠 FIC: Filter panel for audit history query (EN) */}
        {/* 🧠 FIC: Panel de filtros para la consulta del historial (ES) */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <h2 className="font-semibold text-gray-700">Filtros</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Proposal ID"
              value={filters.proposalId}
              onChange={(e) => handleFilterChange('proposalId', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Signal ID"
              value={filters.signalId}
              onChange={(e) => handleFilterChange('signalId', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Instrumento (ej: AAPL)"
              value={filters.instrument}
              onChange={(e) => handleFilterChange('instrument', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <select
              value={filters.broker}
              onChange={(e) => handleFilterChange('broker', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">Todos los brokers</option>
              <option value="IBKR">IBKR</option>
              <option value="ALPACA">ALPACA</option>
            </select>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* 🧠 FIC: Action-type quick filters for event classes (EN) */}
          {/* 🧠 FIC: Filtros rapidos por tipo de accion para clases de eventos (ES) */}
          <div className="flex flex-wrap gap-2">
            {ACTION_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => toggleActionType(type)}
                className={`text-xs px-2 py-1 rounded border transition ${
                  filters.actionTypes.includes(type)
                    ? (ACTION_COLORS[type] || 'bg-gray-200') + ' border-transparent'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 🧠 FIC: Loading state while fetching history page (EN) */}
        {/* 🧠 FIC: Estado de carga mientras se consulta la pagina de historial (ES) */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* 🧠 FIC: Error state with manual retry action (EN) */}
        {/* 🧠 FIC: Estado de error con accion manual de reintento (ES) */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
            <button onClick={fetchHistory} className="ml-4 underline text-sm">Reintentar</button>
          </div>
        )}

        {/* 🧠 FIC: Paginated audit events table with trace status (EN) */}
        {/* 🧠 FIC: Tabla paginada de eventos con estado de trazabilidad (ES) */}
        {data && !loading && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Timestamp</th>
                  <th className="text-left px-4 py-3">Evento</th>
                  <th className="text-left px-4 py-3">Propuesta</th>
                  <th className="text-left px-4 py-3">Instrumento</th>
                  <th className="text-left px-4 py-3">Broker</th>
                  <th className="text-left px-4 py-3">Transición</th>
                  <th className="text-left px-4 py-3">Traza</th>
                  <th className="text-left px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500">
                      No se encontraron eventos con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => (
                    <tr key={item.eventId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">
                        {new Date(item.timestampUtc).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded ${ACTION_COLORS[item.actionType] || 'bg-gray-100'}`}>
                          {item.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {item.proposalId.slice(-8)}...
                      </td>
                      <td className="px-4 py-3 font-semibold">{item.instrument}</td>
                      <td className="px-4 py-3 text-gray-600">{item.broker || '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="text-gray-500">{item.previousState}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{item.newState}</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.traceComplete ? (
                          <span className="text-green-600 text-xs font-medium">✓ Completa</span>
                        ) : (
                          <span
                            className="text-red-600 text-xs font-medium cursor-help"
                            title={`Faltan: ${item.missingFields?.join(', ')}`}
                          >
                            ✗ Incompleta
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`/audit/operations/${item.proposalId}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Ver detalle
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 🧠 FIC: Pagination controls based on hasMore and page (EN) */}
            {/* 🧠 FIC: Controles de paginacion basados en hasMore y pagina (ES) */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Página {data.page} — {data.total} eventos
              </p>
              <div className="flex gap-2">
                <button
                  disabled={data.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Anterior
                </button>
                <button
                  disabled={!data.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditHistoryPage;
