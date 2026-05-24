import { MfaCoverageAuditService } from "./mfaCoverageAudit.js";

export interface MfaCoverageReport {
  generatedAtUtc: string;
  month: number;
  year: number;
  summary: {
    sc008Compliant: boolean;
    coveragePercent: number;
    missingEvidenceCount: number;
  };
  byRole: Array<{
    role: "trader" | "admin";
    totalActions: number;
    withValidMfa: number;
    coveragePercent: number;
  }>;
  byEndpoint: Array<{
    endpoint: string;
    totalActions: number;
    withValidMfa: number;
    coveragePercent: number;
  }>;
  recommendations: string[];
}

export class MfaCoverageReportService {
  constructor(private readonly auditService: MfaCoverageAuditService) {}

  buildMonthlyReport(year: number, month: number): MfaCoverageReport {
    const summary = this.auditService.getCoverageSummaryForMonth(year, month);

    const recommendations: string[] = [];
    if (summary.sc008Compliant) {
      recommendations.push("Cobertura MFA al 100% en acciones sensibles (SC-008 PASS).");
    } else {
      recommendations.push("Existe brecha de cobertura MFA; bloquear despliegue hasta corregir evidencia faltante.");
      recommendations.push("Verificar middleware de auth-context y mfa-guard en endpoints sensibles.");
    }

    for (const [endpoint, stats] of Object.entries(summary.byEndpoint)) {
      if (stats.coveragePercent < 100) {
        recommendations.push(`Endpoint ${endpoint} requiere hardening: cobertura ${stats.coveragePercent}%.`);
      }
    }

    return {
      generatedAtUtc: new Date().toISOString(),
      month,
      year,
      summary: {
        sc008Compliant: summary.sc008Compliant,
        coveragePercent: summary.coveragePercent,
        missingEvidenceCount: summary.missingEvidenceCount
      },
      byRole: [
        { role: "trader", ...summary.byRole.trader },
        { role: "admin", ...summary.byRole.admin }
      ],
      byEndpoint: Object.entries(summary.byEndpoint).map(([endpoint, stats]) => ({
        endpoint,
        ...stats
      })),
      recommendations
    };
  }
}
