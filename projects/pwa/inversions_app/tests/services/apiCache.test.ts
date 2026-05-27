/**
 * ============================================================================
 * apiCache.test.ts
 * ============================================================================
 *
 * FIC: Unit tests for the in-memory API cache (getCached, setCache,
 * clearCache, invalidateCache, invalidateCacheByPrefix, buildCacheKey).
 *
 * IMPORTANT: We advance timers manually so TTL expiry tests work without
 * waiting real wall-clock time.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCacheKey,
  clearCache,
  getCached,
  invalidateCache,
  invalidateCacheByPrefix,
  setCache
} from "../../src/services/apiCache";

describe("apiCache", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
    clearCache();
  });

  // ── Basic set / get ─────────────────────────────────────

  it("returns undefined for a missing key", () => {
    expect(getCached("nonexistent")).toBeUndefined();
  });

  it("returns stored value after setCache", () => {
    setCache("foo", { hello: "world" });
    expect(getCached("foo")).toEqual({ hello: "world" });
  });

  it("returns the correct type shape", () => {
    const payload = { results: [], generatedAt: "2026-01-01T00:00:00Z" };
    setCache("analyze::SPY", payload);
    const cached = getCached<typeof payload>("analyze::SPY");
    expect(cached).toBeDefined();
    expect(cached!.results).toEqual([]);
    expect(cached!.generatedAt).toBe("2026-01-01T00:00:00Z");
  });

  // ── TTL expiry ──────────────────────────────────────────

  it("returns value within TTL", () => {
    setCache("short", { x: 1 }, 10_000); // 10 s TTL
    vi.advanceTimersByTime(5_000);       // 5 s elapsed
    expect(getCached("short")).toEqual({ x: 1 });
  });

  it("returns undefined after TTL expires", () => {
    setCache("short", { x: 1 }, 10_000);
    vi.advanceTimersByTime(10_001);      // just past TTL
    expect(getCached("short")).toBeUndefined();
  });

  it("uses default 5-minute TTL", () => {
    const fiveMin = 5 * 60 * 1_000;
    setCache("default", { ok: true });
    vi.advanceTimersByTime(fiveMin - 1);
    expect(getCached("default")).toEqual({ ok: true });

    vi.advanceTimersByTime(2);            // past TTL
    expect(getCached("default")).toBeUndefined();
  });

  it("removes expired entry from store", () => {
    setCache("expire", 123, 5_000);
    vi.advanceTimersByTime(5_001);
    getCached("expire");                  // triggers deletion
    // second call confirms it's gone
    expect(getCached("expire")).toBeUndefined();
  });

  // ── clearCache ──────────────────────────────────────────

  it("clearCache removes all entries", () => {
    setCache("a", 1);
    setCache("b", 2);
    clearCache();
    expect(getCached("a")).toBeUndefined();
    expect(getCached("b")).toBeUndefined();
  });

  // ── invalidateCache ─────────────────────────────────────

  it("invalidateCache removes a single entry", () => {
    setCache("keep", 1);
    setCache("remove", 2);
    invalidateCache("remove");
    expect(getCached("keep")).toBe(1);
    expect(getCached("remove")).toBeUndefined();
  });

  it("invalidateCache does nothing for missing key", () => {
    setCache("a", 1);
    invalidateCache("nonexistent");
    expect(getCached("a")).toBe(1);
  });

  // ── invalidateCacheByPrefix ─────────────────────────────

  it("invalidateCacheByPrefix removes matching entries", () => {
    setCache("/api/coverage/analyze::SPY", { a: 1 });
    setCache("/api/coverage/compare::SPY", { b: 2 });
    setCache("/api/institutional/analysis::AAPL", { c: 3 });

    invalidateCacheByPrefix("/api/coverage");

    expect(getCached("/api/coverage/analyze::SPY")).toBeUndefined();
    expect(getCached("/api/coverage/compare::SPY")).toBeUndefined();
    expect(getCached("/api/institutional/analysis::AAPL")).toEqual({ c: 3 });
  });

  it("invalidateCacheByPrefix with no match does nothing", () => {
    setCache("x", 1);
    invalidateCacheByPrefix("z");
    expect(getCached("x")).toBe(1);
  });

  // ── buildCacheKey ───────────────────────────────────────

  it("buildCacheKey returns URL unchanged when no body", () => {
    expect(buildCacheKey("/api/test")).toBe("/api/test");
  });

  it("buildCacheKey appends JSON-stringified body", () => {
    const key = buildCacheKey("/api/coverage/analyze", {
      ticker: "SPY",
      currentPrice: 450
    });
    expect(key).toContain("/api/coverage/analyze::");
    expect(key).toContain('"ticker":"SPY"');
    expect(key).toContain('"currentPrice":450');
  });

  it("buildCacheKey produces the same key for identical objects", () => {
    const obj = { x: 1, y: 2 };
    const a = buildCacheKey("/url", obj);
    const b = buildCacheKey("/url", { ...obj }); // same properties, same order
    expect(a).toBe(b);
  });

  it("buildCacheKey differs when object shape differs", () => {
    const a = buildCacheKey("/url", { x: 1 });
    const b = buildCacheKey("/url", { x: 2 });
    expect(a).not.toBe(b);
  });
});
