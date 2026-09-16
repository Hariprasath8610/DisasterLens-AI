import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';

// 10 Platform Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import LiveMapPage from './pages/LiveMapPage';
import RiskAnalysisPage from './pages/RiskAnalysisPage';
import HistoricalReplayPage from './pages/HistoricalReplayPage';
import WhatIfSimulationPage from './pages/WhatIfSimulationPage';
import AlertsPage from './pages/AlertsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import LocationSearchPage from './pages/LocationSearchPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/live-map" element={<LiveMapPage />} />
            <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
            <Route path="/historical-replay" element={<HistoricalReplayPage />} />
            <Route path="/simulation" element={<WhatIfSimulationPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/search" element={<LocationSearchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
