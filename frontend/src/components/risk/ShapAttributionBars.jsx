import React from 'react';
import { GitFork } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ShapAttributionBars() {
  const { riskData } = useApp();
  const { shapFactors } = riskData;

  const handleDownloadTensor = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Variable,Observed,Threshold,ShapleyWeight\n" +
      shapFactors.map(f => `${f.id},"${f.title}","${f.observed}","${f.threshold}",${f.weight}%`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "DisasterLens_Correlation_Tensor.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold text-sm text-on-surface">
              Factor Contribution Breakdown
            </h2>
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase font-medium bg-surface-container px-2 py-0.5 rounded">
            Shapley Additive Attribution
          </span>
        </div>

        <p className="font-sans text-xs text-on-surface-variant mb-4">
          Algorithmic weighting of real-time variables driving the threat escalation over the next 24 hours.
        </p>

        {/* Factor Bars */}
        <div className="flex flex-col gap-3">
          {shapFactors.map((factor) => (
            <div
              key={factor.id}
              className="p-2.5 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low border border-outline-variant/20 transition-colors"
            >
              <div className="flex items-center justify-between font-sans text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary">0{factor.id}</span>
                  <span className="font-semibold text-on-surface">{factor.title}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-on-surface-variant">
                    {factor.observed} · {factor.threshold}
                  </span>
                  <span className="font-bold text-red-600">{factor.weight}%</span>
                </div>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${factor.weight}%`,
                    backgroundColor: factor.color || '#007b8c',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between font-mono text-[10px] text-on-surface-variant">
        <span>*Calculated across 42 geodetic sensory telemetry feeds</span>
        <button
          onClick={handleDownloadTensor}
          type="button"
          className="text-secondary font-semibold hover:underline"
        >
          Download Correlation Tensor CSV
        </button>
      </div>
    </div>
  );
}
