import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, HelpCircle, ArrowUp, AlertCircle, Droplet, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ExplainableSummaryCard() {
  const { selectedLocation, riskData } = useApp();
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {/* Header with Synthesis Model Tag */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-2xs">
              <Brain className="w-4 h-4" />
            </div>
            <h2 className="font-display font-semibold text-sm text-on-surface tracking-tight">
              DISASTERLENS AI · EXPLAINABLE INTELLIGENCE
            </h2>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-secondary font-mono text-[10px] font-semibold border border-outline-variant/20">
            <span>SYNTHESIS MODEL V4.2</span>
          </div>
        </div>

        {/* Investigated Question Banner */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
          <HelpCircle className="w-4 h-4 text-primary shrink-0" />
          <span className="font-display text-xs sm:text-sm text-on-surface font-semibold">
            Why is risk increasing in {selectedLocation.name}?
          </span>
        </div>

        {/* Natural Language Synthesis Body */}
        <p className="font-sans text-xs sm:text-sm text-on-surface leading-relaxed">
          Current precipitation and Doppler radar forecast conditions indicate severe water accumulation potential in low-lying sub-basins. Palar River discharge has surged 38%, while antecedent soil saturation is at 84%. Historical 2021 event correlation predicts flash inundation within 4 to 6 hours.
        </p>

        {/* Contributing Telemetry Driving Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-error-container text-on-error-container font-mono text-[10px] font-bold border border-error/20">
            <ArrowUp className="w-3 h-3" />
            <span>Rainfall ↑ 82%</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-highest text-primary font-mono text-[10px] font-bold border border-primary/20">
            <AlertCircle className="w-3 h-3" />
            <span>Forecast Severity ↑ 88%</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-mono text-[10px] font-bold border border-outline-variant/30">
            <Droplet className="w-3 h-3 text-secondary" />
            <span>Soil Saturation 84%</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-mono text-[10px] font-bold border border-secondary/30">
            <TrendingUp className="w-3 h-3" />
            <span>Palar River +38%</span>
          </div>
        </div>
      </div>

      {/* Action CTAs */}
      <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/risk-analysis"
          className="inline-flex items-center gap-1 text-primary hover:text-secondary font-display text-xs font-semibold transition-colors"
        >
          <span>View Full Deep-Dive Analysis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-assistant"
            className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-sans text-xs font-medium border border-outline-variant/30 transition-colors shadow-2xs"
          >
            Ask AI Assistant
          </Link>
          <button
            onClick={() => navigate('/simulation')}
            className="px-3 py-1.5 rounded-lg bg-primary-container text-white hover:bg-primary font-sans text-xs font-semibold transition-colors shadow-xs"
            type="button"
          >
            Run What-If Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
