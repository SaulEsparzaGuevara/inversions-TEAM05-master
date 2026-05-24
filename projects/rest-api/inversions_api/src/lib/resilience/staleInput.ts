export type StaleInputOptions = {
  thresholdMs?: number;
  onStale?: (meta: { ageMs: number }) => void;
};

export function isStale(timestampMs: number, opts: StaleInputOptions = {}) {
  const threshold = opts.thresholdMs ?? 1000 * 60 * 60 * 24; // default 1 day
  const age = Date.now() - timestampMs;
  return { stale: age > threshold, ageMs: age };
}

export function handleStaleInput(timestampMs: number, opts: StaleInputOptions = {}) {
  const check = isStale(timestampMs, opts);
  if (check.stale && typeof opts.onStale === 'function') {
    opts.onStale({ ageMs: check.ageMs });
  }
  return check;
}

export default { isStale, handleStaleInput };
