// FIC: Watchlist tree component with dynamic instrument categories
// FIC: Componente árbol de watchlist con categorías dinámicas de instrumentos

import React, { useState, useEffect } from "react";
import { ChevronRight, Star, Plus, X } from "lucide-react";
import { useSignalStore } from "../../store/signals";
import { getAuthHeaders } from "../../services/signals/signalApi";

interface WatchlistCategory {
  id: string;
  name: string;
  icon?: string;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  category: string;
  isFavorite: boolean;
}

interface TreeNodeProps {
  category: WatchlistCategory;
  items: WatchlistItem[];
  isExpanded: boolean;
  onToggle: (categoryId: string) => void;
  onSelectItem: (item: WatchlistItem) => void;
  onAddItem: (categoryId: string) => void;
  onRemoveItem: (itemId: string) => void;
  selectedSymbol?: string;
}

// FIC: Tree node component for each category (EN)
// FIC: Componente nodo de árbol para cada categoría (ES)
const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  items,
  isExpanded,
  onToggle,
  onSelectItem,
  onAddItem,
  onRemoveItem,
  selectedSymbol,
}) => {
  return (
    <div className="mb-2">
      {/* Category header */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded"
        onClick={() => onToggle(category.id)}
      >
        <ChevronRight
          size={16}
          className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
        <span className="font-semibold text-sm">{category.name}</span>
        <span className="text-xs text-gray-500 ml-auto">({items.length})</span>
        <button
          className="p-1 hover:bg-blue-100 rounded"
          onClick={(e) => {
            e.stopPropagation();
            onAddItem(category.id);
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* FIC: Collapsed items list (EN) */}
      {/* FIC: Lista de items colapsada (ES) */}
      {isExpanded && (
        <div className="ml-4 border-l border-gray-200">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-2 px-3 py-2 cursor-pointer rounded text-sm transition-colors ${
                selectedSymbol === item.symbol
                  ? "bg-blue-50 text-blue-900 font-semibold"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
              onClick={() => onSelectItem(item)}
            >
              {/* FIC: Favorite star toggle (EN) */}
              {/* FIC: Botón de estrella favorita (ES) */}
              <button
                className="p-0 hover:text-yellow-500"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Toggle favorite
                }}
              >
                <Star
                  size={14}
                  fill={item.isFavorite ? "currentColor" : "none"}
                  className={item.isFavorite ? "text-yellow-500" : ""}
                />
              </button>

              {/* Symbol and name */}
              <span className="flex-1 font-mono">{item.symbol}</span>
              <span className="text-xs text-gray-500 truncate">{item.name}</span>

              {/* FIC: Remove button (EN) */}
              {/* FIC: Botón de eliminar (ES) */}
              <button
                className="p-0 hover:text-red-500 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveItem(item.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// FIC: Main WatchlistTree component (EN)
// FIC: Componente principal WatchlistTree (ES)
export const WatchlistTree: React.FC = () => {
  const [categories, setCategories] = useState<WatchlistCategory[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedSymbol, setSelectedSymbol] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setSelectedInstrument } = useSignalStore();

  // FIC: Load categories and watchlist from API (EN)
  // FIC: Cargar categorías y watchlist desde API (ES)
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);

        // FIC: Fetch catalog categories (EN)
        // FIC: Obtener categorías del catálogo (ES)
        const categoriesResponse = await fetch("/api/catalogs/instruments", {
          headers: getAuthHeaders(),
        });
        if (!categoriesResponse.ok) {
          throw new Error("Failed to load instrument categories");
        }
        const categoriesData = await categoriesResponse.json();

        // FIC: Fetch user watchlist items (EN)
        // FIC: Obtener items de watchlist del usuario (ES)
        const watchlistResponse = await fetch("/api/watchlist", {
          headers: getAuthHeaders(),
        });
        if (!watchlistResponse.ok) {
          throw new Error("Failed to load watchlist");
        }
        const watchlistData = await watchlistResponse.json();

        setCategories(categoriesData.categories || []);
        setWatchlistItems(watchlistData.items || []);
      } catch (err) {
        setError((err as Error).message);
        console.error("Watchlist load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  // FIC: Toggle category expansion (EN)
  // FIC: Alternar expansión de categoría (ES)
  const handleToggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // FIC: Handle item selection (EN)
  // FIC: Manejar selección de item (ES)
  const handleSelectItem = (item: WatchlistItem) => {
    setSelectedSymbol(item.symbol);
    setSelectedInstrument({
      symbol: item.symbol,
      name: item.name,
      category: item.category,
    });
  };

  // FIC: Handle adding new item to watchlist (EN)
  // FIC: Manejar agregar nuevo item a watchlist (ES)
  const handleAddItem = async (categoryId: string) => {
    const symbol = prompt("Enter symbol (e.g., AAPL, GC=F):");
    if (!symbol) return;

    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          symbol,
          category: categoryId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const newItem = await response.json();
      setWatchlistItems([...watchlistItems, newItem]);
    } catch (err) {
      alert(`Error adding item: ${(err as Error).message}`);
    }
  };

  // FIC: Handle removing item from watchlist (EN)
  // FIC: Manejar eliminar item de watchlist (ES)
  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/watchlist/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      setWatchlistItems(watchlistItems.filter((item) => item.id !== itemId));
    } catch (err) {
      alert(`Error removing item: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading watchlist...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* FIC: Header (EN) */}
      {/* FIC: Encabezado (ES) */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="font-bold text-lg">Watchlist</h2>
        <p className="text-xs text-gray-500 mt-1">
          {watchlistItems.length} instruments
        </p>
      </div>

      {/* FIC: Categories tree (EN) */}
      {/* FIC: Árbol de categorías (ES) */}
      <div className="flex-1 overflow-auto p-3">
        {categories.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No categories available
          </div>
        ) : (
          categories.map((category) => {
            // FIC: Filter items for this category (EN)
            // FIC: Filtrar items para esta categoría (ES)
            const categoryItems = watchlistItems.filter(
              (item) => item.category === category.id
            );

            return (
              <TreeNode
                key={category.id}
                category={category}
                items={categoryItems}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={handleToggleCategory}
                onSelectItem={handleSelectItem}
                onAddItem={handleAddItem}
                onRemoveItem={handleRemoveItem}
                selectedSymbol={selectedSymbol}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default WatchlistTree;
