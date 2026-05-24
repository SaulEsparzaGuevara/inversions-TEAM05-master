// FIC: Confluence signals route for chart markers and table sync.
// FIC: Ruta de senales de confluencia para marcadores del chart y sincronizacion de tabla.

import { Router } from "express";

export const signalConfluenceRouter = Router();

signalConfluenceRouter.get("/confluence", (req, res) => {
  const symbol = String(req.query.symbol ?? "SPY").toUpperCase();
  const now = Date.now();

  const signals = Array.from({ length: 20 }).map((_, idx) => {
    const isBuy = idx % 2 === 0;
    const time = new Date(now - idx * 3_600_000).toISOString();
    const confidence = Number((0.45 + ((idx % 7) * 0.07)).toFixed(2));

    return {
      id: `${symbol}-${idx + 1}`,
      symbol,
      timestamp: Math.floor(new Date(time).getTime() / 1000),
      direction: isBuy ? "buy" : "sell",
      confidence,
      metadata: {
        timing_d: isBuy ? "bullish" : "bearish",
        timing_h: idx % 3 === 0 ? "confirm" : "watch",
        pre_senal: isBuy ? "alcista" : "bajista",
        senal_real_activada: idx % 3 === 0,
        stop: Number((96 + idx * 0.5).toFixed(2)),
        objetivo: Number((106 + idx * 0.6).toFixed(2)),
        divergencia: idx % 4 === 0 ? "RSI" : "none",
        z_extrema: Number((1.2 + idx * 0.03).toFixed(2)),
        cantidad_sugerida: 1 + (idx % 4),
        vencimiento: new Date(now + 15 * 86_400_000).toISOString(),
        precio_ejercicio: Number((100 + idx).toFixed(2)),
        tipo_opcion: isBuy ? "call" : "put",
        duracion: 3 + (idx % 10),
        bid: Number((100 + idx * 0.2).toFixed(2)),
        ask: Number((100.4 + idx * 0.2).toFixed(2)),
        zona_apertura: "100-101",
        zona_cierre: "104-105",
        stoploss_sugerido: Number((97 + idx * 0.2).toFixed(2)),
        alerta_configurada: idx % 3 !== 0,
        referencia_maximos: Number((112 + idx * 0.4).toFixed(2)),
        referencia_minimos: Number((92 - idx * 0.2).toFixed(2)),
        variantes_ataque: "breakout/retest",
        recolocacion_stoploss: "trail 1R",
        liquidez: idx % 2 === 0 ? "alta" : "media",
        riesgo: idx % 3 === 0 ? "medio" : "bajo",
        retorno_maximo: Number((9 + idx * 0.2).toFixed(2)),
        perdida_maxima: Number((3 + idx * 0.1).toFixed(2))
      }
    };
  });

  res.status(200).json({ signals });
});
