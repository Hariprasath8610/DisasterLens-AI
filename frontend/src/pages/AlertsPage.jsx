import React from 'react';
import AlertsList from '../components/alerts/AlertsList';
import { ShieldAlert, Bell, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Icon from '../components/common/Icon';

export default function AlertsPage() {
  const { selectedLocation } = useApp();

  return (
    <div className="w-full p-4 sm:p-6 flex flex-col gap-6 max-w-5xl mx-auto">
      <section className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="icon-chip w-7 h-7 bg-error/10 text-error"><Icon icon={Bell} size="inline" /></span>
            <span className="font-mono text-[10px] uppercase font-bold text-error tracking-wider">
              CIVIL DEFENSE & EMERGENCY MANAGEMENT
            </span>
          </div>
          <h1 className="type-page-title mt-1">
            Early Warning Incident Alerts
          </h1>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant">
            Official warning broadcasts dispatched across cellular and municipal channels for {selectedLocation.name}.
          </p>
        </div>
      </section>

      <AlertsList />
    </div>
  );
}
