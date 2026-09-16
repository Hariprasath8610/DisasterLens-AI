import React, { useState } from 'react';
import { History, Calendar, GitCompare, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { HISTORICAL_EVENTS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import Icon from '../components/common/Icon';

export default function HistoricalReplayPage() {
  const { selectedLocation } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(HISTORICAL_EVENTS[0]);

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <section className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="icon-chip w-7 h-7 bg-primary/10 text-primary"><Icon icon={History} size="inline" /></span>
            <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider">
              MULTI-DECADE CATASTROPHE REPLAY ARCHIVE
            </span>
          </div>
          <h1 className="type-page-title mt-1">
            Historical Replay & Event Analogues
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Compare live atmospheric and hydrological signatures in {selectedLocation.name} with historical benchmark catastrophe events to predict peak lead times.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Events (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
            Calibrated Past Flood Signatures
          </span>

          {HISTORICAL_EVENTS.map((evt) => {
            const isSelected = evt.id === selectedEvent.id;
            return (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-surface-container-lowest border-primary shadow-sm ring-1 ring-primary/20'
                    : 'bg-surface-container-lowest/60 border-outline-variant/20 hover:bg-surface-container-lowest hover:border-outline-variant/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-on-surface-variant">
                  <Icon icon={Calendar} size="inline" className="text-secondary" />
                    <span>{evt.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-mono text-[10px] font-bold">
                    {evt.correlationWithCurrent} Correlation
                  </span>
                </div>

                <h3 className="font-display font-bold text-sm text-on-surface mt-2">
                  {evt.name}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant mt-1 line-clamp-2">
                  {evt.impactSummary}
                </p>

                <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between font-mono text-[10px]">
                  <span>Peak: <strong className="text-on-surface">{evt.peakLevel}</strong></span>
                  <span>Rainfall: <strong className="text-primary">{evt.rainfall24h}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Event Detail & Vector Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-primary font-bold">
                ACTIVE ANALOGUE PROFILE
              </span>
              <h2 className="font-display font-bold text-lg text-on-surface mt-0.5">
                {selectedEvent.name}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary-container text-white font-mono text-xs font-bold shadow-2xs">
              {selectedEvent.correlationWithCurrent} Live Match
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-center">
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant">Historical Peak</span>
              <p className="text-lg font-bold text-on-surface mt-1">{selectedEvent.peakLevel}</p>
              <span className="text-[9px] text-error font-medium">+1.4m over normal</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant">24h Precipitation</span>
              <p className="text-lg font-bold text-primary mt-1">{selectedEvent.rainfall24h}</p>
              <span className="text-[9px] text-secondary font-medium">Excess Monsoon</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[10px] text-on-surface-variant">Evacuation Lead Time</span>
              <p className="text-lg font-bold text-secondary mt-1">5.4 hrs</p>
              <span className="text-[9px] text-on-surface-variant font-medium">To Katpadi Breach</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-on-surface">
              Documented Impact Analysis & Lessons Learned
            </h4>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
              {selectedEvent.impactSummary} During this historical event, failure to trigger early sluice gate mitigation at upstream dams concentrated excess head within the Otteri stream corridor, leaving underpasses flooded for 36 hours.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
            <Icon icon={ShieldCheck} size="control" className="text-emerald-700 mt-0.5" />
            <div>
              <h5 className="font-display font-bold text-xs text-emerald-900">
                Actionable Countermeasure for Current 2026 Cycle
              </h5>
              <p className="font-sans text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Early discharge throttling at Ponnai Anicut 4 hours prior to forecasted peak rain can suppress hydraulic head by up to 0.7m, keeping Ward 12 drainage within operable limits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
