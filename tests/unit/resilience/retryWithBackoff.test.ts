import { describe, it, expect } from 'vitest';
import { retryWithBackoff } from '../../../src/lib/resilience/retryWithBackoff.js';

describe('retryWithBackoff', () => {
  it('succeeds on first try', async () => {
    const result = await retryWithBackoff(async () => 'ok', { maxAttempts: 3, jitter: false });
    expect(result).toBe('ok');
  });

  it('retries and eventually fails', async () => {
    let calls = 0;
    await expect(
      retryWithBackoff(async () => {
        calls++;
        throw new Error('fail');
      }, { maxAttempts: 3, baseMs: 1, jitter: false })
    ).rejects.toThrow();
    expect(calls).toBeGreaterThanOrEqual(3);
  });
});
