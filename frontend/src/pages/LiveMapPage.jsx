import React, { useState } from 'react';
import { Play, Pause, Clock, Radio } from 'lucide-react';
import MapView from '../components/map/MapView';
import CartoDrawer from '../components/map/CartoDrawer';
import AreaDossier from '../components/map/AreaDossier';
import { useApp } from '../context/AppContext';

export default function LiveMapPage() {
  const { selectedLocation } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeStep, setTimeStep] = useState(100);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      {/* Top Command & Scrubber Controller Ribbon */}
      <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30 px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 z-30 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
            <h1 className="font-display font-bold text-sm tracking-tight text-on-surface uppercase">
              LIVE EARTH HAZARD MAP
            </h1>
          </div>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-mono text-[10px] uppercase font-semibold">
            ORBITAL: SENTINEL-1C / RADARSAT-2
          </span>
        </div>

        {/* Temporal Scrubber Control */}
        <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/20 w-full md:w-auto justify-between">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            type="button"
            className="w-7 h-7 rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-2xs"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <div className="flex flex-col min-w-[160px]">
            <div className="flex justify-between items-center font-mono text-[9px] text-on-surface-variant">
              <span>T - 04:00</span>
              <span className="text-primary font-semibold">LIVE (T-00:00)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={timeStep}
              onChange={(e) => setTimeStep(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] text-on-surface-variant pl-2 border-l border-outline-variant/30">
            <Clock className="w-3.5 h-3.5 text-secondary" />
            <span>09:42:18 IST</span>
          </div>
        </div>
      </div>

      {/* Main Map Canvas Area with Floating Drawers */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <MapView height="100%" />

        {/* Floating Left Layer Stack Drawer */}
        <div className="absolute left-4 top-4 bottom-4 z-[400] pointer-events-auto hidden lg:flex flex-col">
          <CartoDrawer />
        </div>

        {/* Floating Right Selected Area Dossier */}
        <div className="absolute right-4 top-4 bottom-4 z-[400] pointer-events-auto hidden md:flex flex-col">
          <AreaDossier />
        </div>
      </div>
    </div>
  );
}
