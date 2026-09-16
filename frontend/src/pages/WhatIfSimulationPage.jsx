import React, { useState } from 'react';
import SimulationControls from '../components/simulation/SimulationControls';
import HydrographChart from '../components/simulation/HydrographChart';
import SimulationComparison from '../components/simulation/SimulationComparison';
import { runSimulation } from '../services/api';
import { useApp } from '../context/AppContext';
import { Download, Bookmark, Brain, CheckCircle2 } from 'lucide-react';
import Icon from '../components/common/Icon';

export default function WhatIfSimulationPage() {
  const { selectedLocation, riskData } = useApp();
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

  const handleParamChange = (field, val) => {
    const updated = { ...params, [field]: val };
    setParams(updated);
    // Instant client-side computation update
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
    const liveParams = { rain: 86, river: 3.4, wind: 18, duration: 4, soil: 72, drainageBlocked: false };
    setParams(liveParams);
    updateCalculation(liveParams);
  };

  const handleRunModel = async () => {
    setIsRunning(true);
    try {
      const res = await runSimulation(params);
      setSimResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportResults = () => {
    alert('Exporting simulation GeoJSON and NetCDF surface boundary layer package...');
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
        </div>

        <div className="flex items-center gap-2">
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
          <SimulationComparison
            liveScore={52}
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
    </div>
  );
}
