import React from 'react';
import { Droplet, Waves, Wind, Clock, Layers, Sliders, Play, RotateCcw } from 'lucide-react';

export default function SimulationControls({
  params,
  onChange,
  onApplyPreset,
  onResetLive,
  onRunModel,
  isRunning,
}) {
  return (
    <section className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-secondary" />
          <h2 className="font-display font-bold text-sm uppercase tracking-tight text-on-surface">
            HYDRO-METEOROLOGICAL CONTROLS
          </h2>
        </div>
        <span className="font-mono text-[9px] bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded border border-outline-variant/20 uppercase font-semibold">
          Parametric Input Deck
        </span>
      </div>

      <p className="font-sans text-xs text-on-surface-variant">
        Adjust hydrological boundary variables to dynamically recalculate catchment flood plains, backwater profiles, and runoff rates.
      </p>

      {/* Preset Buttons Strip */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <button
          onClick={() => onApplyPreset('monsoon')}
          type="button"
          className="px-2.5 py-1 rounded-lg text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 font-mono text-[10px] font-semibold transition-all"
        >
          🌧️ Monsoon (+50%)
        </button>
        <button
          onClick={() => onApplyPreset('dam')}
          type="button"
          className="px-2.5 py-1 rounded-lg text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 font-mono text-[10px] font-semibold transition-all"
        >
          🌊 Dam Surcharge
        </button>
        <button
          onClick={() => onApplyPreset('cyclone')}
          type="button"
          className="px-2.5 py-1 rounded-lg text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 font-mono text-[10px] font-semibold transition-all"
        >
          🌀 Cyclone Landfall
        </button>
        <button
          onClick={() => onApplyPreset('runoff')}
          type="button"
          className="px-2.5 py-1 rounded-lg text-on-surface bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/20 font-mono text-[10px] font-semibold transition-all"
        >
          ⛰️ High Runoff
        </button>
        <button
          onClick={onResetLive}
          type="button"
          className="px-2.5 py-1 rounded-lg text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-mono text-[10px] font-semibold transition-all ml-auto flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Live</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="space-y-3 pt-1">
        {/* 1. Rainfall */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-secondary" />
              <label className="font-display font-semibold text-xs text-on-surface">Rainfall Intensity</label>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="font-bold text-primary">{params.rain} mm/24h</span>
              <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold text-[9px]">
                {Math.round(((params.rain - 86) / 86) * 100) >= 0 ? '+' : ''}
                {Math.round(((params.rain - 86) / 86) * 100)}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min="40"
            max="220"
            value={params.rain}
            onChange={(e) => onChange('rain', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
            <span>40mm (Calm)</span>
            <span>Live: 86mm</span>
            <span>220mm (Torrential)</span>
          </div>
        </div>

        {/* 2. River Surcharge */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-secondary" />
              <label className="font-display font-semibold text-xs text-on-surface">River Level / Upstream</label>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={`font-bold ${params.river >= 3.8 ? 'text-error' : 'text-primary'}`}>
                {params.river.toFixed(1)} m {params.river >= 3.8 ? '— Danger' : ''}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-semibold text-[9px]">
                {(params.river - 3.4 >= 0 ? '+' : '') + (params.river - 3.4).toFixed(1)}m
              </span>
            </div>
          </div>
          <input
            type="range"
            min="1.5"
            max="6.0"
            step="0.1"
            value={params.river}
            onChange={(e) => onChange('river', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
            <span>1.5m</span>
            <span>Threshold: 3.8m</span>
            <span>6.0m (Breach)</span>
          </div>
        </div>

        {/* 3. Wind Velocity */}
        <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-secondary" />
              <label className="font-display font-semibold text-xs text-on-surface">Wind Velocity & Gusts</label>
            </div>
            <span className="font-mono text-[11px] font-bold text-primary">{params.wind} km/h</span>
          </div>
          <input
            type="range"
            min="10"
            max="110"
            value={params.wind}
            onChange={(e) => onChange('wind', Number(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
            <span>10 km/h</span>
            <span>Live: 18 km/h</span>
            <span>110 km/h (Gale)</span>
          </div>
        </div>

        {/* 4. Duration & Soil Saturation */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 space-y-1">
            <div className="flex justify-between font-sans text-xs">
              <span className="font-semibold text-on-surface">Storm Span</span>
              <span className="font-mono font-bold text-primary">{params.duration}h</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={params.duration}
              onChange={(e) => onChange('duration', Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 space-y-1">
            <div className="flex justify-between font-sans text-xs">
              <span className="font-semibold text-on-surface">Soil Saturation</span>
              <span className="font-mono font-bold text-error">{params.soil}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              value={params.soil}
              onChange={(e) => onChange('soil', Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Drainage Blockage Toggle */}
        <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-display font-semibold text-xs text-on-surface">
              Include Urban Drainage Blockage (30%)
            </span>
            <span className="font-sans text-[10px] text-on-surface-variant">
              Factor in stormwater siltation along NH-48 & Otteri Nullah
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={params.drainageBlocked}
              onChange={(e) => onChange('drainageBlocked', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
          </label>
        </div>
      </div>

      {/* Model Trigger Button */}
      <div className="pt-2">
        <button
          onClick={onRunModel}
          disabled={isRunning}
          type="button"
          className="w-full py-3 px-4 rounded-xl bg-primary-container text-white hover:bg-primary font-display font-semibold text-xs tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Hydrodynamic Matrices...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Stress Simulation Model</span>
            </>
          )}
        </button>
        <span className="mt-1.5 block text-center font-mono text-[9px] text-on-surface-variant">
          Physics solver: Saint-Venant 2D unsteady shallow water equations
        </span>
      </div>
    </section>
  );
}
