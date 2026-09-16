import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function HydrographChart({ surgePeak = 2.5, dangerThreshold = 4100 }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/30 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <h3 className="font-display font-bold text-xs sm:text-sm text-on-surface">
            Discharge Hydrograph & Peak Surge Curve (24h Window)
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-secondary inline-block" />
            <span className="text-on-surface-variant">Baseline Runoff</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-error inline-block" />
            <span className="text-on-surface font-bold">Simulated Flash Surge</span>
          </span>
        </div>
      </div>

      {/* SVG Time-Series Chart */}
      <div className="relative w-full h-44 bg-surface-container-low rounded-xl p-3 border border-outline-variant/20 overflow-hidden select-none">
        <svg className="w-full h-full" fill="none" viewBox="0 0 700 180" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="40" y1="20" x2="680" y2="20" stroke="#bdc8cb" strokeDasharray="2 3" opacity="0.4" />
          <line x1="40" y1="60" x2="680" y2="60" stroke="#bdc8cb" strokeDasharray="2 3" opacity="0.4" />
          <line x1="40" y1="100" x2="680" y2="100" stroke="#bdc8cb" strokeDasharray="2 3" opacity="0.4" />
          <line x1="40" y1="140" x2="680" y2="140" stroke="#bdc8cb" strokeDasharray="2 3" opacity="0.4" />

          {/* Danger capacity threshold line */}
          <line x1="40" y1="68" x2="680" y2="68" stroke="#ba1a1a" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="50" y="62" fill="#ba1a1a" className="font-mono text-[10px] font-bold">
            DANGER CAPACITY THRESHOLD ({dangerThreshold.toLocaleString()} m³/s)
          </text>

          {/* Baseline Curve */}
          <path
            d="M 50 145 Q 180 135 280 115 T 440 100 T 560 120 T 670 138 L 670 160 L 50 160 Z"
            fill="#00677f"
            fillOpacity="0.08"
          />
          <path
            d="M 50 145 Q 180 135 280 115 T 440 100 T 560 120 T 670 138"
            stroke="#00677f"
            strokeWidth="2"
          />

          {/* Simulated Surge Curve */}
          <path
            d="M 50 145 Q 160 110 240 60 Q 300 28 360 30 T 480 70 T 580 98 T 670 125 L 670 160 L 50 160 Z"
            fill="#ba1a1a"
            fillOpacity="0.14"
          />
          <path
            d="M 50 145 Q 160 110 240 60 Q 300 28 360 30 T 480 70 T 580 98 T 670 125"
            stroke="#ba1a1a"
            strokeWidth="2.5"
          />

          {/* Peak surge marker */}
          <circle cx="340" cy="29" r="4.5" fill="#ba1a1a" className="animate-ping opacity-75" />
          <circle cx="340" cy="29" r="4" fill="#ba1a1a" />
          <text x="350" y="24" fill="#0b1c30" className="font-mono text-[10px] font-bold">
            Peak Surge: +{surgePeak} hrs
          </text>

          {/* Time axis labels */}
          <text x="50" y="172" fill="#6e797c" className="font-mono text-[9px]">T+0h (Live)</text>
          <text x="210" y="172" fill="#6e797c" className="font-mono text-[9px]">T+4h</text>
          <text x="360" y="172" fill="#6e797c" className="font-mono text-[9px]">T+8h (Peak)</text>
          <text x="510" y="172" fill="#6e797c" className="font-mono text-[9px]">T+16h</text>
          <text x="650" y="172" fill="#6e797c" className="font-mono text-[9px]">T+24h</text>
        </svg>
      </div>
    </div>
  );
}
