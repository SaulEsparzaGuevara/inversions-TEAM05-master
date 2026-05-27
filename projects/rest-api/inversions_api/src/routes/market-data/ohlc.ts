// FIC: OHLC market data route with deterministic mock candles for superchart.
// FIC: Ruta de datos OHLC con velas mock deterministas para superchart.

import { Router } from "express";

function intervalMs(timeframe: string): number {
  switch (timeframe) {
    case "1m":
      return 60_000;
    case "5m":
      return 300_000;
    case "15m":
      return 900_000;
    case "1h":
      return 3_600_000;
    case "4h":
      return 14_400_000;
    case "1w":
      return 604_800_000;
    case "1M":
      return 2_592_000_000;
    default:
      return 86_400_000;
  }
}

export const marketDataOhlcRouter = Router();

marketDataOhlcRouter.get("/ohlc", (req, res) => {
  const symbol = String(req.query.symbol ?? "SPY").toUpperCase();
  const timeframe = String(req.query.timeframe ?? "1d");
  const step = intervalMs(timeframe);

  const now = Date.now();
  const candles = Array.from({ length: 300 }).map((_, index) => {
    const t = now - (300 - index) * step;
    const base = 100 + Math.sin(index / 12) * 8 + (symbol.charCodeAt(0) % 7);
    const open = Number((base + Math.sin(index / 3)).toFixed(2));
    const close = Number((base + Math.cos(index / 4)).toFixed(2));
    const high = Number((Math.max(open, close) + 0.8).toFixed(2));
    const low = Number((Math.min(open, close) - 0.8).toFixed(2));

    return {
      time: Math.floor(t / 1000),
      open,
      high,
      low,
      close,
      volume: Math.round(1000 + Math.abs(Math.sin(index)) * 3000)
    };
  });

  res.status(200).json({ symbol, timeframe, candles });
});
