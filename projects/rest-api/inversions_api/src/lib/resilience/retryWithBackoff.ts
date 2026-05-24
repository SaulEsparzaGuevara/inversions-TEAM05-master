export type RetryOptions = {
  maxAttempts?: number;
  baseMs?: number;
  maxMs?: number;
  jitter?: boolean;
};

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 5;
  const baseMs = opts.baseMs ?? 100;
  const maxMs = opts.maxMs ?? 10000;
  const jitter = opts.jitter ?? true;

  let attempt = 0;
  let lastErr: any;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      attempt++;
      if (attempt >= maxAttempts) break;
      const exp = Math.min(baseMs * 2 ** (attempt - 1), maxMs);
      const wait = jitter ? Math.floor(exp / 2 + Math.random() * (exp / 2)) : exp;
      // eslint-disable-next-line no-console
      console.warn(`retry attempt ${attempt}, waiting ${wait}ms`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

export default retryWithBackoff;
