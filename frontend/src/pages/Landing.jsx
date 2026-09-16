import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Globe, Activity, FlaskConical, ArrowRight, Radio, Sparkles, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const { selectedLocation } = useApp();

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-surface text-on-surface">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient Topographic Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-secondary-container/20 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40 font-mono text-[11px] text-primary font-semibold mb-6">
          <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
          <span>REAL-TIME EARTH RISK INTELLIGENCE PLATFORM</span>
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl tracking-tight text-on-surface max-w-4xl leading-tight">
          See Risk. Understand Risk. <br className="hidden sm:inline" />
          <span className="text-primary-container">Act Before Catastrophe.</span>
        </h1>

        <p className="mt-6 font-sans text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          DisasterLens AI combines multi-spectral satellite telemetry, hydrodynamic physical simulations, and explainable neural networks to safeguard communities against flooding, cyclones, and landslip events.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl bg-primary-container text-white font-display font-semibold text-sm hover:bg-primary shadow-sm flex items-center gap-2 transition-all"
          >
            <span>Launch Operational Command Deck</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/live-map"
            className="px-6 py-3 rounded-xl bg-surface-container-lowest text-on-surface font-display font-semibold text-sm hover:bg-surface-container border border-outline-variant/40 shadow-xs flex items-center gap-2 transition-all"
          >
            <Globe className="w-4 h-4 text-secondary" />
            <span>Explore Live Earth Map</span>
          </Link>
        </div>

        {/* Live Vellore Basin Status Snapshot Card */}
        <div className="mt-14 w-full max-w-4xl bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-md text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
                ACTIVE MONITORING BENCHMARK
              </span>
              <h2 className="font-display font-bold text-xl text-on-surface mt-0.5">
                {selectedLocation.name}, {selectedLocation.state}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-mono text-xs font-bold border border-error/20">
                LEVEL 3 HIGH RISK (72/100)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 font-mono">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase">Rainfall 24h</span>
              <p className="text-base font-bold text-on-surface mt-0.5">86 mm (+24mm)</p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase">Palar Basin Stage</span>
              <p className="text-base font-bold text-error mt-0.5">3.4 m (Alert 3.8m)</p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase">Exposed Population</span>
              <p className="text-base font-bold text-on-surface mt-0.5">142,500 Citizens</p>
            </div>
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase">Historical Match</span>
              <p className="text-base font-bold text-secondary mt-0.5">88.4% (Nov 2021)</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-on-surface">Interactive GIS Hazards</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              High-resolution vector cartography overlaying live radar meshes, riverbed cross-sections, and evacuation corridors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-on-surface">Explainable XAI Synthesis</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Shapley additive attributions deconstruct composite threat indexes into understandable causal environmental factors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-base text-on-surface">What-If Stress Simulations</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Adjust rainfall, dam discharge, and drainage siltation to simulate flash surge curves and civilian displacement ahead of time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
