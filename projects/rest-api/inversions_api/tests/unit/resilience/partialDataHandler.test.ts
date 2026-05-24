import { describe, expect, it } from "vitest";
import { mergePartialWithDefaults } from "../../../src/lib/resilience/partialDataHandler.js";

interface TestConfig {
  host: string;
  port: number;
  timeout: number;
  retries: number;
  enabled: boolean;
}

const DEFAULTS: TestConfig = {
  host: "localhost",
  port: 3000,
  timeout: 5000,
  retries: 3,
  enabled: true
};

describe("mergePartialWithDefaults", () => {
  it("returns full defaults when partial is empty", () => {
    const result = mergePartialWithDefaults({}, DEFAULTS);
    expect(result).toEqual(DEFAULTS);
  });

  it("merges partial values over defaults", () => {
    const partial: Partial<TestConfig> = { port: 8080, timeout: 10000 };
    const result = mergePartialWithDefaults(partial, DEFAULTS);

    expect(result.host).toBe("localhost"); // default kept
    expect(result.port).toBe(8080); // overridden
    expect(result.timeout).toBe(10000); // overridden
    expect(result.retries).toBe(3); // default kept
    expect(result.enabled).toBe(true); // default kept
  });

  it("uses default when partial value is undefined", () => {
    const partial: Partial<TestConfig> = { host: undefined, port: 9090 };
    const result = mergePartialWithDefaults(partial, DEFAULTS);

    expect(result.host).toBe("localhost"); // undefined → default
    expect(result.port).toBe(9090); // overridden
  });

  it("uses default when partial value is null", () => {
    const partial: Partial<TestConfig> = { timeout: null as unknown as number, retries: 5 };
    const result = mergePartialWithDefaults(partial, DEFAULTS);

    expect(result.timeout).toBe(5000); // null → default
    expect(result.retries).toBe(5); // overridden
  });

  it("works with empty defaults and partial data", () => {
    const defaults = { a: 1, b: 2 };
    const partial: Partial<typeof defaults> = { a: 99 };
    const result = mergePartialWithDefaults(partial, defaults);

    expect(result.a).toBe(99);
    expect(result.b).toBe(2);
  });

  it("preserves all default fields when partial provides no values", () => {
    const partial: Partial<TestConfig> = {};
    const result = mergePartialWithDefaults(partial, DEFAULTS);

    expect(Object.keys(result)).toEqual(Object.keys(DEFAULTS));
    expect(result).toEqual(DEFAULTS);
  });
});
