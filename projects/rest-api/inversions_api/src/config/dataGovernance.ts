export type DataStore = "supabase" | "mongodb";

export interface DataGovernanceRule {
  entity: string;
  store: DataStore;
  retentionDays: number;
  purpose: string;
}

export const dataGovernanceRules: DataGovernanceRule[] = [
  {
    entity: "auth_context",
    store: "supabase",
    retentionDays: 365,
    purpose: "identidad, sesion, rol y contexto MFA"
  },
  {
    entity: "signal_operational",
    store: "supabase",
    retentionDays: 365,
    purpose: "senales, propuestas, decisiones y estados"
  },
  {
    entity: "audit_event",
    store: "supabase",
    retentionDays: 365,
    purpose: "auditoria y trazabilidad operativa"
  },
  {
    entity: "analytics_history",
    store: "mongodb",
    retentionDays: 365,
    purpose: "historicos analiticos de alto volumen"
  }
];
