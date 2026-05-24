import { promises as fs } from "node:fs";
import path from "node:path";
import {
  AvailabilityDashboard,
  AvailabilitySloService
} from "../observability/availabilitySlo.js";

export interface MonthlyAvailabilityReportResult {
  reportPath: string;
  month: number;
  year: number;
  overallAvailabilityPercent: number;
  sc005Compliant: boolean;
}

export interface MonthlyAvailabilityReportOptions {
  outputDir?: string;
  format?: "json" | "md";
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function renderMarkdown(report: AvailabilityDashboard): string {
  const lines: string[] = [];

  lines.push("# Monthly Availability Report");
  lines.push("");
  lines.push(`- Period: ${report.year}-${pad2(report.month)}`);
  lines.push(`- Generated At (UTC): ${report.generatedAtUtc}`);
  lines.push(`- Overall Availability: ${report.overallAvailabilityPercent}%`);
  lines.push(`- SC-005 Compliant: ${report.evidenceBoard.sc005Compliant ? "YES" : "NO"}`);
  lines.push("");

  lines.push("## Dependency Summary");
  lines.push("");
  lines.push("| Dependency | Availability % | Target % | SLO | Requests | Failures | P95 ms | Top Errors |");
  lines.push("|---|---:|---:|---|---:|---:|---:|---|");

  for (const item of report.dependencies) {
    const topErrors = item.topErrorCodes.length
      ? item.topErrorCodes.map((entry) => `${entry.errorCode}:${entry.count}`).join(", ")
      : "-";

    lines.push(
      `| ${item.dependency} | ${item.availabilityPercent} | ${item.targetPercent} | ${item.sloCompliant ? "PASS" : "FAIL"} | ${item.totalRequests} | ${item.failedRequests} | ${item.latency.p95Ms} | ${topErrors} |`
    );
  }

  lines.push("");
  lines.push("## Evidence Board");
  lines.push("");
  lines.push(`- Monthly Target: ${report.evidenceBoard.monthlyTargetPercent}%`);
  lines.push(`- Total Samples: ${report.evidenceBoard.totalSamples}`);
  lines.push(`- Failed Samples: ${report.evidenceBoard.failedSamples}`);
  for (const note of report.evidenceBoard.notes) {
    lines.push(`- ${note}`);
  }

  return lines.join("\n");
}

export class MonthlyAvailabilityReportJob {
  constructor(private readonly availabilitySloService: AvailabilitySloService) {}

  async run(
    year: number,
    month: number,
    options: MonthlyAvailabilityReportOptions = {}
  ): Promise<MonthlyAvailabilityReportResult> {
    const format = options.format ?? "json";
    const outputDir = options.outputDir ?? path.join(process.cwd(), "backend", "reports", "availability");

    const report = this.availabilitySloService.getDashboardForMonth(year, month);

    await fs.mkdir(outputDir, { recursive: true });

    const fileBaseName = `availability-${year}-${pad2(month)}`;
    const extension = format === "md" ? "md" : "json";
    const reportPath = path.join(outputDir, `${fileBaseName}.${extension}`);

    // 🧠 FIC: Persist monthly SLO evidence for audit and operational reviews (EN)
    // 🧠 FIC: Persistir evidencia mensual de SLO para auditoria y revisiones operativas (ES)
    if (format === "md") {
      await fs.writeFile(reportPath, renderMarkdown(report), "utf8");
    } else {
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");
    }

    return {
      reportPath,
      month,
      year,
      overallAvailabilityPercent: report.overallAvailabilityPercent,
      sc005Compliant: report.evidenceBoard.sc005Compliant
    };
  }
}
