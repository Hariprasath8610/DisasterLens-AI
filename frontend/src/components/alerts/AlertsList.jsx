import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Radio, Send, ShieldAlert, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AlertsList() {
  const { notifications, addNotification, selectedLocation } = useApp();

  const handleBroadcast = (alertItem) => {
    alert(`Public Safety Alert broadcast initiated for: ${alertItem.title} in ${alertItem.location}.`);
  };

  const handleTestAlert = () => {
    addNotification({
      title: 'Simulated Siren Test — Otteri Nullah Basin',
      location: `${selectedLocation.name} (Civil Siren Test)`,
      level: 'warning',
    });
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-error" />
          <h2 className="font-display font-bold text-base text-on-surface">
            Active Hazard Early Warning Broadcasts
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestAlert}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 font-mono text-[10px] text-on-surface font-semibold transition-colors"
          >
            Dispatch Test Ping
          </button>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[10px] font-bold">
            {notifications.length} Active Warnings
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              notif.level === 'danger'
                ? 'bg-red-50/50 border-red-200'
                : notif.level === 'warning'
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-blue-50/50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.level === 'danger'
                    ? 'bg-red-100 text-red-700'
                    : notif.level === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {notif.level === 'danger' ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-sm text-slate-900">{notif.title}</h3>
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-white/80 border border-slate-200">
                    {notif.level}
                  </span>
                </div>
                <p className="font-sans text-xs text-slate-600 mt-0.5">{notif.location}</p>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{notif.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleBroadcast(notif)}
                type="button"
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-sans text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-primary" />
                <span>Transmit Broadcast</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
