import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Users, Zap, Hospital, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AreaDossier({ onClose }) {
  const { selectedLocation, riskData, addNotification } = useApp();
  const navigate = useNavigate();

  const handleNotifyEmergency = () => {
    addNotification({
      title: `Emergency Broadcast Dispatched: ${selectedLocation.name}`,
      location: `${selectedLocation.zone} (Critical Runoff Alert)`,
      level: 'danger',
    });
    alert(`Emergency advisory transmitted to State Disaster Response Authority for ${selectedLocation.name}.`);
  };

  return (
    <div className="w-96 bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/30 shadow-xl rounded-xl p-4 flex flex-col gap-4 overflow-y-auto max-h-full">
      {/* Dossier Header */}
      <div className="flex items-start justify-between border-b border-outline-variant/20 pb-2.5">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary font-semibold">
            SELECTED AREA DOSSIER
          </span>
          <h3 className="font-display font-bold text-lg text-on-surface leading-snug">
            {selectedLocation.name}
          </h3>
          <span className="font-sans text-xs text-on-surface-variant">
            {selectedLocation.state} · {selectedLocation.zone}
          </span>
        </div>
        <button
          type="button"
          className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          title="Save to Priority Watchlist"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Risk Metric Hero Card */}
      <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/20 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-mono text-[9px] uppercase font-semibold text-on-error-container">
            Compound Risk Level
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display text-3xl font-bold text-error leading-none">
              {riskData.compositeScore}
            </span>
            <span className="font-mono text-xs text-on-error-container">/ 100</span>
          </div>
          <span className="font-mono text-[10px] text-error font-medium mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error" /> Severe Threat Threshold
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="px-2.5 py-1 rounded-full bg-error text-white font-mono text-[10px] uppercase tracking-wider font-semibold shadow-2xs">
            HIGH RISK
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant mt-2 text-right">
            Confidence: {riskData.confidence}%
          </span>
        </div>
      </div>

      {/* Real-time telemetry summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col">
          <span className="font-mono text-[9px] text-on-surface-variant">Rainfall</span>
          <span className="font-display text-sm font-semibold text-on-surface mt-0.5">86 mm</span>
          <span className="font-mono text-[9px] text-secondary font-medium mt-0.5">+22mm/24h</span>
        </div>
        <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col">
          <span className="font-mono text-[9px] text-on-surface-variant">Palar Basin</span>
          <span className="font-display text-sm font-semibold text-error mt-0.5">3.4 m</span>
          <span className="font-mono text-[9px] text-error font-medium mt-0.5">+0.8m / 6h</span>
        </div>
        <div className="p-2 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col">
          <span className="font-mono text-[9px] text-on-surface-variant">Runoff Sat.</span>
          <span className="font-display text-sm font-semibold text-on-surface mt-0.5">91%</span>
          <span className="font-mono text-[9px] text-on-surface-variant mt-0.5">Hydric Peak</span>
        </div>
      </div>

      {/* Exposed demographics */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
          Exposed Demographics
        </span>
        <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-primary" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-on-surface">
                {selectedLocation.population.toLocaleString()}
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant">
                Across {selectedLocation.vulnerableWards} vulnerable wards
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono text-[10px] text-on-surface font-medium">
            8.4k Eld/Child
          </span>
        </div>
      </div>

      {/* Critical infrastructure list */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
          Critical Infrastructure at Risk
        </span>
        <div className="space-y-1.5 font-sans text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-error" />
              <span className="font-medium text-on-surface">2 Electrical Substations</span>
            </div>
            <span className="font-mono text-[10px] text-error font-medium">Water +0.4m</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <Hospital className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-on-surface">1 Regional Medical Center</span>
            </div>
            <span className="font-mono text-[10px] text-primary font-medium">Standby Mode</span>
          </div>
        </div>
      </div>

      {/* Riverbed cross-section SVG */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">
          Riverbed Cross Section Datum
        </span>
        <div className="w-full h-14 bg-surface-container-low rounded-lg p-2 relative overflow-hidden flex items-end border border-outline-variant/20">
          <svg className="w-full h-10" preserveAspectRatio="none" viewBox="0 0 200 40">
            <path d="M0,35 Q30,35 60,30 T100,28 T140,8 T170,5 T200,5" fill="none" stroke="#6e797c" strokeWidth="1.5" />
            <polygon fill="#00ccf9" fillOpacity="0.35" points="0,40 0,35 80,31 110,31 110,40" />
            <line stroke="#ba1a1a" strokeDasharray="2,2" strokeWidth="1" x1="0" x2="110" y1="31" y2="31" />
          </svg>
          <span className="absolute top-1 left-2 font-mono text-[9px] text-error font-medium">
            Warning Threshold: 3.0m
          </span>
          <span className="absolute bottom-1 right-2 font-mono text-[9px] text-on-surface-variant">
            {selectedLocation.elevation}m MSL
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1 mt-auto">
        <button
          onClick={() => navigate('/risk-analysis')}
          type="button"
          className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
        >
          <span>Analyze Area Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleNotifyEmergency}
          type="button"
          className="w-full py-1.5 px-3 rounded-xl bg-error/10 hover:bg-error/20 text-error font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-error/20"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Notify Emergency Services</span>
        </button>
      </div>
    </div>
  );
}
