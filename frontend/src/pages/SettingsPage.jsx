import React, { useState } from 'react';
import { Settings, Save, Server, Sliders, Bell, Globe, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api');
  const [syncInterval, setSyncInterval] = useState('15');
  const [thresholdLevel, setThresholdLevel] = useState('standard');
  const [aiProvider, setAiProvider] = useState('hydronet');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-4xl mx-auto">
      <section className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
            SYSTEM ARCHITECTURE & PROTOCOLS
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Platform Settings
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
          Configure API telemetry streaming, physics solver parameters, and AI model routing.
        </p>
      </section>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Backend API Configuration */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2.5">
            <Server className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-sm text-on-surface">
              Backend Service Gateway
            </h3>
          </div>

          <div className="space-y-2 font-sans text-xs">
            <label className="font-semibold text-on-surface block">FastAPI Server Endpoint</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full max-w-md bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30 font-mono text-xs text-on-surface focus:outline-none focus:border-primary"
            />
            <p className="text-on-surface-variant text-[11px]">
              Default local endpoint: <code>http://localhost:8000/api</code>
            </p>
          </div>
        </div>

        {/* Telemetry Polling & Sensitivity */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2.5">
            <Sliders className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-sm text-on-surface">
              Telemetry Polling & Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface block">Auto-Sync Refresh Interval</label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="5">Every 5 Seconds (High Fidelity)</option>
                <option value="15">Every 15 Seconds (Default)</option>
                <option value="60">Every 60 Seconds (Low Bandwidth)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-on-surface block">Early Warning Threshold Sensitivity</label>
              <select
                value={thresholdLevel}
                onChange={(e) => setThresholdLevel(e.target.value)}
                className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="standard">Standard ISO-22320 (Score 75+)</option>
                <option value="conservative">Conservative Trigger (Score 65+)</option>
                <option value="strict">Strict Alarm (Score 55+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Synthesis Model Engine */}
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2.5">
            <Globe className="w-4 h-4 text-secondary" />
            <h3 className="font-display font-bold text-sm text-on-surface">
              AI Risk Synthesis Architecture
            </h3>
          </div>

          <div className="space-y-1.5 font-sans text-xs">
            <label className="font-semibold text-on-surface block">Model Backend</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value)}
              className="w-full max-w-md bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="hydronet">HydroNet-v4 + ECMWF Local Physics Ensemble</option>
              <option value="gemini">Google Gemini 1.5 Flash (Cloud LLM Reasoning)</option>
              <option value="hybrid">Hybrid Physics-LLM Multi-Agent Pipeline</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-primary-container hover:bg-primary text-white font-display font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>

          {isSaved && (
            <span className="font-mono text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Configuration saved successfully.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
