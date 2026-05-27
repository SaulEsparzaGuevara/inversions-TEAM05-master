import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IndicatorsMenu } from "../../../src/features/dashboard/IndicatorsMenu";

describe("IndicatorsMenu", () => {
  it("loads indicators and supports quick select + modal search", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        indicators: [
          { id: "rsi", name: "RSI", category: "momentum", available: true },
          { id: "macd", name: "MACD", category: "momentum", available: true },
          { id: "ema", name: "EMA", category: "trend", available: true },
          { id: "bbands", name: "Bollinger Bands", category: "volatility", available: true }
        ]
      })
    } as Response);

    const onSelected = vi.fn();

    render(<IndicatorsMenu onIndicatorsSelected={onSelected} />);

    await waitFor(() => {
      expect(screen.getByText("RSI")).toBeTruthy();
    });

    fireEvent.click(screen.getByText("RSI"));
    expect(onSelected).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("More indicators"));
    expect(screen.getByText("Technical Indicators")).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText("Search indicators..."), {
      target: { value: "Boll" }
    });

    expect(screen.getByText("Bollinger Bands")).toBeTruthy();
  });
});
