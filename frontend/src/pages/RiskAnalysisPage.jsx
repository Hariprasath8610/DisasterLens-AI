import React, { useState } from 'react';
import { Sparkles, Brain, HelpCircle, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import RiskGauge from '../components/common/RiskGauge';
import ShapAttributionBars from '../components/risk/ShapAttributionBars';
import MitigatingRecommendations from '../components/risk/MitigatingRecommendations';
import { sendAIChat } from '../services/api';
import { useApp } from '../context/AppContext';

export default function RiskAnalysisPage() {
  const { selectedLocation, riskData } = useApp();
  const [queryInput, setQueryInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResponse, setAnalysisResponse] = useState(null);

  const handleAskAI = async () => {
    if (!queryInput.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await sendAIChat({
        userQuery: queryInput,
        location: selectedLocation.name,
        disasterType: 'flood',
        rainfall: riskData.telemetry.rainfall.value,
        riverLevel: riskData.telemetry.riverLevel.value,
        soilSaturation: riskData.telemetry.soil.saturation,
        riskScore: riskData.compositeScore,
      });
      setAnalysisResponse(res.response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Context Ribbon */}
      <section className="w-full p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-mono text-[10px] uppercase font-bold">
              EXPLAINABLE AI ENGINE (XAI-V4)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-mono text-[10px] text-on-surface-variant font-medium">
              LIVE INFERENCE SYNCED: 2m ago
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            RISK INTELLIGENCE & EXPLAINABILITY
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-2xl">
            AI-generated causal decomposition of environmental variables, hydrological modeling, and confidence attribution.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs self-start md:self-auto">
          <div className="w-9 h-9 rounded-lg bg-error-container/50 flex items-center justify-center text-error">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col pr-2">
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">Target Basin</span>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-on-surface">{selectedLocation.name}</span>
              <span className="px-2 py-0.2 rounded-full bg-error-container text-on-error-container font-mono text-[10px] font-bold">
                Level 3 High
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Top Row: Dual Intelligence Metrics (Radial Gauge & SHAP Bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Composite Hazard Score & Gauge (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-on-surface font-bold">
                Composite Hazard Score
              </span>
              <span className="font-mono text-[9px] bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                ISO-DISASTER 22320
              </span>
            </div>

            <div className="py-4 flex justify-center">
              <RiskGauge score={riskData.compositeScore} size={210} />
            </div>
          </div>

          <div className="pt-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 flex flex-col gap-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant text-[10px] uppercase">Model Confidence</span>
              <span className="font-bold text-secondary">{riskData.confidence}% (High Precision)</span>
            </div>
            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div className="bg-secondary-container h-full rounded-full" style={{ width: `${riskData.confidence}%` }} />
            </div>
            <div className="flex items-center justify-between pt-1 text-on-surface-variant text-[10px]">
              <span>Architecture Ensemble:</span>
              <span className="font-semibold text-on-surface">{riskData.model}</span>
            </div>
          </div>
        </div>

        {/* Right: SHAP Factor Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <ShapAttributionBars />
        </div>
      </div>

      {/* Large AI Conversational Synthesis Card */}
      <div className="w-full p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary-container/20 border border-secondary/30 text-secondary flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-on-surface">
                DISASTERLENS AI EXPLANATION
              </h2>
              <span className="font-mono text-[10px] text-on-surface-variant">
                Natural Language Explainability Protocol (Synthesizer v2.4)
              </span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-secondary flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Validated against Palar Gauging Stations
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <span className="font-mono text-[9px] uppercase text-on-surface-variant">Investigated Query</span>
            <p className="font-display font-bold text-sm text-on-surface">
              "Why is {selectedLocation.name} categorized under High Risk today?"
            </p>
          </div>
        </div>

        <div className="font-sans text-xs sm:text-sm text-on-surface leading-relaxed space-y-2">
          <p>
            Hydrological telemetry indicates the <strong className="text-primary font-semibold">Palar Catchment</strong> has reached <span className="text-error font-semibold">84% antecedent soil saturation</span> following consecutive nocturnal rainfall. Upstream reservoir discharge (<span className="font-semibold">Ponnai Anicut</span>) is operating at <strong className="font-semibold">82% capacity</strong> with a +38% surcharge.
          </p>
          <p className="text-on-surface-variant">
            The spatial confluence of saturated hydric soil, depressed drainage velocity through urban Katpadi culverts, and an impending <strong>110mm convective rain band</strong> increases the likelihood of flash tributary overflow between <span className="font-mono font-semibold px-1 rounded bg-surface-container">18:00</span> and <span className="font-mono font-semibold px-1 rounded bg-surface-container">04:00 IST</span>.
          </p>
        </div>

        {/* Interactive Query Input Bar */}
        <div className="pt-2">
          <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 flex-1 px-2 text-on-surface-variant w-full">
              <Sparkles className="w-4 h-4 text-secondary" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                placeholder="Ask DisasterLens AI about this specific hazard (e.g. 'Simulate 2-hour rain break impact')..."
                className="w-full bg-transparent border-none outline-none font-sans text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/60"
              />
            </div>
            <button
              onClick={handleAskAI}
              disabled={isAnalyzing || !queryInput.trim()}
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary-container text-white font-display font-semibold text-xs disabled:opacity-50 hover:bg-primary transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI About This Risk</span>
                </>
              )}
            </button>
          </div>

          {analysisResponse && (
            <div className="mt-3 p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 font-sans text-xs text-on-surface space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-secondary font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>INFERENCE GENERATED</span>
              </div>
              <p className="leading-relaxed">{analysisResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mitigating Recommendations */}
      <MitigatingRecommendations />
    </div>
  );
}
