// FIC: Indicators menu and search modal component
// FIC: Componente menú de indicadores y modal de búsqueda

import React, { useState, useEffect } from "react";
import { Search, X, TrendingUp, Settings } from "lucide-react";

interface Indicator {
  id: string;
  name: string;
  category: string;
  description?: string;
  available: boolean;
}

interface IndicatorsMenuProps {
  onIndicatorsSelected?: (indicators: Indicator[]) => void;
  maxVisibleQuick?: number;
}

// FIC: IndicatorsMenu component with 3-item quick access + overflow modal (EN)
// FIC: Componente IndicatorsMenu con 3 accesos rápidos + modal de desbordamiento (ES)
export const IndicatorsMenu: React.FC<IndicatorsMenuProps> = ({
  onIndicatorsSelected,
  maxVisibleQuick = 3,
}) => {
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<Indicator[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // FIC: Load indicators from API or backend (EN)
  // FIC: Cargar indicadores desde API o backend (ES)
  useEffect(() => {
    const loadIndicators = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/indicators/catalog");
        if (!response.ok) {
          throw new Error("Failed to load indicators");
        }

        const data = await response.json();
        setAllIndicators(data.indicators || []);
      } catch (err) {
        console.error("Failed to load indicators:", err);
      } finally {
        setLoading(false);
      }
    };

    loadIndicators();
  }, []);

  // FIC: Filter indicators based on search (EN)
  // FIC: Filtrar indicadores según búsqueda (ES)
  const filteredIndicators = allIndicators.filter(
    (ind) =>
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // FIC: Handle indicator selection (EN)
  // FIC: Manejar selección de indicador (ES)
  const handleSelectIndicator = (indicator: Indicator) => {
    const isSelected = selectedIndicators.some((ind) => ind.id === indicator.id);

    const updated = isSelected
      ? selectedIndicators.filter((ind) => ind.id !== indicator.id)
      : [...selectedIndicators, indicator];

    setSelectedIndicators(updated);

    if (onIndicatorsSelected) {
      onIndicatorsSelected(updated);
    }
  };

  // FIC: Quick access indicators (first N) (EN)
  // FIC: Indicadores de acceso rápido (primeros N) (ES)
  const quickAccessIndicators = allIndicators.slice(0, maxVisibleQuick);

  return (
    <div className="flex items-center gap-2">
      {/* FIC: Quick access buttons (EN) */}
      {/* FIC: Botones de acceso rápido (ES) */}
      {quickAccessIndicators.map((ind) => (
        <button
          key={ind.id}
          className={`px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-2 ${
            selectedIndicators.some((s) => s.id === ind.id)
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleSelectIndicator(ind)}
          title={ind.description}
        >
          <TrendingUp size={14} />
          {ind.name}
        </button>
      ))}

      {/* FIC: Overflow menu button (EN) */}
      {/* FIC: Botón menú de desbordamiento (ES) */}
      {allIndicators.length > maxVisibleQuick && (
        <button
          className="px-3 py-2 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          onClick={() => setShowModal(true)}
          title="More indicators"
        >
          ⋯
        </button>
      )}

      {/* FIC: Search and selection modal (EN) */}
      {/* FIC: Modal de búsqueda y selección (ES) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-lg">Technical Indicators</h2>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* FIC: Search bar (EN) */}
            {/* FIC: Barra de búsqueda (ES) */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search indicators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {/* FIC: Indicators list (EN) */}
            {/* FIC: Lista de indicadores (ES) */}
            <div className="flex-1 overflow-auto px-6 py-4">
              {loading ? (
                <div className="text-center py-4 text-gray-500">
                  Loading indicators...
                </div>
              ) : filteredIndicators.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No indicators found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredIndicators.map((ind) => {
                    const isSelected = selectedIndicators.some(
                      (s) => s.id === ind.id
                    );
                    return (
                      <button
                        key={ind.id}
                        className={`p-3 rounded border-2 transition-all text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        } ${!ind.available ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() =>
                          ind.available && handleSelectIndicator(ind)
                        }
                        disabled={!ind.available}
                      >
                        <div className="font-semibold text-sm">{ind.name}</div>
                        <div className="text-xs text-gray-500">
                          {ind.category}
                        </div>
                        {ind.description && (
                          <div className="text-xs text-gray-600 mt-1">
                            {ind.description}
                          </div>
                        )}
                        {!ind.available && (
                          <div className="text-xs text-red-500 mt-1">
                            Unavailable in offline mode
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FIC: Footer with selection count (EN) */}
            {/* FIC: Pie con contador de selección (ES) */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <span className="text-sm text-gray-600">
                {selectedIndicators.length} indicator
                {selectedIndicators.length !== 1 ? "s" : ""} selected
              </span>
              <button
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600"
                onClick={() => setShowModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorsMenu;
