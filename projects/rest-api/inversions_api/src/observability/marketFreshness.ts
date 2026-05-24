interface FreshnessSample {
  instrument: string;
  provider: string;
  freshnessMs: number;
  timestampUtc: string;
}

const samples: FreshnessSample[] = [];

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

export function recordFreshnessSample(sample: FreshnessSample): void {
  samples.push(sample);
  if (samples.length > 5000) {
    samples.shift();
  }
}

export function summarizeFreshness(): { p50: number; p95: number; p99: number; sampleCount: number } {
  const values = samples.map((item) => item.freshnessMs);
  return {
    p50: percentile(values, 0.5),
    p95: percentile(values, 0.95),
    p99: percentile(values, 0.99),
    sampleCount: values.length
  };
}
