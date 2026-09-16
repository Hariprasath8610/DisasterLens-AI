import React from 'react';
import { TrendingUp, AlertTriangle, ShieldCheck, ShieldAlert, Users, Compass } from 'lucide-react';

export default function SimulationComparison({
  liveScore = 52,
  simScore = 78,
  affectedCitizens = 38420,
  submergedRoadsKm = 19.4,
  floodedWards = 4,
}) {
  const diff = simScore - liveScore;
  const isBreached = simScore >= 75;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-2.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h2 className="font-display font-bold text-sm uppercase tracking-tight text-on-surface">
            SIMULATION IMPACT ANALYSIS
          </h2>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface border border-outline-variant/20">
          Simulation Hash: 0x88F2A
        </span>
      </div>

      {/* Head-to-Head Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20">
        {/* Live Risk */}
        <div className="md:col-span-4 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-on-surface-variant font-medium">
              Current Live Baseline
            </span>
            <span className="w-2 h-2 rounded-full bg-secondary" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-on-surface">{liveScore}</span>
            <span className="font-mono text-xs text-on-surface-variant">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-secondary font-mono text-[10px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Moderate Baseline</span>
          </div>
        </div>

        {/* Transition Delta Badge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-1">
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">
            Cascading Influx
          </span>
          <div
            className={`mt-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold tracking-tight ${
              diff >= 0 ? 'bg-error-container text-on-error-container animate-pulse' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {diff >= 0 ? `▲ +${diff} PTS — ${isBreached ? 'BREACH' : 'SURGE'}` : `▼ ${Math.abs(diff)} PTS — CONTAINED`}
          </div>
        </div>

        {/* Simulated Outcome */}
        <div className="md:col-span-4 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase text-on-surface-variant font-medium">
              Simulated Outcome
            </span>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-error">{simScore}</span>
            <span className="font-mono text-xs text-on-surface-variant">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-error font-mono text-[10px] font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isBreached ? 'CRITICAL HIGH RISK' : 'ELEVATED THREAT'}</span>
          </div>
        </div>
      </div>

      {/* Quantitative Impact Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">At-Risk Citizens</span>
          <span className="font-display text-xl font-bold text-error mt-1">
            {affectedCitizens.toLocaleString()}
          </span>
          <span className="font-sans text-[10px] text-on-surface-variant mt-0.5">+14.8 km² submerged extent</span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Submerged Roads</span>
          <span className="font-display text-xl font-bold text-on-surface mt-1">
            {submergedRoadsKm} km
          </span>
          <span className="font-sans text-[10px] text-on-surface-variant mt-0.5">NH-48 Bypass Inundated</span>
        </div>

        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">Inundated Wards</span>
          <span className="font-display text-xl font-bold text-error mt-1">
            {floodedWards} Wards
          </span>
          <span className="font-sans text-[10px] text-on-surface-variant mt-0.5">Katpadi, Shenbakkam, Ward 09, 18</span>
        </div>
      </div>
    </div>
  );
}
