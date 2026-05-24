import { describe, expect, it } from "vitest";
import { retryWithBackoff } from "../../../src/lib/resilience/retryWithBackoff.js";

describe("retryWithBackoff", () => {
  it("resolves successfully on first attempt", async () => {
    const result = await retryWithBackoff(async () => "ok");
    expect(result).toBe("ok");
  });

  it("retries on failure and eventually succeeds", async () => {
    let attempt = 0;
    const result = await retryWithBackoff(
      async () => {
        attempt++;
        if (attempt < 3) throw new Error(`fail ${attempt}`);
        return "recovered";
      },
      { maxAttempts: 5, baseMs: 10, jitter: false }
    );
    expect(result).toBe("recovered");
    expect(attempt).toBe(3);
  });

  it("throws after exhausting all attempts", async () => {
    await expect(
      retryWithBackoff(
        async () => {
          throw new Error("persistent");
        },
        { maxAttempts: 3, baseMs: 5, jitter: false }
      )
    ).rejects.toThrow("persistent");
  });

  it("respects custom maxAttempts option", async () => {
    let attempt = 0;
    await expect(
      retryWithBackoff(
        async () => {
          attempt++;
          throw new Error("never ok");
        },
        { maxAttempts: 2, baseMs: 5, jitter: false }
      )
    ).rejects.toThrow("never ok");
    expect(attempt).toBe(2);
  });

  it("uses default options when not provided", async () => {
    let attempt = 0;
    await expect(
      retryWithBackoff(async () => {
        attempt++;
        throw new Error("persistent");
      })
    ).rejects.toThrow("persistent");
    // Default maxAttempts is 5
    expect(attempt).toBe(5);
  });

  it("works with jitter disabled", async () => {
    let attempt = 0;
    const result = await retryWithBackoff(
      async () => {
        attempt++;
        if (attempt < 2) throw new Error(`fail ${attempt}`);
        return "success-without-jitter";
      },
      { maxAttempts: 3, baseMs: 10, jitter: false }
    );
    expect(result).toBe("success-without-jitter");
    expect(attempt).toBe(2);
  });

  it("respects maxMs cap on exponential backoff", async () => {
    let attempt = 0;
    const start = Date.now();
    await expect(
      retryWithBackoff(
        async () => {
          attempt++;
          throw new Error("timeout test");
        },
        { maxAttempts: 4, baseMs: 10000, maxMs: 50, jitter: false }
      )
    ).rejects.toThrow("timeout test");
    const elapsed = Date.now() - start;
    // With maxMs=50 and 4 attempts: wait times are min(10000,50), min(10000,50), min(10000,50)
    // So ~150ms total + negligible overhead
    expect(elapsed).toBeLessThan(1000);
    expect(attempt).toBe(4);
  });
});
