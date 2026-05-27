export type UserRole = "viewer" | "trader" | "admin";

export interface MfaSensitiveActionEvent {
  userId: string;
  role: UserRole;
  endpoint: string;
  actionType: "approve" | "execute" | "retry-execution";
  timestampUtc: string;
  mfaRequired: boolean;
  mfaVerified: boolean;
  mfaContextId?: string;
}

export interface MfaCoverageSummary {
  totalSensitiveActions: number;
  actionsRequiringMfa: number;
  actionsWithValidMfa: number;
  coveragePercent: number;
  sc008Compliant: boolean;
  missingEvidenceCount: number;
  byRole: Record<"trader" | "admin", {
    totalActions: number;
    withValidMfa: number;
    coveragePercent: number;
  }>;
  byEndpoint: Record<string, {
    totalActions: number;
    withValidMfa: number;
    coveragePercent: number;
  }>;
}

const MAX_EVENTS = 30000;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function isSensitiveEndpoint(endpoint: string): boolean {
  return ["/execution/approve", "/execution/execute", "/execution/retry"].includes(endpoint);
}

export class MfaCoverageAuditService {
  private events: MfaSensitiveActionEvent[] = [];

  recordEvent(event: MfaSensitiveActionEvent): void {
    if (!isSensitiveEndpoint(event.endpoint)) {
      return;
    }

    this.events.push(event);
    if (this.events.length > MAX_EVENTS) {
      this.events.shift();
    }
  }

  getCoverageSummaryForMonth(year: number, month: number): MfaCoverageSummary {
    const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
    const filtered = this.events.filter((item) => item.timestampUtc.startsWith(monthPrefix));

    const totalSensitiveActions = filtered.length;
    const requiringMfa = filtered.filter((item) => item.role === "trader" || item.role === "admin");
    const actionsRequiringMfa = requiringMfa.length;

    const actionsWithValidMfa = requiringMfa.filter(
      (item) => item.mfaRequired && item.mfaVerified && Boolean(item.mfaContextId)
    ).length;

    const missingEvidenceCount = Math.max(0, actionsRequiringMfa - actionsWithValidMfa);
    const coveragePercent =
      actionsRequiringMfa === 0 ? 100 : round2((actionsWithValidMfa / actionsRequiringMfa) * 100);

    const roleStats: MfaCoverageSummary["byRole"] = {
      trader: { totalActions: 0, withValidMfa: 0, coveragePercent: 100 },
      admin: { totalActions: 0, withValidMfa: 0, coveragePercent: 100 }
    };

    for (const role of ["trader", "admin"] as const) {
      const scoped = requiringMfa.filter((item) => item.role === role);
      const withValid = scoped.filter(
        (item) => item.mfaRequired && item.mfaVerified && Boolean(item.mfaContextId)
      );
      roleStats[role] = {
        totalActions: scoped.length,
        withValidMfa: withValid.length,
        coveragePercent: scoped.length === 0 ? 100 : round2((withValid.length / scoped.length) * 100)
      };
    }

    const byEndpoint: MfaCoverageSummary["byEndpoint"] = {};
    for (const endpoint of ["/execution/approve", "/execution/execute", "/execution/retry"]) {
      const scoped = requiringMfa.filter((item) => item.endpoint === endpoint);
      const withValid = scoped.filter(
        (item) => item.mfaRequired && item.mfaVerified && Boolean(item.mfaContextId)
      );
      byEndpoint[endpoint] = {
        totalActions: scoped.length,
        withValidMfa: withValid.length,
        coveragePercent: scoped.length === 0 ? 100 : round2((withValid.length / scoped.length) * 100)
      };
    }

    return {
      totalSensitiveActions,
      actionsRequiringMfa,
      actionsWithValidMfa,
      coveragePercent,
      sc008Compliant: coveragePercent === 100,
      missingEvidenceCount,
      byRole: roleStats,
      byEndpoint
    };
  }
}
