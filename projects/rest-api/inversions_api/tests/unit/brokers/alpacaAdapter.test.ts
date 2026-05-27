import { describe, expect, it, vi } from "vitest";
import { AlpacaAdapter } from "../../../src/modules/brokers/alpacaAdapter";

describe("Alpaca adapter", () => {
  it("returns normalized pending response with idempotency key", async () => {
    const adapter = new AlpacaAdapter("k", "s", true);
    const result = await adapter.submitOrder("MSFT", "BUY", 3, 200, "idem-a");

    expect(result.state).toBe("PENDING");
    expect(result.orderId.includes("idem-a")).toBe(true);
    expect(result.metadata.broker).toBe("ALPACA");
    expect(result.metadata.brokerId).toBe("paper");
  });

  it("retries and throws normalized timeout/network errors", async () => {
    const adapter = new AlpacaAdapter("k", "s", false);
    vi.spyOn(adapter as unknown as { submitOrderWithTimeout: Function }, "submitOrderWithTimeout").mockRejectedValue(
      new Error("timeout while posting order")
    );
    vi.spyOn(adapter as unknown as { sleep: Function }, "sleep").mockResolvedValue(undefined);

    await expect(adapter.submitOrder("MSFT", "SELL", 1)).rejects.toMatchObject({
      errorCode: "TIMEOUT",
      isRetryable: true
    });

    const networkError = adapter.normalizeError(new Error("connection reset by peer"));
    expect(networkError.errorCode).toBe("NETWORK_ERROR");
    expect(networkError.isRetryable).toBe(true);
  });

  it("covers account status and fund checks", async () => {
    const adapter = new AlpacaAdapter("k", "s", false);

    await expect(adapter.getOrderStatus("o-1")).resolves.toMatchObject({
      state: "PENDING",
      metadata: {
        brokerId: "live"
      }
    });
    await expect(adapter.cancelOrder("o-2")).resolves.toMatchObject({ state: "CANCELLED" });

    vi.spyOn(adapter, "getAccountBalance").mockResolvedValue({
      cash: 50,
      equity: 50,
      buyingPower: 50
    });

    await expect(adapter.verifyFunds("BUY", 1, 49)).resolves.toBe(true);
    await expect(adapter.verifyFunds("BUY", 2, 49)).resolves.toBe(false);
  });
});