/**
 * ============================================================================
 * PayoffChart.tsx
 * ============================================================================
 *
 * FIC: Payoff chart using lightweight-charts — P&L line, gradient fill,
 * zero reference line, color-coded for dark theme.
 */

import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, AreaSeries, ColorType, type IChartApi, type ISeriesApi } from "lightweight-charts";
import type { PayoffPoint } from "../../services/coverage/coverageApi";

interface PayoffChartProps {
  points: PayoffPoint[];
  baselinePrice: number;
  breakevenPrice?: number;
  height?: number;
  strategyLabel?: string;
}

// ── Dark-theme chart palette (explicit hex, safer for canvas) ──
const COLORS = {
  background: "#161b22",       // card surface
  text:       "#8b949e",       // text muted
  grid:       "#21262d",       // border subtle
  border:     "#30363d",       // border
  accent:     "#58a6ff",       // accent hover (bright blue)
  accentGlow: "rgba(88, 166, 255, 0.08)",
  accentGlowBottom: "rgba(88, 166, 255, 0.01)",
  zeroLine:   "#484f58",       // muted gray
  crosshair:  "#484f58",
  markerBg:   "#0d1117",       // page background
};

export const PayoffChart: React.FC<PayoffChartProps> = ({
  points,
  baselinePrice,
  breakevenPrice,
  height = 300,
  strategyLabel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const fillSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const crosshairHandlerRef = useRef<((param: any) => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const TIME_BASE = 1000000000;
    const pointsArr = points;

    const chart = createChart(containerRef.current, {
      layout: {
        textColor: COLORS.text,
        background: { type: ColorType.Solid, color: COLORS.background }
      },
      width: containerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid }
      },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: false,
        ticksVisible: false,
        tickMarkFormatter: (time: number) => {
          const idx = Math.round(Number(time)) - TIME_BASE;
          const pt = pointsArr[idx];
          return pt ? `$${pt.underlyingPrice.toFixed(0)}` : "";
        }
      },
      rightPriceScale: {
        borderColor: COLORS.border
      },
      crosshair: {
        vertLine: {
          labelVisible: false,
          color: COLORS.crosshair,
          width: 1,
          style: 3 as any // dashed
        },
        horzLine: {
          labelVisible: true,
          labelBackgroundColor: COLORS.background,
          color: COLORS.crosshair,
          width: 1,
          style: 3 as any // dashed
        }
      },
      handleScroll: false,
      handleScale: false
    });

    chartRef.current = chart;

    // ── 1. Gradient fill area (renders behind the line) ──
    const data = points.map((pt, i) => ({
      time: (TIME_BASE + i) as any,
      value: pt.pnl
    }));

    const fillSeries = chart.addSeries(AreaSeries, {
      lineColor: "transparent",
      topColor: COLORS.accentGlow,
      bottomColor: COLORS.accentGlowBottom,
      lineWidth: 1,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 }
    });
    fillSeries.setData(data);
    fillSeriesRef.current = fillSeries;

    // ── 2. Main P&L line ──
    const lineSeries = chart.addSeries(LineSeries, {
      color: COLORS.accent,
      lineWidth: 3,
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 5,
      crosshairMarkerBorderColor: COLORS.accent,
      crosshairMarkerBackgroundColor: COLORS.markerBg,
      lastValueVisible: true
    });
    lineSeries.setData(data);
    lineSeriesRef.current = lineSeries;

    // ── 3. Break-even price line (dashed line at PnL = 0, no label) ──
    lineSeries.createPriceLine({
      price: 0,
      color: COLORS.zeroLine,
      lineWidth: 2,
      lineStyle: 2 as any, // dashed
      axisLabelVisible: false
    });

    // ── 4. Break-even hover tooltip ──
    const crosshairHandler = (param: any) => {
      const tip = tooltipRef.current;
      if (!tip || breakevenPrice == null) {
        if (tip) tip.style.display = "none";
        return;
      }
      if (!param.point || !param.time) {
        tip.style.display = "none";
        return;
      }
      const idx = Math.round(Number(param.time)) - TIME_BASE;
      const pt = pointsArr[idx];
      if (!pt) {
        tip.style.display = "none";
        return;
      }
      const cursorPrice = pt.underlyingPrice;
      const diffPct = Math.abs(cursorPrice - breakevenPrice) / Math.max(0.01, breakevenPrice);
      if (diffPct <= 0.05) {
        const yZero = lineSeries.priceToCoordinate(0);
        if (yZero == null) { tip.style.display = "none"; return; }
        const chartWidth = containerRef.current?.clientWidth ?? 0;
        const tipWidth = 170;
        let left = param.point.x + 12;
        if (left + tipWidth > chartWidth - 4) {
          left = Math.max(4, param.point.x - tipWidth - 12);
        }
        tip.style.display = "block";
        tip.style.left = `${left}px`;
        tip.style.top = `${Math.max(4, yZero - 22)}px`;
        tip.textContent = `Break-even: $${breakevenPrice.toFixed(2)}`;
      } else {
        tip.style.display = "none";
      }
    };
    crosshairHandlerRef.current = crosshairHandler;
    chart.subscribeCrosshairMove(crosshairHandler);

    // Format price labels from payoff points (crosshair)
    chart.applyOptions({
      localization: {
        timeFormatter: (time: any) => {
          const idx = Math.round(Number(time)) - TIME_BASE;
          const pt = pointsArr[idx];
          return pt ? `$${pt.underlyingPrice.toFixed(0)}` : "";
        }
      }
    });

    // Reset tooltip visibility on data change
    if (tooltipRef.current) tooltipRef.current.style.display = "none";

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
        chartRef.current.timeScale().fitContent();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (crosshairHandlerRef.current) {
        chart.unsubscribeCrosshairMove(crosshairHandlerRef.current);
        crosshairHandlerRef.current = null;
      }
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [points, height]);

  // Update data when points change
  useEffect(() => {
    if (!lineSeriesRef.current || !fillSeriesRef.current) return;
    const TIME_BASE = 1000000000;
    const data = points.map((pt, i) => ({
      time: (TIME_BASE + i) as any,
      value: pt.pnl
    }));
    lineSeriesRef.current.setData(data);
    fillSeriesRef.current.setData(data);
    chartRef.current?.timeScale().fitContent();
  }, [points]);

  if (points.length === 0) {
    return (
      <div style={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-muted)",
        fontSize: "0.85rem",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-md)"
      }}>
        Datos de payoff no disponibles
      </div>
    );
  }

  return (
    <div>
      {strategyLabel && (
        <div style={{
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          marginBottom: "0.35rem"
        }}>
          {strategyLabel}
        </div>
      )}
      <div style={{ position: "relative" }}>
        <div
          ref={containerRef}
          style={{
            width: "100%",
            minHeight: height,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden"
          }}
        />
        {/* Break-even hover tooltip */}
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            display: "none",
            padding: "4px 10px",
            background: "#21262d",
            border: "1px solid #30363d",
            borderRadius: "6px",
            color: "#e6edf3",
            fontSize: "0.8rem",
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
          }}
        />
      </div>
    </div>
  );
};
