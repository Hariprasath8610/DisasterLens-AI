import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Layers, MapPin, Activity, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
  const { selectedLocation, autoSyncTime, notifications } = useApp();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 shadow-xs">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 min-w-[260px]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt="DisasterLens AI"
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-on-surface leading-none">
                DisasterLens <span className="text-primary-container">AI</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant font-medium mt-0.5">
                See Risk. Understand. Act.
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Location Search Bar */}
        <div className="flex-1 max-w-lg mx-auto hidden md:flex items-center justify-center">
          <button
            onClick={() => navigate('/search')}
            type="button"
            className="w-full flex items-center justify-between px-3.5 py-1.5 bg-surface rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-low transition-all shadow-2xs group"
          >
            <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-on-surface">
              <Search className="w-4 h-4 text-secondary" />
              <span className="font-sans text-xs">
                Search district, basin, or coordinates... ({selectedLocation.name})
              </span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant border border-outline-variant/30">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Live Telemetry Status, Alerts, Profile */}
        <div className="flex items-center gap-3">
          {/* Live system chip */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-secondary uppercase tracking-wider">
              SYSTEM LIVE
            </span>
            <span className="text-outline-variant">|</span>
            <span className="font-mono text-[10px] text-on-surface-variant">
              {selectedLocation.lat}°N · {selectedLocation.lng}°E
            </span>
            <span className="text-outline-variant">|</span>
            <span className="font-mono text-[10px] text-primary font-medium">
              14ms
            </span>
          </div>

          {/* Action icon buttons */}
          <div className="flex items-center gap-1">
            <Link
              to="/alerts"
              className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
              title="Active Early Warning Alerts"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white font-mono text-[9px] flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </Link>

            <Link
              to="/live-map"
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
              title="Interactive Live Earth Map"
            >
              <Layers className="w-4 h-4" />
            </Link>
          </div>

          {/* Analyst profile chip */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-outline-variant/30">
            <div className="flex flex-col text-right hidden sm:flex leading-tight">
              <span className="font-sans text-xs font-semibold text-on-surface">Dr. Elena Vance</span>
              <span className="font-mono text-[10px] text-on-surface-variant">Chief Catastrophe Analyst</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-display font-semibold text-xs ring-2 ring-surface-container-highest shadow-2xs">
              EV
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
