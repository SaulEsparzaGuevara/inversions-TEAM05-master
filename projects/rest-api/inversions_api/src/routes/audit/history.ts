/**
 * T039: Audit History API Endpoint
 * =================================
 * Endpoint GET /audit/history para consultar historial de auditoria con paginacion
 * y metadata de completitud de traza.
 * 
 * Funcionalidad:
 * - Aceptar filtros por query params: proposalId, signalId, userId, correlationId,
 *   broker, instrument, actionTypes, fromDate, toDate
 * - Paginacion: page y pageSize (max 100)
 * - Retornar items con indicador traceComplete y missingFields
 * - Retornar traceCompletenessPercent en metadata
 * - Tiempo objetivo de respuesta: 98% < 3s (SC-003)
 * 
 * Mapeo: FR-011, SC-003
 * 
 * GET /audit/history?proposalId=xxx&page=1&pageSize=20
 * 
 * Response 200:
 * {
 *   "items": [...],
 *   "total": 100,
 *   "page": 1,
 *   "pageSize": 20,
 *   "hasMore": true,
 *   "queryLatencyMs": 45,
 *   "traceCompletenessPercent": 98
 * }
 */

import { Router, Request, Response } from 'express';
import { AuditHistoryService, AuditHistoryFilters, PaginationParams } from '../../modules/audit/historyService.js';
import { HistoryMetricsService } from '../../observability/historyMetrics.js';

export function createAuditHistoryRouter(historyService: AuditHistoryService): Router {
  const router = Router();
  const metrics = new HistoryMetricsService();

  /**
   * GET /audit/history
   * 
   * Query params:
   * - proposalId: string (optional)
   * - signalId: string (optional)
   * - userId: string (optional)
   * - correlationId: string (optional)
   * - broker: "IBKR" | "ALPACA" (optional)
   * - instrument: string (optional)
   * - actionTypes: comma-separated string (optional) e.g. "HUMAN_APPROVED,EXECUTION_FAILED"
   * - fromDate: ISO date string (optional)
   * - toDate: ISO date string (optional)
   * - page: number (default: 1)
   * - pageSize: number (default: 20, max: 100)
   */
  router.get('/history', async (req: Request, res: Response) => {
    try {
      const {
        proposalId,
        signalId,
        userId,
        correlationId,
        broker,
        instrument,
        actionTypes,
        fromDate,
        toDate,
        page,
        pageSize,
      } = req.query as Record<string, string>;

      // 🧠 FIC: Validate pagination inputs before querying history (EN)
      // 🧠 FIC: Validar parametros de paginacion antes de consultar historial (ES)
      const parsedPage = Math.max(1, parseInt(page || '1', 10));
      const parsedPageSize = Math.min(100, Math.max(1, parseInt(pageSize || '20', 10)));

      if (isNaN(parsedPage) || isNaN(parsedPageSize)) {
        return res.status(400).json({
          error: 'invalid_pagination',
          code: 'INVALID_PARAMS',
          details: { message: 'page and pageSize must be positive integers' },
        });
      }

      // 🧠 FIC: Validate and parse date range filters (EN)
      // 🧠 FIC: Validar y parsear filtros de rango de fechas (ES)
      let parsedFromDate: Date | undefined;
      let parsedToDate: Date | undefined;

      if (fromDate) {
        parsedFromDate = new Date(fromDate);
        if (isNaN(parsedFromDate.getTime())) {
          return res.status(400).json({
            error: 'invalid_date',
            code: 'INVALID_PARAMS',
            details: { field: 'fromDate', message: 'must be valid ISO date string' },
          });
        }
      }

      if (toDate) {
        parsedToDate = new Date(toDate);
        if (isNaN(parsedToDate.getTime())) {
          return res.status(400).json({
            error: 'invalid_date',
            code: 'INVALID_PARAMS',
            details: { field: 'toDate', message: 'must be valid ISO date string' },
          });
        }
      }

      // 🧠 FIC: Validate supported broker filter values (EN)
      // 🧠 FIC: Validar valores soportados del filtro broker (ES)
      if (broker && !['IBKR', 'ALPACA'].includes(broker)) {
        return res.status(400).json({
          error: 'invalid_broker',
          code: 'INVALID_PARAMS',
          details: { message: 'broker must be one of: IBKR, ALPACA' },
        });
      }

      // 🧠 FIC: Build normalized filters object for service layer (EN)
      // 🧠 FIC: Construir objeto de filtros normalizado para la capa de servicio (ES)
      const filters: AuditHistoryFilters = {
        proposalId: proposalId || undefined,
        signalId: signalId || undefined,
        userId: userId || undefined,
        correlationId: correlationId || undefined,
        broker: (broker as 'IBKR' | 'ALPACA') || undefined,
        instrument: instrument || undefined,
        actionTypes: actionTypes ? actionTypes.split(',').map((a) => a.trim()) : undefined,
        fromDate: parsedFromDate,
        toDate: parsedToDate,
      };

      const pagination: PaginationParams = {
        page: parsedPage,
        pageSize: parsedPageSize,
      };

      // 🧠 FIC: Execute filtered and paginated history query (EN)
      // 🧠 FIC: Ejecutar consulta de historial con filtros y paginacion (ES)
      const result = await historyService.queryHistory(filters, pagination);
      metrics.recordQueryLatency(result.queryLatencyMs);
      metrics.recordTraceCompleteness(result.traceCompletenessPercent);

      // 🧠 FIC: Serialize timestamp fields to ISO in API response (EN)
      // 🧠 FIC: Serializar campos de tiempo a ISO en la respuesta API (ES)
      res.status(200).json({
        items: result.items.map((item) => ({
          ...item,
          timestampUtc: item.timestampUtc instanceof Date
            ? item.timestampUtc.toISOString()
            : item.timestampUtc,
        })),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasMore: result.hasMore,
        queryLatencyMs: result.queryLatencyMs,
        traceCompletenessPercent: result.traceCompletenessPercent,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        error: 'internal_error',
        code: 'SERVER_ERROR',
        details: { message: errorMsg },
      });
    }
  });

  router.get('/history/metrics', (_req: Request, res: Response) => {
    const snapshot = metrics.getSnapshot();
    res.status(200).json({
      ...snapshot,
      capturedAt: snapshot.capturedAt.toISOString()
    });
  });

  /**
   * GET /audit/history/chain/:proposalId
   * 
   * Obtener cadena de eventos completa para una propuesta.
   */
  router.get('/history/chain/:proposalId', async (req: Request, res: Response) => {
    try {
      const { proposalId } = req.params;

      if (!proposalId || proposalId.trim() === '') {
        return res.status(400).json({
          error: 'missing_proposal_id',
          code: 'INVALID_PARAMS',
          details: { message: 'proposalId is required' },
        });
      }

      const chain = await historyService.getEventChain(proposalId);

      res.status(200).json({
        proposalId,
        events: chain.map((item) => ({
          ...item,
          timestampUtc: item.timestampUtc instanceof Date
            ? item.timestampUtc.toISOString()
            : item.timestampUtc,
        })),
        totalEvents: chain.length,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        error: 'internal_error',
        code: 'SERVER_ERROR',
        details: { message: errorMsg },
      });
    }
  });

  return router;
}
