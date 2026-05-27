import { describe, it, expect } from 'vitest';
import { isStale, handleStaleInput } from '../../../src/lib/resilience/staleInput.js';

describe('staleInput', () => {
  it('detects fresh input', () => {
    const now = Date.now();
    const res = isStale(now);
    expect(res.stale).toBe(false);
  });

  it('handles stale input callback', () => {
    const old = Date.now() - 1000 * 60 * 60 * 24 * 2; // 2 days
    let called = false;
    const res = handleStaleInput(old, { onStale: () => (called = true), thresholdMs: 1000 * 60 * 60 });
    expect(res.stale).toBe(true);
    expect(called).toBe(true);
  });
});
