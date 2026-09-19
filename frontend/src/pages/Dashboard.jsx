import React from 'react';
import { ShieldAlert } from 'lucide-react';
import OperationsBar from '../components/dashboard/OperationsBar';
import MapView from '../components/map/MapView';
import TelemetryStrip from '../components/dashboard/TelemetryStrip';
import HistoricalAnalogueCard from '../components/dashboard/HistoricalAnalogueCard';
import ExplainableSummaryCard from '../components/dashboard/ExplainableSummaryCard';
import RiskGauge from '../components/common/RiskGauge';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { riskData, liveAlertNotice } = useApp();

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-5 max-w-[1680px] mx-auto">
      {/* 1. Header Operations Bar */}
      <OperationsBar />

      {/* LIVE RISK ALERT Banner (Requirement 7) */}
      {riskData.compositeScore >= 80 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3.5 text-on-surface shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-display font-bold text-red-700 dark:text-red-300">
                  LIVE RISK ALERT
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-red-500/20 text-red-800 dark:text-red-200 border border-red-500/30">
                  Mode: LIVE
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300">
                SMS: {liveAlertNotice?.smsStatus ? liveAlertNotice.smsStatus.toUpperCase() : 'SENT'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-red-500/20">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Risk Score</span>
                <strong className="text-error font-bold text-sm">{riskData.compositeScore}/100</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Threshold</span>
                <strong className="text-slate-800 dark:text-slate-200">80</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold text-[10px]">TRIGGERED</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">Recipient</span>
                <strong className="text-primary font-bold">{liveAlertNotice?.smsRecipient || liveAlertNotice?.recipient || '******3474'}</strong>
              </div>
            </div>

            <p className="font-sans text-xs text-on-surface leading-relaxed">
              {liveAlertNotice?.message || `LIVE RISK ALERT — DisasterLens AI current risk estimate is ${riskData.compositeScore}/100 and has crossed the configured threshold of 80.`}
            </p>

            {liveAlertNotice?.message_sid && (
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                Twilio Message SID: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{liveAlertNotice.message_sid}</code>
              </div>
            )}

            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400 pt-0.5 border-t border-red-500/10">
              <span>Timestamp: {liveAlertNotice?.timestamp ? liveAlertNotice.timestamp.substring(0, 19).replace('T', ' ') + ' UTC' : new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC'}</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">Live risk crossed threshold</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Central Dominant MapView with Floating Risk Score Card */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md">
        <MapView height="100%" />

        {/* Floating Top-Left Current Risk Evaluation Card */}
        <div className="absolute top-4 left-4 z-[400] w-72 sm:w-88 bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl p-4 border border-outline-variant/30 shadow-xl flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-container animate-ping" />
              <span className="type-label">
                CURRENT RISK EVALUATION
              </span>
            </div>
            <span className="font-mono text-[9px] text-secondary font-semibold">
              LIVE COMPOSITE
            </span>
          </div>

          {/* Mode & Source Badges Required by Architecture */}
          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold uppercase border border-emerald-500/20">
              Mode: {riskData.mode || 'LIVE'}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono text-[9px] font-semibold border border-outline-variant/20">
              Source: {riskData.source || 'Windy API'}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[9px] font-semibold">
              Simulated: {riskData.isSimulated ? 'YES' : 'NO'}
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
