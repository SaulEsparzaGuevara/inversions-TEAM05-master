import { describe, expect, it, vi } from "vitest";
import { IBKRAdapter } from "../../../src/modules/brokers/ibkrAdapter";

describe("IBKR adapter", () => {
  it("retries once and returns normalized filled response", async () => {
    const adapter = new IBKRAdapter("key", "acct-1");
    const submitSpy = vi
      .spyOn(adapter as unknown as { submitOrderWithTimeout: Function }, "submitOrderWithTimeout")
      .mockRejectedValueOnce(new Error("TIMEOUT"))
      .mockResolvedValueOnce({
        orderId: 99,
        status: "Filled",
        filled: 2,
        remaining: 0,
        avgPrice: 150
      });

    vi.spyOn(adapter as unknown as { sleep: Function }, "sleep").mockResolvedValue(undefined);

    const result = await adapter.submitOrder("AAPL", "BUY", 2, 150, "idem-fixed");

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(result.state).toBe("FILLED");
    expect(result.orderId).toBe("99");
    expect(result.quantity).toBe(2);
  });

  it("throws normalized broker error after retries are exhausted", async () => {
    const adapter = new IBKRAdapter("key", "acct-1");
    vi.spyOn(adapter as unknown as { submitOrderWithTimeout: Function }, "submitOrderWithTimeout").mockRejectedValue(
      new Error("Connection refused")
    );
    vi.spyOn(adapter as unknown as { sleep: Function }, "sleep").mockResolvedValue(undefined);

    await expect(adapter.submitOrder("AAPL", "BUY", 1)).rejects.toMatchObject({
      errorCode: "NETWORK_ERROR",
      isRetryable: true
    });
  });

  it("maps known broker errors and verifies funds", async () => {
    const adapter = new IBKRAdapter("key", "acct-1");

    expect(adapter.normalizeError(new Error("Invalid symbol: BAD"))).toMatchObject({
      errorCode: "INVALID_SYMBOL",
      isRetryable: false
    });
    expect(adapter.normalizeError(new Error("rate limit reached"))).toMatchObject({
      errorCode: "RATE_LIMIT",
      isRetryable: true
    });

    vi.spyOn(adapter, "getAccountBalance").mockResolvedValue({
      cash: 100,
      equity: 100,
      buyingPower: 100
    });

    await expect(adapter.verifyFunds("BUY", 1, 90)).resolves.toBe(true);
    await expect(adapter.verifyFunds("BUY", 2, 90)).resolves.toBe(false);
    await expect(adapter.verifyFunds("SELL", 1000, 90)).resolves.toBe(true);
  });
});