import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Radio, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LocationSearchPage() {
  const { locations, selectedLocation, setSelectedLocation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.catchment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (loc) => {
    setSelectedLocation(loc);
    navigate('/dashboard');
  };

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-4xl mx-auto">
      <section className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
          GEOSPATIAL DIRECTORY & MONITORING BASINS
        </span>
        <h1 className="font-display font-bold text-2xl text-on-surface">
          Select Location or Sensor Grid
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
          Switch active regional monitoring telemetry or jump directly into live disaster corridors.
        </p>

        {/* Search Input Box */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by district name, river basin, or state..."
            className="w-full bg-surface-container-lowest pl-10 pr-4 py-3 rounded-xl border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary shadow-xs"
            autoFocus
          />
        </div>
      </section>

      {/* Locations List */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
          Available Regional Networks ({filteredLocations.length})
        </span>

        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocation.id;
          return (
            <div
              key={loc.id}
              onClick={() => handleSelect(loc)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-surface-container-lowest border-primary shadow-sm ring-1 ring-primary/30'
                  : 'bg-surface-container-lowest/70 border-outline-variant/30 hover:bg-surface-container-lowest hover:border-primary/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary-container text-white' : 'bg-surface-container text-secondary'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-base text-on-surface">{loc.name}</h3>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      ({loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E)
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.2 rounded-full bg-primary-light text-primary font-mono text-[9px] font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                    {loc.state}, {loc.country} · <strong className="text-on-surface">{loc.catchment}</strong>
                  </p>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-on-surface-variant/80 mt-1">
                    <Radio className="w-3 h-3 text-secondary" />
                    <span>{loc.station}</span>
                    <span>·</span>
                    <span>Elevation {loc.elevation}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-primary-container hover:text-white text-on-surface font-sans text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <span>Select</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
