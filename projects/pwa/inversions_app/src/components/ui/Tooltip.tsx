/**
 * ============================================================================
 * Tooltip.tsx
 * ============================================================================
 *
 * Styled tooltip component with fade-in animation and status-colored accents.
 * Replaces native <span title="..."> tooltips with a custom dark-themed popover.
 *
 * Usage:
 *   <Tooltip text="Datos frescos · Confianza: 85%" accent="ok">
 *     <span className="badge">OK</span>
 *   </Tooltip>
 */

import React, { useState, useRef, useEffect, type ReactNode } from "react";

export type TooltipAccent = "ok" | "cached" | "skipped" | "error";

interface TooltipProps {
  text: string;
  accent?: TooltipAccent;
  children: ReactNode;
}

const ACCENT_COLORS: Record<TooltipAccent, string> = {
  ok: "var(--color-buy)",
  cached: "var(--color-hold)",
  skipped: "var(--color-hold)",
  error: "var(--color-sell)"
};

const TOOLTIP_STYLES: Record<string, React.CSSProperties> = {
  wrapper: {
    position: "relative",
    display: "inline-flex"
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 8px)",
    right: "0",
    zIndex: 1000,
    minWidth: "200px",
    maxWidth: "360px",
    padding: "0.6rem 0.75rem",
    background: "var(--color-surface-raised)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    fontSize: "0.75rem",
    lineHeight: 1.5,
    color: "var(--color-text)",
    pointerEvents: "none",
    animation: "tooltip-fade-in 0.15s ease-out"
  }
};

export function Tooltip({ text, accent = "ok", children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!visible) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  return (
    <div
      ref={wrapperRef}
      style={TOOLTIP_STYLES.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && text && (
        <div
          role="tooltip"
          style={{
            ...TOOLTIP_STYLES.tooltip,
            borderLeft: `3px solid ${ACCENT_COLORS[accent] ?? ACCENT_COLORS.ok}`
          }}
        >
          {text}
        </div>
      )}

    </div>
  );
}
