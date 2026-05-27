// FIC: SuperChart component using TradingView Lightweight Charts
// FIC: Componente SuperChart usando TradingView Lightweight Charts

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  createSeriesMarkers,
  CandlestickSeries,
  ColorType,
  IChartApi,
  ISeriesApi
} from "lightweight-charts";
import { useSignalStore } from "../../store/signals";
import { getAuthHeaders } from "../../services/signals/signalApi";

interface OHLC {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface SignalMark {
  time: string;
  position: "aboveBar" | "belowBar";
  color: string;
  shape: "circle" | "square" | "arrowUp" | "arrowDown";
  text: string;
  signal: any;
}

interface SuperChartProps {
  symbol?: string;
  timeframe?: string;
  startDate?: Date;
  endDate?: Date;
  onSelectSignal?: (signal: any) => void;
}

// FIC: SuperChart component with professional trading chart (EN)
// FIC: Componente SuperChart con gráfico profesional de trading (ES)
export const SuperChart: React.FC<SuperChartProps> = ({
  symbol,
  timeframe = "1d",
  startDate,
  endDate,
  onSelectSignal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const signalMarkersRef = useRef<Map<string, SignalMark>>(new Map());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candles, setCandles] = useState<OHLC[]>([]);
  const [signals, setSignals] = useState<SignalMark[]>([]);

  const { selectedSignal } = useSignalStore();

  // FIC: Initialize chart on mount (EN)
  // FIC: Inicializar gráfico al montar (ES)
  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    try {
      // FIC: Create chart instance (EN)
      // FIC: Crear instancia de gráfico (ES)
      const chart = createChart(containerRef.current, {
        layout: {
          textColor: "#1f2937",
          background: { type: ColorType.Solid, color: "#ffffff" },
        },
        width: containerRef.current.clientWidth,
        height: Math.max(containerRef.current.clientHeight, 340),
        timeScale: {
          timeVisible: true,
          secondsVisible: true,
        },
      });

      chartRef.current = chart;

      // FIC: Add candlestick series (EN)
      // FIC: Agregar serie de velas (ES)
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#4ade80",
        downColor: "#ef4444",
        borderVisible: true,
        wickUpColor: "#4ade80",
        wickDownColor: "#ef4444",
      });

      candleSeriesRef.current = candleSeries;

      // FIC: Handle window resize (EN)
      // FIC: Manejar redimensionamiento de ventana (ES)
      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: containerRef.current.clientWidth,
            height: Math.max(containerRef.current.clientHeight, 340),
          });
          chartRef.current.timeScale().fitContent();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (err) {
      setError((err as Error).message);
    }
  }, [symbol]);

  // FIC: Load OHLC data (EN)
  // FIC: Cargar datos OHLC (ES)
  useEffect(() => {
    if (!symbol || !chartRef.current || !candleSeriesRef.current) return;

    const loadOHLC = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/market-data/ohlc?symbol=${symbol}&timeframe=${timeframe}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) {
          throw new Error("Failed to load OHLC data");
        }

        const data = await response.json();
        const rawCandles: OHLC[] = data.candles || [];

        // FIC: Apply period range filter client-side until backend supports date-range query.
        // FIC: Aplicar filtro de rango de periodo en cliente mientras backend soporta query por fechas.
        const filteredCandles = rawCandles.filter((candle) => {
          const candleDate = new Date(Number(candle.time) * 1000);
          if (startDate && candleDate < startDate) return false;
          if (endDate && candleDate > endDate) return false;
          return true;
        });

        setCandles(filteredCandles);

        // FIC: Set data to candlestick series (EN)
        // FIC: Establecer datos en serie de velas (ES)
        candleSeriesRef.current!.setData(filteredCandles);
        chartRef.current!.timeScale().fitContent();
      } catch (err) {
        setError((err as Error).message);
        console.error("OHLC load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadOHLC();
  }, [symbol, timeframe, startDate, endDate]);

  // FIC: Load signals overlay (EN)
  // FIC: Cargar overlay de señales (ES)
  useEffect(() => {
    if (!symbol || !candleSeriesRef.current) return;

    const loadSignals = async () => {
      try {
        const response = await fetch(
          `/api/signals/confluence?symbol=${symbol}`,
          { headers: getAuthHeaders() }
        );
        if (!response.ok) {
          throw new Error("Failed to load signals");
        }

        const data = await response.json();
        const signalMarks: SignalMark[] = (data.signals || []).map(
          (sig: any) => ({
            time: sig.timestamp,
            position: sig.direction === "buy" ? "belowBar" : "aboveBar",
            color: sig.direction === "buy" ? "#4ade80" : "#ef4444",
            shape: sig.direction === "buy" ? "arrowUp" : "arrowDown",
            text: `${sig.confidence.toFixed(2)}`,
            signal: sig,
          })
        );

        setSignals(signalMarks);

        // FIC: Set markers on series (EN)
        // FIC: Establecer marcadores en serie (ES)
        createSeriesMarkers(candleSeriesRef.current as any, signalMarks as any);

        // FIC: Store for later reference (EN)
        // FIC: Guardar para referencia posterior (ES)
        signalMarks.forEach((mark) => {
          signalMarkersRef.current!.set(mark.time, mark);
        });
      } catch (err) {
        console.error("Signal load error:", err);
      }
    };

    loadSignals();
  }, [symbol]);

  // FIC: Handle signal highlighting (EN)
  // FIC: Manejar resaltado de señal (ES)
  useEffect(() => {
    if (!selectedSignal || !candleSeriesRef.current) return;

    // FIC: Find and highlight the selected signal (EN)
    // FIC: Encontrar y resaltar la señal seleccionada (ES)
    const relevantSignals = signals.map((mark) => {
      if (mark.signal?.id === selectedSignal?.signalId || mark.signal?.id === selectedSignal?.id) {
        return {
          ...mark,
          color: "#fbbf24",
          shape: "square",
        };
      }
      return mark;
    });

    createSeriesMarkers(candleSeriesRef.current as any, relevantSignals as any);
  }, [selectedSignal, signals]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Chart Error</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* FIC: Chart container (EN) */}
      {/* FIC: Contenedor de gráfico (ES) */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <p className="text-gray-600">Loading chart...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{ position: "relative", minHeight: 340 }}
      />

      {/* FIC: Chart controls footer (EN) */}
      {/* FIC: Pie de controles del gráfico (ES) */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex justify-between">
        <span>
          {symbol} • {timeframe} •{" "}
          {candles.length > 0 && `${candles.length} candles`}
        </span>
        <span>
          {selectedSignal
            ? `Signal: ${selectedSignal.symbol} @ ${selectedSignal.confidence?.toFixed(2) || "?"}`
            : "Select a signal from confluence table"}
        </span>
      </div>
    </div>
  );
};

export default SuperChart;
