import React from "react";
import { Outlet, Link } from "react-router-dom";

export const MainLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside className="card" style={{
        width: "250px",
        margin: "1rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        height: "fit-content"
      }}>
        <h2 style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Navegación
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Link to="/" style={{ color: "var(--color-text)", textDecoration: "none", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "block" }}>Dashboard</Link>
          <Link to="/institutional/analysis" style={{ color: "var(--color-text)", textDecoration: "none", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "block" }}>Análisis Institucional</Link>
          <Link to="/institutional/positions" style={{ color: "var(--color-text)", textDecoration: "none", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "block" }}>Posiciones Reg.</Link>
          <Link to="/coverage/strategies" style={{ color: "var(--color-text)", textDecoration: "none", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "block" }}>Coberturas</Link>
          <Link to="/ai/chat" style={{ color: "var(--color-text)", textDecoration: "none", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "block" }}>Chat IA</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "1rem 1rem 1rem 0" }}>
        <Outlet />
      </main>
    </div>
  );
};
