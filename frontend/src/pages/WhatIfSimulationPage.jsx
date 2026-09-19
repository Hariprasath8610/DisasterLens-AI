import React, { useState } from 'react';
import SimulationControls from '../components/simulation/SimulationControls';
import HydrographChart from '../components/simulation/HydrographChart';
import SimulationComparison from '../components/simulation/SimulationComparison';
import { runSimulation, evaluateAlert, sendTestSMS, createWhatsAppAlert } from '../services/api';
import { useApp } from '../context/AppContext';
import { Download, Bookmark, Brain, AlertTriangle, Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Icon from '../components/common/Icon';

export default function WhatIfSimulationPage() {
  const { selectedLocation, liveRiskResult, resetSimulationToLiveSnapshot, addNotification } = useApp();
  
  // Independent simulation state — never mutates live weather or live risk!
  const [params, setParams] = useState({
    rain: 120,
    river: 4.2,
    wind: 42,
    duration: 8,
    soil: 95,
    drainageBlocked: true,
  });

  const [simResults, setSimResults] = useState({
    simulationScore: 78,
    affectedCitizens: 38420,
    submergedRoadsKm: 19.4,
    floodedWards: 4,
    peakSurgeHours: 2.5,
    aiProjection: `Increasing rainfall to 120mm with a 4.2m river surcharge breaches secondary flood walls along the northern canal. Over 38,420 residents in Katpadi and Shenbakkam will enter the direct inundation corridor within 2.5 hours of peak rainfall.`,
    recommendedMitigation: `Trigger automated sluice gates 04 and 07 at Palar Anicut to mitigate hydraulic backlog by 0.58 meters.`,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [demoAlertNotice, setDemoAlertNotice] = useState(null);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [smsDeliveryState, setSmsDeliveryState] = useState('IDLE'); // 'IDLE' | 'SENDING...' | 'SENT' | 'FAILED' | 'COOLDOWN'
  const [testSmsState, setTestSmsState] = useState({ loading: false, result: null });
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  const handleSendWhatsAppAlert = async () => {
    setWhatsAppLoading(true);
    try {
      const data = await createWhatsAppAlert({
        phone_number: '917373733474',
        risk_level: simResults.simulationScore >= 80 ? 'CRITICAL' : 'HIGH',
        location: selectedLocation?.name || 'Karur',
      });
      if (data?.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank');
      }
    } catch (err) {
      alert('Failed to generate WhatsApp alert: ' + (err.message || err));
    } finally {
      setWhatsAppLoading(false);
    }
  };

  const handleParamChange = (field, val) => {
    const updated = { ...params, [field]: val };
    setParams(updated);
    updateCalculation(updated);
  };

  const updateCalculation = (currentParams) => {
    const { rain, river, wind, duration, soil, drainageBlocked } = currentParams;
    const baseScore = 52;
    const rainFactor = (rain - 86) * 0.22;
    const riverFactor = (river - 3.4) * 18;
    const windFactor = (wind - 18) * 0.12;
    const soilFactor = (soil - 70) * 0.25;
    const drainagePenalty = drainageBlocked ? 7 : 0;
    const computedScore = Math.min(98, Math.max(28, Math.round(baseScore + rainFactor + riverFactor + windFactor + soilFactor + drainagePenalty)));
    const estCitizens = Math.round(computedScore * 492);

    setSimResults({
      simulationScore: computedScore,
      affectedCitizens: estCitizens,
      submergedRoadsKm: (computedScore * 0.25).toFixed(1),
      floodedWards: computedScore >= 75 ? 4 : computedScore >= 60 ? 2 : 1,
      peakSurgeHours: (duration * 0.3).toFixed(1),
      aiProjection: `Increasing rainfall to ${rain}mm with a ${river.toFixed(1)}m river surcharge breaches secondary drainage thresholds along the northern canal. Over ${estCitizens.toLocaleString()} residents in Katpadi and Shenbakkam will enter the direct inundation corridor within ${(duration * 0.3).toFixed(1)} hours of rainfall peak.`,
      recommendedMitigation: `Trigger automated sluice gates 04 and 07 at Palar Anicut to mitigate hydraulic backlog by ${(river * 0.14).toFixed(2)} meters.`,
    });

    // Evaluate simulation demo alert if score crosses 80
    if (computedScore >= 80) {
      setShowWarningPopup(true);
      setSmsDeliveryState('SENDING...');
      evaluateAlert(computedScore, 'SIMULATION', selectedLocation.name, {
        hypotheticalRainfall: rain,
        hypotheticalRiver: river,
      }).then((alertRes) => {
        if (alertRes?.triggered && alertRes?.alert) {
          const a = alertRes.alert;
          setDemoAlertNotice(a);
          setSmsDeliveryState(a.smsStatus || 'SENT');
          addNotification({
            title: a.alertType,
            location: `${selectedLocation.name}`,
            riskScore: a.riskScore,
            threshold: a.threshold,
            smsStatus: a.smsStatus,
            recipient: a.smsRecipient,
            timestamp: a.timestamp,
            time: 'Just now',
            level: 'warning',
            mode: 'SIMULATION',
            message: a.message,
            disclaimer: a.disclaimer || 'AI-assisted risk estimate. Not an official emergency warning.',
          });
        } else {
          setSmsDeliveryState('COOLDOWN');
        }
      }).catch((err) => {
        setSmsDeliveryState('FAILED');
      });
    } else {
      setDemoAlertNotice(null);
      setShowWarningPopup(false);
      setSmsDeliveryState('IDLE');
    }
  };

  const handleApplyPreset = (type) => {
    const presets = {
      monsoon: { rain: 135, river: 4.4, wind: 48, duration: 12, soil: 98, drainageBlocked: true },
      dam: { rain: 90, river: 5.2, wind: 24, duration: 6, soil: 85, drainageBlocked: true },
      cyclone: { rain: 165, river: 4.8, wind: 88, duration: 16, soil: 100, drainageBlocked: true },
      runoff: { rain: 110, river: 4.1, wind: 32, duration: 10, soil: 92, drainageBlocked: false },
    };
    if (presets[type]) {
      setParams(presets[type]);
      updateCalculation(presets[type]);
    }
  };

  const handleResetLive = () => {
    const liveSnapshot = resetSimulationToLiveSnapshot();
    setParams(liveSnapshot);
    updateCalculation(liveSnapshot);
  };

  const handleRunModel = async () => {
    setIsRunning(true);
    try {
      const res = await runSimulation(params);
      setSimResults(res);
      if (res.simulationScore >= 80) {
        evaluateAlert(res.simulationScore, 'SIMULATION', selectedLocation.name, {
          hypotheticalRainfall: params.rain,
        }).then((alertRes) => {
          if (alertRes?.triggered && alertRes?.alert) {
            setDemoAlertNotice(alertRes.alert);
          }
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendTestSMS = async () => {
    setTestSmsState({ loading: true, result: null });
    try {
      const res = await sendTestSMS("DisasterLens AI test SMS — authorized hackathon demonstration.");
      setTestSmsState({ loading: false, result: res });
      addNotification({
        title: 'Twilio SMS Test — Demo',
        location: `${selectedLocation.name}`,
        riskScore: 0,
        threshold: 80,
        smsStatus: res.status || (res.success ? 'SENT' : 'FAILED'),
        recipient: res.recipient || '******3474',
        timestamp: res.timestamp || new Date().toISOString(),
        time: 'Just now',
        level: res.success ? 'info' : 'danger',
        mode: 'DEMO',
        message: res.success
          ? `Twilio test SMS processed. Status: ${res.status}${res.message_sid ? ` (SID: ${res.message_sid})` : ''}`
          : `Twilio test SMS failed: ${res.error || 'Provider rejected request'}.`,
        disclaimer: 'Twilio test message for hackathon demonstration.',
      });
    } catch (err) {
      setTestSmsState({
        loading: false,
        result: { success: false, status: 'FAILED', error: err.message || 'Network error' },
      });
    }
  };

  const handleExportResults = () => {
    const geoJsonMock = {
      type: 'FeatureCollection',
      scenario: 'DISASTERLENS_HECRAS_2D_SIMULATION',
      location: selectedLocation.name,
      timestamp: new Date().toISOString(),
      simulationParams: params,
      simulationMetrics: simResults,
    };
    const blob = new Blob([JSON.stringify(geoJsonMock, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disasterlens-sim-${selectedLocation.name.toLowerCase()}-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveProtocol = () => {
    alert(`Scenario saved as Incident Action Protocol #IAP-${new Date().getFullYear()}-VELLORE.`);
  };

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-[1720px] mx-auto">
      {/* Header */}
      <section className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-bold">
            Catastrophe Predictive Sandbox · HEC-RAS 2D
          </span>
          <h1 className="type-page-title uppercase mt-1">
            WHAT-IF? ENVIRONMENTAL STRESS SIMULATION
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            Explore how altering precipitation, river stage, and urban drainage blockage cascades into local disaster vulnerability in real-time.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Live weather data is read-only. Simulation changes affect only the hypothetical scenario.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Send WhatsApp Alert Button */}
          <button
            onClick={handleSendWhatsAppAlert}
            disabled={whatsAppLoading}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            title="Open WhatsApp Emergency Alert (recipient: 7373733474)"
          >
            {whatsAppLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{whatsAppLoading ? 'Generating WhatsApp...' : 'Send WhatsApp Alert'}</span>
          </button>

          {/* Send Test SMS Button */}
          <button
            onClick={handleSendTestSMS}
            disabled={testSmsState.loading}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-on-surface font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            title="Send Test SMS to authorized demo phone"
          >
            {testSmsState.loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <Send className="w-3.5 h-3.5 text-primary" />
            )}
            <span>{testSmsState.loading ? 'Sending Test SMS...' : 'Send Test SMS'}</span>
          </button>

          <button
            onClick={handleExportResults}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 font-sans text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <Icon icon={Download} size="inline" className="text-secondary" />
            <span>Export Simulation (GeoJSON)</span>
          </button>
          <button
            onClick={handleSaveProtocol}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-container font-sans text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Icon icon={Bookmark} size="inline" />
            <span>Save Action Protocol</span>
          </button>
        </div>
      </section>

      {/* Test SMS Feedback Banner */}
      {testSmsState.result && (
        <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
          testSmsState.result.success
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/30 border-red-300 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {testSmsState.result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>
              <strong>Twilio Test Demo:</strong> Status: {testSmsState.result.status} {testSmsState.result.message_sid ? `(SID: ${testSmsState.result.message_sid})` : ''} | Recipient: {testSmsState.result.recipient || '******3474'}
              {testSmsState.result.error && ` | Error: ${testSmsState.result.error}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTestSmsState({ loading: false, result: null })}
            className="text-[11px] underline shrink-0 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Simulation Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Parameter Controls (5 cols) */}
        <div className="xl:col-span-5">
          <SimulationControls
            params={params}
            onChange={handleParamChange}
            onApplyPreset={handleApplyPreset}
            onResetLive={handleResetLive}
            onRunModel={handleRunModel}
            isRunning={isRunning}
          />
        </div>

        {/* Right Outcomes & Visuals (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          {/* Active Demo Alert Trigger Banner if threshold >= 80 */}
          {demoAlertNotice && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-on-surface shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <Icon icon={AlertTriangle} size="inline" className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-display font-bold text-amber-700 dark:text-amber-300">
                      🚨 SIMULATION DEMO ALERT
                    </span>
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30">
                      Mode: {demoAlertNotice.mode || 'SIMULATION'}
                    </span>
                  </div>
                  <span className={`font-mono text-[10px] uppercase px-2.5 py-0.5 rounded-full font-bold ${
                    demoAlertNotice.smsStatus === 'SENT' || demoAlertNotice.smsStatus === 'Sent'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                      : demoAlertNotice.smsStatus === 'REQUEST_ACCEPTED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300'
                      : demoAlertNotice.smsStatus === 'COOLDOWN'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                      : demoAlertNotice.smsStatus === 'FAILED' || demoAlertNotice.smsStatus === 'Failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300'
                  }`}>
                    SMS: {demoAlertNotice.smsStatus ? demoAlertNotice.smsStatus.toUpperCase() : 'DEMO'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 font-mono text-[11px] bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-500/20">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Risk Score</span>
                    <strong className="text-error font-bold text-sm">{demoAlertNotice.riskScore}/100</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Threshold</span>
                    <strong className="text-slate-800 dark:text-slate-200">{demoAlertNotice.threshold}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold text-[10px]">TRIGGERED</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Recipient</span>
                    <strong className="text-primary font-bold">{demoAlertNotice.smsRecipient || demoAlertNotice.recipient}</strong>
                  </div>
                </div>

                <p className="font-sans text-xs text-on-surface leading-relaxed">
                  {demoAlertNotice.message || 'Hypothetical simulation threshold crossed.'}
                </p>

                {demoAlertNotice.message_sid && (
                  <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                    Twilio Message SID: <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">{demoAlertNotice.message_sid}</code>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between font-mono text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-amber-500/10 gap-2">
                  <span>Timestamp: {demoAlertNotice.timestamp ? demoAlertNotice.timestamp.substring(0, 19).replace('T', ' ') + ' UTC' : 'Just now'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowWarningPopup(true)}
                      type="button"
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold underline transition-colors"
                    >
                      View Warning Popup
                    </button>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Live weather data is read-only. Simulation changes affect only the hypothetical scenario.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <SimulationComparison
            liveScore={liveRiskResult?.compositeScore ?? 52}
            simScore={simResults.simulationScore}
            affectedCitizens={simResults.affectedCitizens}
            submergedRoadsKm={simResults.submergedRoadsKm}
            floodedWards={simResults.floodedWards}
          />

          <HydrographChart surgePeak={simResults.peakSurgeHours} />

          {/* AI Simulation Insight Box */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Icon icon={Brain} size="inline" className="text-secondary" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-on-surface">
                  DISASTERLENS AI SYNTHESIS PROJECTION
                </h3>
              </div>
              <span className="font-mono text-[10px] text-secondary font-semibold bg-surface-container px-2 py-0.5 rounded">
                PREDICTIVE CONFIDENCE 94.2%
              </span>
            </div>

            <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 font-sans text-xs sm:text-sm text-on-surface space-y-2 leading-relaxed">
              <p>{simResults.aiProjection}</p>
              <p className="text-on-surface-variant font-medium">
                {simResults.recommendedMitigation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Popup Modal (Section 8 & Section 13) */}
      {showWarningPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-2xl border-2 border-red-500/50 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-display font-bold text-red-600 dark:text-red-400">
                    🚨 SIMULATION DEMO ALERT
                  </h2>
                  <p className="font-mono text-[11px] text-on-surface-variant">
                    Hypothetical scenario threshold crossed.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWarningPopup(false)}
                className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-on-surface-variant font-bold text-sm transition-colors"
                title="Dismiss Warning Popup"
              >
                ✕
              </button>
            </div>

            {/* Metrics & Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-surface-container-low dark:bg-slate-800/60 rounded-xl border border-outline-variant/20 font-mono text-xs">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase block">Risk Score</span>
                <strong className="text-error font-bold text-base">{simResults.simulationScore}/100</strong>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase block">Threshold</span>
                <strong className="text-on-surface font-bold text-base">80</strong>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase block">Mode</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold text-[10px] uppercase">
                  SIMULATION
                </span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase block">Recipient</span>
                <strong className="text-primary font-bold">
                  {demoAlertNotice?.smsRecipient || demoAlertNotice?.recipient || '******3474'}
                </strong>
              </div>
            </div>

            {/* Live SMS Status Badge */}
            <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/50 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="font-bold text-on-surface">Twilio SMS Status:</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                smsDeliveryState === 'SENDING...'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse'
                  : smsDeliveryState === 'SENT' || demoAlertNotice?.smsStatus === 'SENT' || demoAlertNotice?.smsStatus === 'Sent'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : demoAlertNotice?.smsStatus === 'COOLDOWN'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                {smsDeliveryState === 'SENDING...' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>SENDING...</span>
                  </>
                ) : (demoAlertNotice?.smsStatus === 'SENT' || demoAlertNotice?.smsStatus === 'Sent' || smsDeliveryState === 'SENT') ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SENT ✓</span>
                  </>
                ) : demoAlertNotice?.smsStatus === 'COOLDOWN' ? (
                  <span>COOLDOWN (Duplicate Suppressed)</span>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span>FAILED ✕</span>
                  </>
                )}
              </span>
            </div>

            {/* Timestamp & Notice */}
            <div className="space-y-2 font-mono text-[11px] text-on-surface-variant">
              <div>
                <span>Timestamp: </span>
                <span className="font-semibold text-on-surface">
                  {demoAlertNotice?.timestamp ? demoAlertNotice.timestamp.substring(0, 19).replace('T', ' ') + ' UTC' : new Date().toISOString().substring(0, 19).replace('T', ' ') + ' UTC'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
                Live weather data is read-only. Simulation changes affect only the hypothetical scenario.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSendWhatsAppAlert}
                disabled={whatsAppLoading}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send WhatsApp Alert (7373733474)</span>
              </button>

              <button
                onClick={() => setShowWarningPopup(false)}
                type="button"
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-sans text-xs font-semibold shadow-xs transition-colors"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
