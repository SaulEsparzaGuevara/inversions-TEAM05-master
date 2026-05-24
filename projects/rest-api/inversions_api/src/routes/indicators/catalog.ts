// FIC: Technical indicators catalog route with online/offline availability flags.
// FIC: Ruta de catalogo de indicadores tecnicos con disponibilidad online/offline.

import { Router } from "express";

const catalog = [
  { id: "rsi", name: "RSI", category: "momentum", description: "Relative Strength Index" },
  { id: "macd", name: "MACD", category: "momentum", description: "Trend momentum crossover" },
  { id: "ema", name: "EMA", category: "trend", description: "Exponential moving average" },
  { id: "bbands", name: "Bollinger Bands", category: "volatility", description: "Volatility envelope" },
  { id: "vwap", name: "VWAP", category: "volume", description: "Volume weighted average price" },
  { id: "stoch", name: "Stochastic", category: "momentum", description: "Overbought and oversold oscillator" }
];

export const indicatorsCatalogRouter = Router();

indicatorsCatalogRouter.get("/catalog", (req, res) => {
  const mode = String(req.query.mode ?? "online");

  const indicators = catalog.map((item) => ({
    ...item,
    available: mode !== "offline" || ["rsi", "macd", "ema"].includes(item.id)
  }));

  res.status(200).json({ indicators });
});
