// FIC: Runtime mode switches for online/offline and demo/real operation modes
// FIC: Switches de modo de tiempo de ejecución para modos online/offline y demo/real

import React, { useState, useEffect } from "react";
import { useSignalStore } from "../../store/signals";
import { Wifi, WifiOff, Zap, AlertCircle } from "lucide-react";
import { getAuthHeaders } from "../../services/signals/signalApi";

interface RuntimeModeProps {
  onModeChange?: (
    online: boolean,
    mode: "demo" | "real"
  ) => void;
}

// FIC: RuntimeModeSwitches component (EN)
// FIC: Componente RuntimeModeSwitches (ES)
export const RuntimeModeSwitches: React.FC<RuntimeModeProps> = ({
  onModeChange,
}) => {
  const { runtimeMode, setRuntimeMode, operationalMode, setOperationalMode } =
    useSignalStore();

  const [connStatus, setConnStatus] = useState<"connected" | "disconnected" | "checking">(
    "checking"
  );
  const [showWarning, setShowWarning] = useState(false);

  // FIC: Check connection status on mount and periodically (EN)
  // FIC: Verificar estado de conexión al montar y periódicamente (ES)
  useEffect(() => {
    const checkConnection = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      try {
        setConnStatus("checking");
        const response = await fetch("/api/health", {
          signal: controller.signal,
          headers: getAuthHeaders(),
        });
        setConnStatus(response.ok ? "connected" : "disconnected");
      } catch {
        setConnStatus("disconnected");
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // FIC: Check every 30s (EN)
    return () => clearInterval(interval);
  }, []);

  // FIC: Handle online/offline toggle (EN)
  // FIC: Manejar cambio online/offline (ES)
  const handleToggleOnline = async () => {
    const newMode = runtimeMode === "online" ? "offline" : "online";

    try {
      const response = await fetch("/api/runtime/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          mode: newMode,
          operationalMode,
        }),
      });

      if (!response.ok) {
        alert(`Failed to change mode: ${response.statusText}`);
        return;
      }

      setRuntimeMode(newMode as "online" | "offline");
      if (onModeChange) {
        onModeChange(newMode === "online", operationalMode);
      }

      // FIC: Show notification (EN)
      // FIC: Mostrar notificación (ES)
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  // FIC: Handle demo/real toggle (EN)
  // FIC: Manejar cambio demo/real (ES)
  const handleToggleOperationalMode = async () => {
    const newOpMode = operationalMode === "demo" ? "real" : "demo";

    // FIC: Warn user when switching to real mode (EN)
    // FIC: Advertir al usuario al cambiar a modo real (ES)
    if (newOpMode === "real") {
      const confirmed = window.confirm(
        "⚠️ You are about to switch to REAL TRADING mode.\n\n" +
          "Orders will be executed with real money.\n" +
          "Do you understand and accept the risks?"
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      const response = await fetch("/api/runtime/mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          mode: runtimeMode,
          operationalMode: newOpMode,
        }),
      });

      if (!response.ok) {
        alert(`Failed to change operational mode: ${response.statusText}`);
        return;
      }

      setOperationalMode(newOpMode);
      if (onModeChange) {
        onModeChange(runtimeMode === "online", newOpMode);
      }

      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 flex-wrap">
      {/* FIC: Connection status indicator (EN) */}
      {/* FIC: Indicador de estado de conexión (ES) */}
      <div className="flex items-center gap-2">
        {connStatus === "connected" ? (
          <>
            <Wifi className="text-green-600" size={16} />
            <span className="text-xs font-medium text-green-600">
              Connected
            </span>
          </>
        ) : connStatus === "disconnected" ? (
          <>
            <WifiOff className="text-red-600" size={16} />
            <span className="text-xs font-medium text-red-600">
              Offline
            </span>
          </>
        ) : (
          <>
            <Wifi className="text-gray-400" size={16} />
            <span className="text-xs font-medium text-gray-400">
              Checking...
            </span>
          </>
        )}
      </div>

      {/* FIC: Online/Offline toggle (EN) */}
      {/* FIC: Switch online/offline (ES) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">Mode:</span>
        <button
          className={`px-4 py-2 text-xs font-medium rounded transition-colors ${
            runtimeMode === "online"
              ? "bg-blue-500 text-white"
              : "bg-yellow-100 text-yellow-900 border border-yellow-300"
          }`}
          onClick={handleToggleOnline}
        >
          {runtimeMode === "online" ? "🔵 ONLINE" : "🟡 OFFLINE"}
        </button>
      </div>

      {/* FIC: Demo/Real toggle with warning (EN) */}
      {/* FIC: Switch demo/real con advertencia (ES) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600">Operational:</span>
        <button
          className={`px-4 py-2 text-xs font-medium rounded transition-colors flex items-center gap-2 ${
            operationalMode === "demo"
              ? "bg-green-100 text-green-900 border border-green-300"
              : "bg-red-100 text-red-900 border border-red-300"
          }`}
          onClick={handleToggleOperationalMode}
        >
          {operationalMode === "demo" ? (
            <>
              <Zap size={14} />
              🟢 DEMO
            </>
          ) : (
            <>
              <AlertCircle size={14} />
              🔴 REAL
            </>
          )}
        </button>
      </div>

      {/* FIC: Status notification (EN) */}
      {/* FIC: Notificación de estado (ES) */}
      {showWarning && (
        <div className="px-3 py-2 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 animate-pulse">
          ✓ Mode changed to{" "}
          {runtimeMode === "online" ? "ONLINE" : "OFFLINE"} •{" "}
          {operationalMode === "demo" ? "DEMO" : "REAL"}
        </div>
      )}

      {/* FIC: Disclaimer when in real mode (EN) */}
      {/* FIC: Descargo de responsabilidad en modo real (ES) */}
      {operationalMode === "real" && (
        <div className="px-3 py-2 bg-red-50 text-red-700 text-xs rounded border border-red-200 ml-auto">
          ⚠️ REAL TRADING: Ensure you understand all risks before approving
          orders.
        </div>
      )}
    </div>
  );
};

export default RuntimeModeSwitches;
