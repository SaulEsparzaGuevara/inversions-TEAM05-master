import React, { useEffect, useRef } from "react";
import { createChart, LineSeries, ColorType, type IChartApi, type ISeriesApi } from "lightweight-charts";
import type { PayoffPoint } from "../../services/coverage/coverageApi";

interface PayoffChartProps {
  points: PayoffPoint[];
  baselinePrice: number;
  height?: number;
  strategyLabel?: string;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  points,
  baselinePrice,
  height = 300,
  strategyLabel
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const zeroSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        textColor: "var(--color-text-muted)",
        background: { type: ColorType.Solid, color: "transparent" }
      },
      width: containerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: "var(--color-border-subtle)" },
        horzLines: { color: "var(--color-border-subtle)" }
      },
      timeScale: {
        borderColor: "var(--color-border)",
        timeVisible: false,
        ticksVisible: false
      },
      rightPriceScale: {
        borderColor: "var(--color-border)"
      },
      crosshair: {
        vertLine: { labelVisible: false },
        horzLine: { labelVisible: true }
      }
    });

    chartRef.current = chart;

    const lineSeries = chart.addSeries(LineSeries, {
      color: "var(--color-accent)",
      lineWidth: 2,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01
      }
    });
    lineSeriesRef.current = lineSeries;

    const zeroData = points.map((_, i) => ({ time: i as any, value: 0 }));
    const zeroSeries = chart.addSeries(LineSeries, {
      color: "var(--color-text-muted)",
      lineWidth: 1,
      lineStyle: 2 as any,
      priceFormat: {
        type: "price",
        precision: 2,
        minMove: 0.01
      }
    });
    zeroSeriesRef.current = zeroSeries;
    zeroSeries.setData(zeroData);

    // Format price labels from payoff points
    const pointsArr = points;
    chart.applyOptions({
      localization: {
        timeFormatter: (time: any) => {
          const idx = Math.round(Number(time));
          const pt = pointsArr[idx];
          return pt ? `$${pt.underlyingPrice.toFixed(0)}` : "";
        }
      }
    });

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
        chartRef.current.timeScale().fitContent();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [points, height]);

  // Update data when points change
  useEffect(() => {
    if (!lineSeriesRef.current) return;
    const data = points.map((pt, i) => ({
      time: i as any,
      value: pt.pnl
    }));
    lineSeriesRef.current.setData(data);
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
      <div ref={containerRef} style={{ width: "100%", minHeight: height }} />
    </div>
  );
};
