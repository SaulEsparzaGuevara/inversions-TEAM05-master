/**
 * T031: Approval Endpoint with Disclaimer and MFA
 * ================================================
 * Endpoint POST /execution/approve para registrar aprobacion de propuesta operativa.
 * 
 * Funcionalidad:
 * - Recibir solicitud de aprobacion con proposalId y MFA context
 * - Validar que MFA sea valido (siempre para trader/admin)
 * - Capturar acknowledge de disclaimer de no-asesoria
 * - Emitir evento HUMAN_APPROVED a auditoria
 * - Retornar confirmacion de transicion a APPROVED
 * 
 * Mapeo: FR-004, FR-013, FR-019, PL-006, PL-012
 * 
 * @note Reqiere authContext y rbac middlware previos en stack
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApprovalService, ApprovalRequest, MFAContext } from '../../modules/execution/approvalService.js';
import { ExecutionAuditService } from '../../modules/execution/executionAudit.js';

/**
 * Tipos para request/response del endpoint
 */
export interface ApproveRequestPayload {
  proposalId: string;
  proposalVersion?: number;
  disclaimerAcknowledged: boolean;
  disclaimerText: string;
  mfaContext?: {
    method: 'totp' | 'sms' | 'hardware_key';
    verificationToken: string;
  };
}

export interface ApproveResponse {
  success: boolean;
  approvalId: string;
  proposalId: string;
  transitionedTo: 'APPROVED' | 'REJECTED' | null;
  timestamp: string;
  mfaValidated: boolean;
  disclaimerRecordId: string;
  message?: string;
}

export interface ApproveErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

/**
 * Crear router para endpoint de aprobacion
 */
export function createApprovalRouter(approvalService: ApprovalService): Router {
  const router = Router();
  const auditService = new ExecutionAuditService();

  /**
   * POST /execution/approve
   * 
   * Request body:
   * {
   *   "proposalId": "prop_xxxxx",
   *   "disclaimerAcknowledged": true,
   *   "disclaimerText": "[contenido del disclaimer que vio el usuario]",
   *   "mfaContext": {
   *     "method": "totp",
   *     "verificationToken": "xxxxxx"
   *   }
   * }
   * 
   * Response 200:
   * {
   *   "success": true,
   *   "approvalId": "appr_xxxxx",
   *   "proposalId": "prop_xxxxx",
   *   "transitionedTo": "APPROVED",
   *   "timestamp": "2026-05-01T...",
   *   "mfaValidated": true,
   *   "disclaimerRecordId": "disc_xxxxx"
   * }
   * 
   * Response 400 (disclaimer no reconocido):
   * {
   *   "error": "disclaimer_not_acknowledged",
   *   "code": "DISCLAIMER_REQUIRED",
   *   "details": { ... }
   * }
   * 
   * Response 401 (MFA invalido):
   * {
   *   "error": "mfa_required",
   *   "code": "MFA_REQUIRED",
   *   "details": { "role": "trader" }
   * }
   * 
   * Response 403 (insuficiente permiso):
   * {
   *   "error": "insufficient_permission",
   *   "code": "FORBIDDEN_ROLE",
   *   "details": { "required_role": "trader", "actual_role": "viewer" }
   * }
   * 
   * Response 409 (propuesta no esta PENDING_APPROVAL):
   * {
   *   "error": "invalid_proposal_state",
   *   "code": "PROPOSAL_STATE_ERROR",
   *   "details": { "current_state": "REJECTED", "expected": "PENDING_APPROVAL" }
   * }
   */
  router.post('/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as ApproveRequestPayload;

      // ===== VALIDACION 1: Disclaimer =====
      if (!payload.disclaimerAcknowledged) {
        return res.status(400).json({
          error: 'disclaimer_not_acknowledged',
          code: 'DISCLAIMER_REQUIRED',
          details: {
            message: 'User must acknowledge disclaimer before approval',
          },
        } as ApproveErrorResponse);
      }

      if (!payload.disclaimerText || payload.disclaimerText.trim().length === 0) {
        return res.status(400).json({
          error: 'disclaimer_text_required',
          code: 'DISCLAIMER_REQUIRED',
          details: {
            message: 'disclaimerText must be provided and non-empty',
          },
        } as ApproveErrorResponse);
      }

      // ===== VALIDACION 2: Permiso minimo (trader o admin) =====
      // FIC: Leer user context desde authContext middleware
      const userRole = (req as any).authContext?.role || 'viewer';
      const userId = (req as any).authContext?.userId || 'unknown';

      if (userRole === 'viewer') {
        return res.status(403).json({
          error: 'insufficient_permission',
          code: 'FORBIDDEN_ROLE',
          details: {
            required_role: 'trader',
            actual_role: userRole,
          },
        } as ApproveErrorResponse);
      }

      // ===== VALIDACION 3: MFA =====
      let mfaContext: MFAContext | undefined;
      if (payload.mfaContext) {
        mfaContext = {
          mfaContextId: `mfa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          timestamp: new Date(),
          method: payload.mfaContext.method,
          verificationToken: payload.mfaContext.verificationToken,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
        };
      }

      // ===== INVOCAR SERVICIO =====
      const approvalRequest: ApprovalRequest = {
        proposalId: payload.proposalId,
        userId,
        role: userRole as 'viewer' | 'trader' | 'admin',
        action: 'approve',
        expectedVersion: payload.proposalVersion,
        rationale: `User approved via UI. Disclaimer acknowledged.`,
        mfaContext,
      };

      const result = await approvalService.approve(approvalRequest);

      // ===== REGISTRAR DISCLAIMER EN AUDITORIA =====
      // FIC: Implementacion futura: emitir evento DISCLAIMER_ACKNOWLEDGED
      // con campos: user_id, proposal_id, disclaimer_hash, acknowledged_at

      const disclaimerRecordId = `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // ===== RESPUESTA EXITOSA =====
      res.status(200).json({
        success: true,
        approvalId: result.approvalId,
        proposalId: result.proposalId,
        transitionedTo: result.transitionedTo,
        timestamp: result.timestamp.toISOString(),
        mfaValidated: result.mfaValidated,
        version: result.newVersion,
        disclaimerRecordId,
      } as ApproveResponse);
    } catch (error) {
      // ===== MANEJO DE ERRORES =====
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (errorMsg.includes('MFA_REQUIRED')) {
        return res.status(401).json({
          error: 'mfa_required',
          code: 'MFA_REQUIRED',
          details: {
            message: 'MFA is required for trader/admin approval',
            role: (req as any).authContext?.role,
          },
        } as ApproveErrorResponse);
      }

      if (errorMsg.includes('MFA_EXPIRED')) {
        return res.status(401).json({
          error: 'mfa_expired',
          code: 'MFA_EXPIRED',
          details: {
            message: 'MFA context has expired',
          },
        } as ApproveErrorResponse);
      }

      if (errorMsg.includes('INVALID_STATE')) {
        return res.status(409).json({
          error: 'invalid_proposal_state',
          code: 'PROPOSAL_STATE_ERROR',
          details: {
            message: 'Proposal is not in PENDING_APPROVAL state',
          },
        } as ApproveErrorResponse);
      }

      if (errorMsg.includes('FORBIDDEN_ROLE')) {
        return res.status(403).json({
          error: 'operational_restriction',
          code: 'OPERATIONAL_RESTRICTION',
          details: {
            message: 'Only trader/admin roles can approve or reject operational decisions.'
          }
        } as ApproveErrorResponse);
      }

      if (errorMsg.includes('DECISION_VERSION_CONFLICT:')) {
        const [, clientVersionRaw, serverVersionRaw] = errorMsg.split(':');
        const clientVersion = Number(clientVersionRaw);
        const serverVersion = Number(serverVersionRaw);

        await auditService.emitDecisionConflict(
          req.body.proposalId,
          'signal-unknown',
          (req as any).authContext?.userId || 'unknown',
          'UNKNOWN',
          'BUY',
          0,
          clientVersion,
          serverVersion
        );

        return res.status(409).json({
          error: 'decision_version_conflict',
          code: 'DECISION_VERSION_CONFLICT',
          details: {
            clientVersion,
            serverVersion,
            message: 'Proposal changed while deciding. Refresh and retry approval.'
          }
        } as ApproveErrorResponse);
      }

      // Error generico
      res.status(500).json({
        error: 'internal_error',
        code: 'SERVER_ERROR',
        details: {
          message: errorMsg,
        },
      } as ApproveErrorResponse);
    }
  });

  return router;
}
