import React from 'react';

export default function TelemetryCard({
  title,
  value,
  unit,
  icon: Icon,
  delta,
  deltaType = 'danger', // danger, warning, success, neutral
  subtext,
  progress,
  progressColor = 'bg-primary-container',
  trend,
  className = '',
}) {
  const deltaColors = {
    danger: 'bg-error-container text-on-error-container',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-800',
    neutral: 'bg-surface-container text-on-surface-variant',
  };

  return (
    <div className={`bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between text-on-surface-variant mb-2">
        <span className="font-mono text-[11px] uppercase tracking-wider font-semibold">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-secondary" />}
      </div>

      {/* Main Metric & Delta */}
      <div className="flex items-baseline justify-between my-1">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold text-on-surface">{value}</span>
          {unit && <span className="font-sans text-sm text-on-surface-variant font-normal">{unit}</span>}
        </div>
        {delta && (
          <span className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${deltaColors[deltaType] || deltaColors.neutral}`}>
            {delta}
          </span>
        )}
      </div>

      {/* Progress bar if present */}
      {progress !== undefined && (
        <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
          <div className={`${progressColor} h-full rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
      )}

      {/* Trend sparkline if present */}
      {trend && Array.isArray(trend) && (
        <div className="flex items-end gap-1 h-5 w-full pt-1.5 mt-1">
          {trend.map((val, idx) => {
            const heightPercent = Math.max(15, Math.min(100, (val / Math.max(...trend)) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-secondary-container/60 hover:bg-secondary rounded-xs transition-all"
                style={{ height: `${heightPercent}%` }}
                title={`Step ${idx + 1}: ${val}`}
              />
            );
          })}
        </div>
      )}

      {/* Subtext */}
      {subtext && <span className="mt-2 font-mono text-[10px] text-on-surface-variant/80 truncate">{subtext}</span>}
    </div>
  );
}
