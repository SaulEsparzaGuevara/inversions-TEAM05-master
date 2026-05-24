export type DependencyName = "IBKR" | "ALPACA" | "MARKET_DATA" | "CLAUDE";

export interface AvailabilitySample {
  dependency: DependencyName;
  success: boolean;
  latencyMs: number;
  timestampUtc: string;
  statusCode?: number;
  errorCode?: string;
}

export interface DependencySloTarget {
  dependency: DependencyName;
  monthlyAvailabilityTargetPercent: number;
}

export interface LatencySummary {
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export interface DependencyAvailabilitySummary {
  dependency: DependencyName;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  availabilityPercent: number;
  targetPercent: number;
  sloCompliant: boolean;
  errorBudgetPercent: number;
  errorBudgetConsumedPercent: number;
  errorBudgetRemainingPercent: number;
  latency: LatencySummary;
  topErrorCodes: Array<{ errorCode: string; count: number }>;
}

export interface AvailabilityDashboard {
  month: number;
  year: number;
  generatedAtUtc: string;
  overallAvailabilityPercent: number;
  dependencies: DependencyAvailabilitySummary[];
  evidenceBoard: {
    sc005Compliant: boolean;
    monthlyTargetPercent: number;
    totalSamples: number;
    failedSamples: number;
    notes: string[];
  };
}

export interface OperationalMetricsSample {
  decision_latency_ms: number;
  decision_conflict_count: number;
  broker_sync_lag_ms: number;
  capturedAtUtc: string;
}

export interface OperationalMetricsSnapshot {
  latest: OperationalMetricsSample | null;
  updatedWithinSla: boolean;
  maxCycleSeconds: number;
}

const MONTHLY_TARGET_DEFAULT = 99.5;
const MAX_SAMPLES = 30000;

const DEFAULT_TARGETS: DependencySloTarget[] = [
  { dependency: "IBKR", monthlyAvailabilityTargetPercent: 99.5 },
  { dependency: "ALPACA", monthlyAvailabilityTargetPercent: 99.5 },
  { dependency: "MARKET_DATA", monthlyAvailabilityTargetPercent: 99.0 },
  { dependency: "CLAUDE", monthlyAvailabilityTargetPercent: 99.0 }
];

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * percentileValue));
  return sorted[index];
}

function toMonthKeyFromDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}`;
}

function toMonthKeyFromIso(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "invalid";
  }
  return toMonthKeyFromDate(date);
}

export class AvailabilitySloService {
  private readonly samples: AvailabilitySample[] = [];
  private readonly targetsMap: Record<DependencyName, number>;

  constructor(targets: DependencySloTarget[] = DEFAULT_TARGETS) {
    this.targetsMap = {
      IBKR: targets.find((item) => item.dependency === "IBKR")?.monthlyAvailabilityTargetPercent ?? 99.5,
      ALPACA: targets.find((item) => item.dependency === "ALPACA")?.monthlyAvailabilityTargetPercent ?? 99.5,
      MARKET_DATA: targets.find((item) => item.dependency === "MARKET_DATA")?.monthlyAvailabilityTargetPercent ?? 99.0,
      CLAUDE: targets.find((item) => item.dependency === "CLAUDE")?.monthlyAvailabilityTargetPercent ?? 99.0
    };
  }

  recordSample(sample: AvailabilitySample): void {
    if (sample.latencyMs < 0) {
      return;
    }

    this.samples.push(sample);

    // 🧠 FIC: Keep a bounded in-memory sample window for monthly aggregation (EN)
    // 🧠 FIC: Mantener una ventana acotada de muestras en memoria para agregacion mensual (ES)
    if (this.samples.length > MAX_SAMPLES) {
      this.samples.shift();
    }
  }

  getDashboardForMonth(year: number, month: number): AvailabilityDashboard {
    const monthKey = `${year}-${pad2(month)}`;
    const monthlySamples = this.samples.filter((item) => toMonthKeyFromIso(item.timestampUtc) === monthKey);

    const dependencyList: DependencyName[] = ["IBKR", "ALPACA", "MARKET_DATA", "CLAUDE"];

    const dependencies: DependencyAvailabilitySummary[] = dependencyList.map(
      (dependency) => this.computeDependencySummary(dependency, monthlySamples)
    );

    const totalSamples = monthlySamples.length;
    const failedSamples = monthlySamples.filter((item) => !item.success).length;
    const overallAvailabilityPercent =
      totalSamples === 0 ? 100 : Math.round(((totalSamples - failedSamples) / totalSamples) * 10000) / 100;

    const sc005Compliant = overallAvailabilityPercent >= MONTHLY_TARGET_DEFAULT;

    return {
      month,
      year,
      generatedAtUtc: new Date().toISOString(),
      overallAvailabilityPercent,
      dependencies,
      evidenceBoard: {
        sc005Compliant,
        monthlyTargetPercent: MONTHLY_TARGET_DEFAULT,
        totalSamples,
        failedSamples,
        notes: [
          "SC-005 exige disponibilidad mensual >= 99.5% en dependencias operativas.",
          "PL-011 exige evidencias de observabilidad medibles y auditables por periodo."
        ]
      }
    };
  }

  getDashboardForCurrentMonth(referenceDate: Date = new Date()): AvailabilityDashboard {
    return this.getDashboardForMonth(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1);
  }

  private computeDependencySummary(
    dependency: DependencyName,
    monthlySamples: AvailabilitySample[]
  ): DependencyAvailabilitySummary {
    const samples = monthlySamples.filter((item) => item.dependency === dependency);
    const totalRequests = samples.length;
    const successfulRequests = samples.filter((item) => item.success).length;
    const failedRequests = totalRequests - successfulRequests;

    const availabilityPercent =
      totalRequests === 0 ? 100 : Math.round((successfulRequests / totalRequests) * 10000) / 100;

    const targetPercent = this.targetsMap[dependency];
    const sloCompliant = availabilityPercent >= targetPercent;

    const errorBudgetPercent = Math.max(0, 100 - targetPercent);
    const errorBudgetConsumedPercent = Math.max(0, 100 - availabilityPercent);
    const errorBudgetRemainingPercent = Math.max(0, errorBudgetPercent - errorBudgetConsumedPercent);

    const latencyValues = samples.filter((item) => item.success).map((item) => item.latencyMs);

    const errorCounter: Record<string, number> = {};
    for (const sample of samples) {
      if (sample.success) {
        continue;
      }
      const key = sample.errorCode || "UNKNOWN_ERROR";
      errorCounter[key] = (errorCounter[key] || 0) + 1;
    }

    const topErrorCodes = Object.entries(errorCounter)
      .map(([errorCode, count]) => ({ errorCode, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      dependency,
      totalRequests,
      successfulRequests,
      failedRequests,
      availabilityPercent,
      targetPercent,
      sloCompliant,
      errorBudgetPercent,
      errorBudgetConsumedPercent,
      errorBudgetRemainingPercent,
      latency: {
        p50Ms: percentile(latencyValues, 0.5),
        p95Ms: percentile(latencyValues, 0.95),
        p99Ms: percentile(latencyValues, 0.99)
      },
      topErrorCodes
    };
  }
}

/**
 * FIC: Operational metrics service for SC-005 dashboard cadence checks.
 * Tracks required metrics and verifies updates are refreshed within a target cycle (<= 60s).
 *
 * FIC: Servicio de métricas operativas para validaciones de cadencia SC-005.
 * Registra métricas requeridas y verifica que se actualicen dentro del ciclo objetivo (<= 60s).
 */
export class OperationalMetricsService {
  private latestSample: OperationalMetricsSample | null = null;

  record(sample: Omit<OperationalMetricsSample, "capturedAtUtc"> & { capturedAtUtc?: string }): OperationalMetricsSample {
    const normalized: OperationalMetricsSample = {
      decision_latency_ms: Math.max(0, sample.decision_latency_ms),
      decision_conflict_count: Math.max(0, sample.decision_conflict_count),
      broker_sync_lag_ms: Math.max(0, sample.broker_sync_lag_ms),
      capturedAtUtc: sample.capturedAtUtc ?? new Date().toISOString()
    };

    this.latestSample = normalized;
    return normalized;
  }

  getSnapshot(maxCycleSeconds: number = 60, now: Date = new Date()): OperationalMetricsSnapshot {
    if (!this.latestSample) {
      return {
        latest: null,
        updatedWithinSla: false,
        maxCycleSeconds
      };
    }

    const lastTs = new Date(this.latestSample.capturedAtUtc).getTime();
    const fresh = !Number.isNaN(lastTs) && now.getTime() - lastTs <= maxCycleSeconds * 1000;

    return {
      latest: this.latestSample,
      updatedWithinSla: fresh,
      maxCycleSeconds
    };
  }
}
