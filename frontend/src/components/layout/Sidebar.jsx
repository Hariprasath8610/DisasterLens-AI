import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Activity,
  History,
  FlaskConical,
  Bell,
  Bot,
  Settings,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Icon from '../common/Icon';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live-map', label: 'Live Map', icon: Globe },
  { path: '/risk-analysis', label: 'Risk Analysis', icon: Activity },
  { path: '/historical-replay', label: 'Historical Replay', icon: History },
  { path: '/simulation', label: 'What-If Simulation', icon: FlaskConical },
  { path: '/alerts', label: 'Alerts', icon: Bell, badge: '3 High' },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { selectedLocation } = useApp();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-surface-container-lowest border-r border-outline-variant/30 z-40 flex flex-col justify-between py-4 select-none">
      {/* Upper: Observation Rails Title & Links */}
      <div className="flex-1 flex flex-col gap-2">
        <div className="px-4 mb-2">
          <span className="font-mono text-[10px] tracking-widest uppercase text-on-surface-variant/80 font-semibold">
            Observation Rails
          </span>
        </div>

        <nav className="px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const NavIcon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl font-sans text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-primary-container text-white font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Icon icon={NavIcon} size="inline"
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-white' : 'text-on-surface-variant group-hover:text-primary'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />}

                    {item.badge && !isActive && (
                      <span className="px-1.5 py-0.5 rounded-full bg-error-container text-on-error-container font-mono text-[9px] font-bold tracking-tight">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Lower: Feed Sensor Station Card */}
      <div className="px-3 pt-4 border-t border-outline-variant/20">
        <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
              Active Sensor Grid
            </span>
            <span className="font-mono text-[11px] text-secondary font-semibold truncate max-w-[170px]">
              {selectedLocation.station.split(' (')[0]}
            </span>
            <span className="font-mono text-[9px] text-on-surface-variant/70">
              {selectedLocation.station.split(' (')[1]?.replace(')', '') || 'GEOS-18'}
            </span>
          </div>
          <div className="icon-chip w-7 h-7 bg-surface-container-lowest text-secondary shadow-2xs">
            <Icon icon={Radio} size="inline" className="animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
}
