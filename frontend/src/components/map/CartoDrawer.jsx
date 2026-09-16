import React from 'react';
import { Layers, Sliders, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CartoDrawer() {
  const {
    layerVisibility,
    toggleLayer,
    vectorOpacity,
    setVectorOpacity,
    elevationSlice,
    setElevationSlice,
    activeDisasterType,
    setActiveDisasterType,
  } = useApp();

  return (
    <div className="w-80 bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/30 shadow-lg rounded-xl p-4 flex flex-col gap-4 max-h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-sm text-on-surface">Carto Intelligence</h2>
        </div>
        <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-medium">
          EPSG:4326
        </span>
      </div>

      {/* Hazard Selector Switcher */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
          Active Hazard Domain
        </span>
        <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-1 rounded-lg">
          {['flood', 'cyclone', 'landslide'].map((type) => (
            <button
              key={type}
              onClick={() => setActiveDisasterType(type)}
              type="button"
              className={`py-1 text-center rounded font-mono text-[11px] font-medium capitalize transition-all ${
                activeDisasterType === type
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles Stack */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
          Data Layer Stack
        </span>

        <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layerVisibility.riskVectors}
              onChange={() => toggleLayer('riskVectors')}
              className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
            />
            <span className="font-sans text-xs text-on-surface font-medium">Risk Field Vector</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-error" />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layerVisibility.dopplerMesh}
              onChange={() => toggleLayer('dopplerMesh')}
              className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
            />
            <span className="font-sans text-xs text-on-surface font-medium">Doppler Rainfall Mesh</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-secondary-container" />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layerVisibility.riverBasins}
              onChange={() => toggleLayer('riverBasins')}
              className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
            />
            <span className="font-sans text-xs text-on-surface font-medium">Rivers & Hydro Basins</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-primary" />
        </label>

        <label className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={layerVisibility.evacuationRoutes}
              onChange={() => toggleLayer('evacuationRoutes')}
              className="w-3.5 h-3.5 rounded text-primary accent-primary cursor-pointer"
            />
            <span className="font-sans text-xs text-on-surface font-medium">Road & Evacuation Routes</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-tertiary" />
        </label>
      </div>

      {/* Sliders: Vector Opacity & Elevation Slice */}
      <div className="flex flex-col gap-3 pt-2 bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/20">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-mono text-[10px] text-on-surface-variant">
            <span>Vector Mesh Opacity</span>
            <span className="font-semibold text-on-surface">{vectorOpacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={vectorOpacity}
            onChange={(e) => setVectorOpacity(Number(e.target.value))}
            className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center font-mono text-[10px] text-on-surface-variant">
            <span>Elevation Threshold Slice</span>
            <span className="font-semibold text-on-surface">+{elevationSlice}m MSL</span>
          </div>
          <input
            type="range"
            min="50"
            max="350"
            value={elevationSlice}
            onChange={(e) => setElevationSlice(Number(e.target.value))}
            className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Ticker diagnostics */}
      <div className="p-2 rounded-lg bg-surface-container flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-secondary" />
          <span>Mesh refresh rate</span>
        </div>
        <span className="text-on-surface font-semibold">1.2s live sync</span>
      </div>
    </div>
  );
}
