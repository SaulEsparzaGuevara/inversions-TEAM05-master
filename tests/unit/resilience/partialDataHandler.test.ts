import { describe, it, expect } from 'vitest';
import { mergePartialWithDefaults } from '../../../src/lib/resilience/partialDataHandler.js';

describe('partialDataHandler', () => {
  it('merges partial data with defaults', () => {
    const defaults = { a: 1, b: 2, c: 3 };
    const partial = { b: 20 };
    const merged = mergePartialWithDefaults(partial, defaults);
    expect(merged).toEqual({ a: 1, b: 20, c: 3 });
  });
});
