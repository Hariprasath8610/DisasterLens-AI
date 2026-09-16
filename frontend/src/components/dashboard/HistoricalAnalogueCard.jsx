import React from 'react';
import { History, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function HistoricalAnalogueCard() {
  const { riskData } = useApp();
  const { historicalAnalogue, infrastructureAtRisk } = riskData;

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          <h2 className="font-mono text-xs uppercase tracking-wider text-on-surface-variant font-bold">
            HISTORICAL EVENT ANALOGUE
          </h2>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-semibold">
          {historicalAnalogue.event}
        </span>
      </div>

      {/* Correlation Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between font-sans text-xs">
          <span className="text-on-surface-variant">Correlation with 2021 Flash Flood:</span>
          <span className="font-bold text-on-surface font-mono">{historicalAnalogue.correlation}% Match</span>
        </div>
        <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-1000"
            style={{ width: `${historicalAnalogue.correlation}%` }}
          />
        </div>
      </div>

      {/* 3-Column Metric Grid */}
      <div className="grid grid-cols-3 gap-2 p-2.5 bg-surface-container-low/60 rounded-lg text-center font-mono border border-outline-variant/20">
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant">Historical Peak</span>
          <span className="text-sm text-on-surface font-bold">{historicalAnalogue.historicalPeak}</span>
        </div>
        <div className="flex flex-col border-x border-outline-variant/20">
          <span className="text-[10px] text-on-surface-variant">Runoff Delta</span>
          <span className="text-sm text-error font-bold">{historicalAnalogue.runoffDelta}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-on-surface-variant">Lead Time</span>
          <span className="text-sm text-secondary font-bold">{historicalAnalogue.leadTime}</span>
        </div>
      </div>

      {/* Infrastructure Watchpoints */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
          Critical Infrastructure at Risk
        </span>
        <div className="space-y-1.5 font-sans text-xs">
          {infrastructureAtRisk.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low border border-outline-variant/20">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-error" />
                <span className="font-medium text-on-surface truncate max-w-[190px]">{item.name}</span>
              </div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold">
                {item.status.split(' (')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-1 mt-auto border-t border-outline-variant/20">
        <Link
          to="/historical-replay"
          className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-secondary transition-colors"
        >
          <span>Explore Multi-Year Disaster Replay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
