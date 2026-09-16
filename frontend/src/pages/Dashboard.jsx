import React from 'react';
import OperationsBar from '../components/dashboard/OperationsBar';
import MapView from '../components/map/MapView';
import TelemetryStrip from '../components/dashboard/TelemetryStrip';
import HistoricalAnalogueCard from '../components/dashboard/HistoricalAnalogueCard';
import ExplainableSummaryCard from '../components/dashboard/ExplainableSummaryCard';
import RiskGauge from '../components/common/RiskGauge';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { riskData } = useApp();

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-5 max-w-[1680px] mx-auto">
      {/* 1. Header Operations Bar */}
      <OperationsBar />

      {/* 2. Central Dominant MapView with Floating Risk Score Card */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md">
        <MapView height="100%" />

        {/* Floating Top-Left Current Risk Evaluation Card */}
        <div className="absolute top-4 left-4 z-[400] w-72 sm:w-84 bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-4 border border-outline-variant/30 shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <span className="type-label">
              CURRENT RISK EVALUATION
            </span>
            <span className="font-mono text-[9px] text-secondary font-semibold">
              LIVE COMPOSITE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <RiskGauge score={riskData.compositeScore} size={92} showLabel={false} />
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[9px] font-bold uppercase">
                  {riskData.tier}
                </span>
                <span className="font-mono text-[9px] text-error font-semibold">
                  {riskData.deltaPercent}
                </span>
              </div>
              <h3 className="type-card-title mt-0.5">
                {riskData.primaryThreat}
              </h3>
              <p className="font-sans text-[11px] text-on-surface-variant leading-tight">
                {riskData.threatSummary}
              </p>
            </div>
          </div>

          <p className="font-sans text-[11px] text-on-surface-variant bg-surface-container-low p-2 rounded-lg leading-relaxed border border-outline-variant/20">
            {riskData.details}
          </p>
        </div>
      </div>

      {/* 3. Telemetry Strip (5 Instrumented Sensor Pods) */}
      <TelemetryStrip />

      {/* 4. Bottom Asymmetric Analytical Row: Historical Analogue (5 cols) & AI Explainability (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <HistoricalAnalogueCard />
        </div>
        <div className="lg:col-span-7 flex flex-col">
          <ExplainableSummaryCard />
        </div>
      </div>
    </div>
  );
}
