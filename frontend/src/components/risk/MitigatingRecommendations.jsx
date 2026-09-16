import React from 'react';
import { Truck, Wrench, Radio, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MitigatingRecommendations() {
  const { riskData, addNotification } = useApp();
  const { mitigations } = riskData;

  const getIcon = (type) => {
    switch (type) {
      case 'traffic':
        return <Truck className="w-5 h-5 text-primary" />;
      case 'water_damage':
        return <Wrench className="w-5 h-5 text-secondary" />;
      case 'cell_tower':
      default:
        return <Radio className="w-5 h-5 text-error" />;
    }
  };

  const handleDeploy = (mit) => {
    addNotification({
      title: `Directive Deployed: ${mit.title}`,
      location: `${mit.category} (${mit.priority})`,
      level: mit.priority === 'P1' ? 'danger' : 'warning',
    });
    alert(`Operational directive "${mit.title}" dispatched to civil field units.`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-secondary font-bold">
            Decisional Support & Civil Directives
          </span>
          <h2 className="font-display font-bold text-xl text-on-surface tracking-tight">
            Mitigating Recommendations
          </h2>
        </div>
        <span className="font-mono text-xs text-on-surface-variant">
          Automated Action Directives for Civil Incident Command
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mitigations.map((mit) => (
          <div
            key={mit.id}
            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center border border-outline-variant/20">
                  {getIcon(mit.icon)}
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[9px] uppercase font-bold text-on-surface-variant border border-outline-variant/20">
                  {mit.category}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-on-surface mb-1">
                  {mit.title}
                </h3>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  {mit.description}
                </p>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-secondary">
                ACTION PRIORITY: {mit.priority}
              </span>
              <button
                onClick={() => handleDeploy(mit)}
                type="button"
                className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-secondary transition-colors"
              >
                <span>Deploy Directive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
