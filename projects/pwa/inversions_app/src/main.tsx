/**
 * ============================================================================
 * main.tsx
 * ============================================================================
 *
 * FIC: React entry point with React Router v7, 4 routes, and MainLayout wrapper.
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { MainDashboard } from "./features/dashboard/MainDashboard";
import { MainLayout } from "./layouts/MainLayout";
import { InstitutionalAnalysisPage } from "./pages/institutional/InstitutionalAnalysisPage";
import { RegulatoryPositionsPage } from "./pages/institutional/RegulatoryPositionsPage";
import { CoverageStrategiesPage } from "./pages/coverage/CoverageStrategiesPage";
import { AIChatPage } from "./pages/ai/AIChatPage";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element no encontrado");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<MainDashboard />} />
          <Route path="institutional/analysis" element={<InstitutionalAnalysisPage />} />
          <Route path="institutional/positions" element={<RegulatoryPositionsPage />} />
          <Route path="coverage/strategies" element={<CoverageStrategiesPage />} />
          <Route path="ai/chat" element={<AIChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
