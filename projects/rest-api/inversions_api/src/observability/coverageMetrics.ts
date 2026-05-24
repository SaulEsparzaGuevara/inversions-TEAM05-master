/**
 * ============================================================================
 * coverageMetrics.ts
 * ============================================================================
 *
 * FIC: T203: Coverage Metrics — telemetry for coverage module: trackAnalysis, trackComparison, getMetrics.
 */

type Tags = { flow?: string; endpoint?: string; region?: string };

const METRICS = {
  latency: 'coverage.response.latency_ms',
  p95: 'coverage.response.p95_ms',
  aiUnavailable: 'coverage.ai.unavailable.count',
  pollingAttempts: 'coverage.polling.attempts',
} as const;

function formatTags(tags?: Tags) {
  if (!tags) return '';
  return Object.entries(tags)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ');
}

export function recordLatency(point: 'request_received' | 'pre_ai_invoke' | 'post_ai_invoke' | 'strategy_ready' | 'response_sent', ms: number, tags?: Tags) {
  // Stub: log for FIC to replace with Prometheus/StatsD calls
  console.log(`${METRICS.latency} ${ms}ms point=${point} ${formatTags(tags)}`);
}

export function recordP95(ms: number, tags?: Tags) {
  console.log(`${METRICS.p95} ${ms}ms ${formatTags(tags)}`);
}

export function incrementUnavailableCount(reason?: string, tags?: Tags) {
  console.log(`${METRICS.aiUnavailable} +1 reason=${reason ?? 'unknown'} ${formatTags(tags)}`);
}

export function incrementPollingAttempts(count = 1, tags?: Tags) {
  console.log(`${METRICS.pollingAttempts} +${count} ${formatTags(tags)}`);
}

export default {
  recordLatency,
  recordP95,
  incrementUnavailableCount,
  incrementPollingAttempts,
};
