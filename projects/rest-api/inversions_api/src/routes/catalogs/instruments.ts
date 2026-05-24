// FIC: Dynamic catalog endpoint for watchlist categories and instrument universe.
// FIC: Endpoint de catalogo dinamico para categorias de watchlist y universo de instrumentos.

import { Router } from "express";

interface CatalogCategory {
  id: string;
  name: string;
}

const categories: CatalogCategory[] = [
  { id: "indices", name: "Indices" },
  { id: "stocks", name: "Stocks" },
  { id: "futures", name: "Futures" },
  { id: "forex", name: "Forex" },
  { id: "cripto", name: "Cripto" },
  { id: "bonos", name: "Bonos" },
  { id: "references_idx", name: "References IDX" }
];

const instruments = [
  { symbol: "SPY", name: "SPDR S&P 500 ETF", category: "indices" },
  { symbol: "QQQ", name: "Invesco QQQ", category: "indices" },
  { symbol: "AAPL", name: "Apple Inc", category: "stocks" },
  { symbol: "MSFT", name: "Microsoft Corp", category: "stocks" },
  { symbol: "ES=F", name: "E-Mini S&P 500", category: "futures" },
  { symbol: "NQ=F", name: "E-Mini Nasdaq 100", category: "futures" },
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "forex" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "forex" },
  { symbol: "BTCUSD", name: "Bitcoin", category: "cripto" },
  { symbol: "ETHUSD", name: "Ethereum", category: "cripto" },
  { symbol: "US10Y", name: "US 10Y Treasury", category: "bonos" },
  { symbol: "VIX", name: "Volatility Index", category: "references_idx" }
];

export const instrumentsCatalogRouter = Router();

instrumentsCatalogRouter.get("/instruments", (_req, res) => {
  res.status(200).json({ categories, instruments });
});
