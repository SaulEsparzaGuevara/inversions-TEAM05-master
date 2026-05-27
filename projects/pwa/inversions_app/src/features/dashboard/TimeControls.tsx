// FIC: Time controls component for period and timeframe selection
// FIC: Componente de controles de tiempo para selección de período y temporalidad

import React, { useState, useEffect } from "react";
import { useSignalStore } from "../../store/signals";
import { getAuthHeaders } from "../../services/signals/signalApi";

interface TimeframeOption {
  label: string;
  value: string;
}

interface PeriodOption {
  label: string;
  value: string;
  daysBack: number;
}

const DEFAULT_TIMEFRAMES: TimeframeOption[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1d", value: "1d" },
  { label: "1w", value: "1w" },
  { label: "1M", value: "1M" },
  { label: "ALL", value: "ALL" },
];

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: "1D", value: "1d", daysBack: 1 },
  { label: "1W", value: "1w", daysBack: 7 },
  { label: "1M", value: "1m", daysBack: 30 },
  { label: "3M", value: "3m", daysBack: 90 },
  { label: "6M", value: "6m", daysBack: 180 },
  { label: "1Y", value: "1y", daysBack: 365 },
  { label: "YTD", value: "ytd", daysBack: 0 }, // Calculated
  { label: "Custom", value: "custom", daysBack: 0 },
];

interface TimeControlsProps {
  symbol?: string;
  onTimeframeChange?: (timeframe: string) => void;
  onPeriodChange?: (period: string, startDate: Date, endDate: Date) => void;
}

// FIC: TimeControls component (EN)
// FIC: Componente TimeControls (ES)
export const TimeControls: React.FC<TimeControlsProps> = ({
  symbol,
  onTimeframeChange,
  onPeriodChange,
}) => {
  const [timeframe, setTimeframe] = useState("1d");
  const [period, setPeriod] = useState("1y");
  const [availableTimeframes, setAvailableTimeframes] =
    useState<TimeframeOption[]>(DEFAULT_TIMEFRAMES);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  const { runtimeMode } = useSignalStore();

  // FIC: Load available timeframes based on broker capabilities (EN)
  // FIC: Cargar temporalidades disponibles según capacidades del broker (ES)
  useEffect(() => {
    const loadTimeframes = async () => {
      if (!symbol) return;

      try {
        setLoading(true);

        // FIC: Fetch capabilities from active broker (EN)
        // FIC: Obtener capacidades del broker activo (ES)
        const response = await fetch("/api/brokers/capabilities", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          return; // FIC: Use defaults on error
        }

        const data = await response.json();
        const granularities = data.granularities || [];

        // FIC: Filter available timeframes based on capabilities (EN)
        // FIC: Filtrar temporalidades disponibles según capacidades (ES)
        const filtered = DEFAULT_TIMEFRAMES.filter(
          (tf) => granularities.includes(tf.value) || tf.value === "ALL"
        );

        setAvailableTimeframes(filtered.length > 0 ? filtered : DEFAULT_TIMEFRAMES);
      } catch (err) {
        console.error("Failed to load timeframe capabilities:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTimeframes();
  }, [symbol, runtimeMode]);

  // FIC: Handle timeframe change (EN)
  // FIC: Manejar cambio de temporalidad (ES)
  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  // FIC: Calculate date range for selected period (EN)
  // FIC: Calcular rango de fechas para período seleccionado (ES)
  const getDateRange = (selectedPeriod: string) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedPeriod) {
      case "1d":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "1w":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "1m":
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case "3m":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "ytd":
        startDate.setFullYear(endDate.getFullYear());
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate.setTime(new Date(customEndDate).getTime());
        }
        break;
      default:
        startDate.setFullYear(endDate.getFullYear() - 1);
    }

    return { startDate, endDate };
  };

  // FIC: Handle period change (EN)
  // FIC: Manejar cambio de período (ES)
  const handlePeriodChange = (selectedPeriod: string) => {
    setPeriod(selectedPeriod);

    if (selectedPeriod === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      const { startDate, endDate } = getDateRange(selectedPeriod);
      if (onPeriodChange) {
        onPeriodChange(selectedPeriod, startDate, endDate);
      }
    }
  };

  // FIC: Handle custom date range (EN)
  // FIC: Manejar rango de fechas personalizado (ES)
  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      if (onPeriodChange) {
        onPeriodChange("custom", startDate, endDate);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-wrap">
      {/* FIC: Period selector (EN) */}
      {/* FIC: Selector de período (ES) */}
      <div className="flex gap-2">
        <span className="text-xs font-semibold text-gray-600 mt-1">
          Period:
        </span>
        <div className="flex gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                period === opt.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handlePeriodChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* FIC: Custom date range inputs (EN) */}
      {/* FIC: Campos de rango de fechas personalizado (ES) */}
      {showCustom && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            placeholder="Start date"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            placeholder="End date"
          />
          <button
            className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleApplyCustomRange}
          >
            Apply
          </button>
        </div>
      )}

      {/* FIC: Timeframe selector (EN) */}
      {/* FIC: Selector de temporalidad (ES) */}
      <div className="flex gap-2">
        <span className="text-xs font-semibold text-gray-600 mt-1">
          Timeframe:
        </span>
        <div className="flex gap-1 flex-wrap">
          {availableTimeframes.map((tf) => (
            <button
              key={tf.value}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === tf.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => handleTimeframeChange(tf.value)}
              disabled={loading}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <span className="text-xs text-gray-500">Loading capabilities...</span>
      )}
    </div>
  );
};

export default TimeControls;
