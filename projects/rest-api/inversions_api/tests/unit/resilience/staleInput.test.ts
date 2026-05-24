import { describe, expect, it, vi } from "vitest";
import { isStale, handleStaleInput } from "../../../src/lib/resilience/staleInput.js";

describe("isStale", () => {
  it("returns not stale for a recent timestamp", () => {
    const recent = Date.now() - 1000; // 1 second ago
    const result = isStale(recent);
    expect(result.stale).toBe(false);
    expect(result.ageMs).toBeGreaterThanOrEqual(1000);
  });

  it("returns stale for an old timestamp (older than default 1 day)", () => {
    const old = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    const result = isStale(old);
    expect(result.stale).toBe(true);
    expect(result.ageMs).toBeGreaterThan(24 * 60 * 60 * 1000);
  });

  it("uses custom threshold when provided", () => {
    const oneHour = 60 * 60 * 1000;
    const twoHoursAgo = Date.now() - 2 * oneHour;

    // With a 3-hour threshold, 2 hours is not stale
    const result = isStale(twoHoursAgo, { thresholdMs: 3 * oneHour });
    expect(result.stale).toBe(false);

    // With a 1-hour threshold, 2 hours is stale
    const result2 = isStale(twoHoursAgo, { thresholdMs: oneHour });
    expect(result2.stale).toBe(true);
  });

  it("handles future timestamps (not stale)", () => {
    const future = Date.now() + 3600000; // 1 hour in the future
    const result = isStale(future);
    expect(result.stale).toBe(false);
    expect(result.ageMs).toBeLessThan(0); // negative age
  });
});

describe("handleStaleInput", () => {
  it("calls onStale callback when input is stale", () => {
    const onStale = vi.fn();
    const old = Date.now() - 2 * 24 * 60 * 60 * 1000; // 2 days ago
    const result = handleStaleInput(old, { onStale });

    expect(result.stale).toBe(true);
    expect(onStale).toHaveBeenCalledOnce();
    expect(onStale).toHaveBeenCalledWith({ ageMs: result.ageMs });
  });

  it("does not call onStale callback when input is not stale", () => {
    const onStale = vi.fn();
    const recent = Date.now() - 1000; // 1 second ago
    const result = handleStaleInput(recent, { onStale });

    expect(result.stale).toBe(false);
    expect(onStale).not.toHaveBeenCalled();
  });

  it("returns stale check result without callback when not provided", () => {
    const old = Date.now() - 2 * 24 * 60 * 60 * 1000;
    const result = handleStaleInput(old);

    expect(result.stale).toBe(true);
    expect(result.ageMs).toBeGreaterThan(24 * 60 * 60 * 1000);
  });

  it("returns not stale without callback when not stale and no callback provided", () => {
    const recent = Date.now() - 1000;
    const result = handleStaleInput(recent);

    expect(result.stale).toBe(false);
  });
});
