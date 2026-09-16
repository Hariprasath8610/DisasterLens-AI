import React from 'react';

export default function Badge({ children, variant = 'default', pulse = false, className = '' }) {
  const variants = {
    default: 'bg-surface-container text-on-surface-variant border-outline-variant/30',
    primary: 'bg-primary-light text-primary border-primary/20',
    secondary: 'bg-secondary-container/20 text-secondary border-secondary/30',
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    moderate: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
    error: 'bg-error-container text-on-error-container border-error/20',
  };

  const pulseColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    moderate: 'bg-amber-500',
    low: 'bg-emerald-500',
    secondary: 'bg-secondary-container',
  };

  const selectedClass = variants[variant] || variants.default;
  const pulseClass = pulseColors[variant] || 'bg-primary';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold tracking-wide uppercase border ${selectedClass} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseClass}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseClass}`} />
        </span>
      )}
      {children}
    </span>
  );
}
