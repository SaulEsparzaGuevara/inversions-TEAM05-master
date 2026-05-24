// FIC: Metadata-driven confluence table synchronized with chart marker selection.
// FIC: Tabla de confluencia metadata-driven sincronizada con seleccion de marcadores del chart.

import React, { useEffect, useMemo, useState } from "react";
import { useSignalStore, type SelectedSignal } from "../../store/signals";

interface ColumnConfig {
  field_key: string;
  label: string;
  data_type: "string" | "number" | "boolean" | "timestamp" | "json" | "enum";
  visible: boolean;
  order_index: number;
}

interface SignalRow {
  id: string;
  symbol: string;
  direction: string;
  confidence: number;
  timestamp: number;
  metadata: Record<string, unknown>;
}

interface ConfluenceSignalsTableProps {
  symbol?: string;
}

function formatCellValue(value: unknown, dataType: ColumnConfig["data_type"]): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (dataType === "number") {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) {
      return "-";
    }
    return numberValue.toFixed(2);
  }

  if (dataType === "boolean") {
    return value ? "Yes" : "No";
  }

  if (dataType === "timestamp") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
  }

  if (dataType === "json") {
    return JSON.stringify(value);
  }

  return String(value);
}

function valueFromRow(row: SignalRow, key: string): unknown {
  if (key === "symbol") return row.symbol;
  if (key === "direction") return row.direction;
  if (key === "confidence") return row.confidence;
  if (key === "timestamp") return new Date(row.timestamp * 1000).toISOString();
  return row.metadata[key];
}

export function ConfluenceSignalsTable({ symbol }: ConfluenceSignalsTableProps) {
  const [columns, setColumns] = useState<ColumnConfig[]>([]);
  const [rows, setRows] = useState<SignalRow[]>([]);
  const [filter, setFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"all" | "buy" | "sell">("all");
  const { selectedSignal, setSelectedSignal } = useSignalStore();

  useEffect(() => {
    const loadColumns = async () => {
      const response = await fetch("/api/dashboard/confluence-columns");
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setColumns((data.columns ?? []).filter((column: ColumnConfig) => column.visible));
    };

    void loadColumns();
  }, []);

  useEffect(() => {
    const loadSignals = async () => {
      const query = new URLSearchParams();
      if (symbol) {
        query.set("symbol", symbol);
      }

      const response = await fetch(`/api/signals/confluence?${query.toString()}`);
      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setRows(data.signals ?? []);
    };

    void loadSignals();
  }, [symbol]);

  const visibleColumns = useMemo(() => {
    if (columns.length > 0) {
      return [...columns].sort((a, b) => a.order_index - b.order_index);
    }

    return [
      { field_key: "symbol", label: "Symbol", data_type: "string", visible: true, order_index: 1 },
      { field_key: "direction", label: "Direction", data_type: "enum", visible: true, order_index: 2 },
      { field_key: "confidence", label: "Confidence", data_type: "number", visible: true, order_index: 3 },
      { field_key: "timestamp", label: "Timestamp", data_type: "timestamp", visible: true, order_index: 4 }
    ] as ColumnConfig[];
  }, [columns]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const byDirection = directionFilter === "all" || row.direction === directionFilter;
      const byText = filter.length === 0 || row.symbol.toLowerCase().includes(filter.toLowerCase());
      return byDirection && byText;
    });
  }, [rows, directionFilter, filter]);

  return (
    <section className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <h2>Confluence Signals</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter symbol"
            style={{ width: 140 }}
          />
          <select value={directionFilter} onChange={(event) => setDirectionFilter(event.target.value as "all" | "buy" | "sell")}> 
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
      </div>

      <div style={{ maxHeight: 380, overflow: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)" }}>
        <table>
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.field_key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const active = selectedSignal?.id === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedSignal(row as SelectedSignal)}
                  style={{
                    cursor: "pointer",
                    background: active ? "rgba(255, 212, 59, 0.2)" : undefined
                  }}
                >
                  {visibleColumns.map((column) => {
                    const value = valueFromRow(row, column.field_key);
                    return (
                      <td key={column.field_key} title={typeof value === "string" ? value : undefined}>
                        {formatCellValue(value, column.data_type)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ConfluenceSignalsTable;
