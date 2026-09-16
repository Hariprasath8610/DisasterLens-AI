import React from 'react';

export default function RiskGauge({ score = 72, size = 180, showLabel = true }) {
  // Total circumference for r=50 is 2 * Math.PI * 50 = 314.16
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (score / 100) * circumference;

  let strokeColor = '#059669'; // low
  let tierLabel = 'LOW RISK';
  let badgeBg = 'bg-risk-low/10 text-risk-low border-risk-low/20';

  if (score >= 75) {
    strokeColor = '#ba1a1a';
    tierLabel = 'CRITICAL RISK';
    badgeBg = 'bg-error-container text-on-error-container border-error/30';
  } else if (score >= 60) {
    strokeColor = '#ea580c';
    tierLabel = 'HIGH RISK';
    badgeBg = 'bg-orange-100 text-orange-800 border-orange-200';
  } else if (score >= 35) {
    strokeColor = '#d97706';
    tierLabel = 'MODERATE';
    badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Ambient radial glow */}
        <div
          className="absolute inset-4 rounded-full blur-xl opacity-20 pointer-events-none"
          style={{ backgroundColor: strokeColor }}
        />

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="#eff4ff"
            strokeWidth="9"
          />
          {/* Progress Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Decorative inner dotted ring */}
          <circle
            cx="60"
            cy="60"
            r="38"
            fill="transparent"
            stroke="#bdc8cb"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            opacity="0.4"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant font-medium">Index</span>
          <div className="flex items-baseline gap-0.5 leading-none mt-0.5">
            <span className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight">{score}</span>
            <span className="font-mono text-xs text-on-surface-variant font-medium">/100</span>
          </div>
          <span className={`mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${badgeBg}`}>
            {tierLabel}
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="w-full max-w-[200px] flex items-center justify-between mt-2 font-mono text-[10px] text-on-surface-variant">
          <span>0 Low</span>
          <span>40 Mod</span>
          <span className="text-orange-600 font-semibold">60+ High</span>
          <span className="text-red-600 font-semibold">75+ Crit</span>
        </div>
      )}
    </div>
  );
}
