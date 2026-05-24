import { supabaseClient } from "../database/supabase/client.js";

export interface PurgeEvidenceJobResult {
  cutoffDate: string;
  institutionalContextsPurged: number;
  evidenceBlobsPurged: number;
  explanationResponsesPurged: number;
  totalPurged: number;
}

export interface PurgeEvidenceJobOptions {
  retentionDays?: number;
  logger?: Pick<Console, "log" | "warn" | "error">;
  now?: Date;
}

async function purgeTable(tableName: string, cutoffDate: string, logger: Pick<Console, "log" | "warn" | "error">): Promise<number> {
  const { count, error } = await supabaseClient
    .from(tableName)
    .delete({ count: "exact" })
    .lt("createdAt", cutoffDate);

  if (error) {
    logger.error(`[purgeEvidenceJob] Failed to purge ${tableName}:`, error.message);
    throw error;
  }

  return count ?? 0;
}

export async function purgeEvidenceJob(options: PurgeEvidenceJobOptions = {}): Promise<PurgeEvidenceJobResult> {
  const logger = options.logger ?? console;
  const retentionDays = options.retentionDays ?? 365;
  const now = options.now ?? new Date();
  const cutoffDate = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

  const institutionalContextsPurged = await purgeTable("institutional_contexts", cutoffDate, logger);
  const evidenceBlobsPurged = await purgeTable("evidence_blobs", cutoffDate, logger);
  const explanationResponsesPurged = await purgeTable("explanation_responses", cutoffDate, logger);

  const totalPurged = institutionalContextsPurged + evidenceBlobsPurged + explanationResponsesPurged;

  logger.log(
    `[purgeEvidenceJob] Purged ${totalPurged} record(s) older than ${cutoffDate}: ` +
      `institutional_contexts=${institutionalContextsPurged}, ` +
      `evidence_blobs=${evidenceBlobsPurged}, ` +
      `explanation_responses=${explanationResponsesPurged}`
  );

  return {
    cutoffDate,
    institutionalContextsPurged,
    evidenceBlobsPurged,
    explanationResponsesPurged,
    totalPurged
  };
}

export default purgeEvidenceJob;
