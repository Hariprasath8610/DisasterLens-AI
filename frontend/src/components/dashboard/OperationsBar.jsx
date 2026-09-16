import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Radio, Download, Share2, FlaskConical, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function OperationsBar() {
  const { selectedLocation, autoSyncTime } = useApp();
  const navigate = useNavigate();

  const handleExportPDF = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Incident Briefing Link copied to clipboard.');
    }
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Location, Coordinates & Vital Status */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping" />
          <h1 className="type-section-title uppercase">
            LOCAL RISK INTELLIGENCE
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px] border border-outline-variant/30">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            <span>
              {selectedLocation.name}, {selectedLocation.state} ({selectedLocation.lat}° N · {selectedLocation.lng}° E)
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low text-primary font-mono text-[10px] border border-primary/20">
            <Radio className="w-3 h-3 text-primary animate-pulse" />
            <span>{selectedLocation.station.split(' (')[0]}</span>
          </div>
        </div>
      </div>

      {/* Action Triggers & Auto-Sync Stream */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-lg font-mono text-[11px] text-on-surface-variant border border-outline-variant/20">
          <span className="w-2 h-2 rounded-full bg-secondary-container" />
          <span>Monitoring Live Conditions</span>
          <span className="text-outline-variant">·</span>
          <span className="text-secondary font-semibold">Auto-sync in {autoSyncTime}s</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg font-sans text-xs text-on-surface hover:bg-surface-container-high transition-all border border-outline-variant/30 shadow-2xs"
            type="button"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Export Report (PDF)</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-lg font-sans text-xs text-on-surface hover:bg-surface-container-high transition-all border border-outline-variant/30 shadow-2xs"
            type="button"
          >
            <Share2 className="w-3.5 h-3.5 text-secondary" />
            <span>Share Briefing</span>
          </button>

          <button
            onClick={() => navigate('/simulation')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-container text-white font-sans text-xs font-semibold rounded-lg shadow-xs hover:bg-primary transition-all"
            type="button"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Trigger Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
