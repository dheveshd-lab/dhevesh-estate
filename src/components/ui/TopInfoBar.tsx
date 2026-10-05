import React from 'react';
import { BusModel } from '../../types/bus';
import { FLEET_BUSES } from '../../data/fleetData';
import {
  Bus,
  MapPin,
  Clock,
  Users,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  LayoutDashboard,
  Compass,
  Map,
  Sparkles,
} from 'lucide-react';

interface TopInfoBarProps {
  currentView: 'dashboard' | 'interior' | 'map';
  onChangeView: (view: 'dashboard' | 'interior' | 'map') => void;
  activeBus: BusModel;
  onSelectBus: (busId: string) => void;
  metrics: {
    total: number;
    available: number;
    booked: number;
    blocked: number;
  };
  onOpenOperatorPanel: (tab?: string) => void;
  onOpenAIAgent: () => void;
  onResetSeed: () => void;
}

export const TopInfoBar: React.FC<TopInfoBarProps> = ({
  currentView,
  onChangeView,
  activeBus,
  onSelectBus,
  metrics,
  onOpenOperatorPanel,
  onOpenAIAgent,
  onResetSeed,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-2.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 text-neutral-100 select-none">
      {/* Zone 1: Single text element wordmark + View Mode Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        <span
          onClick={() => onChangeView('dashboard')}
          className="font-semibold text-base tracking-tight text-white flex items-center gap-2 cursor-pointer hover:text-sky-400 transition-colors"
        >
          <Bus className="w-5 h-5 text-sky-400" />
          <span>FleetCraft</span>
        </span>

        {/* View Toggle Segmented Control (Dashboard, 3D Interior, Fleet Map) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
          <button
            onClick={() => onChangeView('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onChangeView('interior')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              currentView === 'interior'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Interior</span>
          </button>

          <button
            onClick={() => onChangeView('map')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              currentView === 'map'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Fleet Map</span>
          </button>
        </div>

        {/* Bus Selector Dropdown (Shown in 3D interior) */}
        {currentView === 'interior' && (
          <div className="relative hidden md:block">
            <select
              value={activeBus.id}
              onChange={(e) => onSelectBus(e.target.value)}
              className="bg-neutral-900 border border-neutral-700/80 text-neutral-200 text-xs font-mono font-medium rounded-md px-2.5 py-1 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {FLEET_BUSES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.route.from} ➔ {b.route.to} ({b.layoutType.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Zone 2: Trip Route & Real-Time Operational Counters */}
      <div className="hidden xl:flex items-center gap-5 text-xs">
        {currentView === 'interior' ? (
          <>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-medium text-white">{activeBus.route.from}</span>
              <span className="text-neutral-500">➔</span>
              <span className="font-medium text-white">{activeBus.route.to}</span>
              <span className="text-neutral-500">({activeBus.route.distanceKm} km)</span>
            </div>

            <span className="text-neutral-700" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Dep: <strong className="text-white font-mono">{activeBus.route.departureTime}</strong></span>
            </div>

            <span className="text-neutral-700" aria-hidden="true">|</span>

            <div className="flex items-center gap-4 font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-neutral-400 font-sans text-[11px]">Available:</span>
                <span className="font-bold tabular-nums text-emerald-300">{metrics.available}</span>
              </div>

              <div className="flex items-center gap-1.5 text-blue-400">
                <Users className="w-3.5 h-3.5" />
                <span className="text-neutral-400 font-sans text-[11px]">Booked:</span>
                <span className="font-bold tabular-nums text-blue-300">{metrics.booked}</span>
              </div>

              <div className="flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-neutral-400 font-sans text-[11px]">Blocked:</span>
                <span className="font-bold tabular-nums text-rose-300">{metrics.blocked}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-neutral-300 font-sans font-medium">Commercial Fleet Operations</span>
            <span className="text-neutral-600">·</span>
            <span>3 Active Services · Live Highway Telemetry</span>
          </div>
        )}
      </div>

      {/* Zone 3: Operator Actions + AI Operations Button */}
      <div className="flex items-center gap-2">
        {/* [ ✦ AI OPERATIONS ] BUTTON */}
        <button
          onClick={onOpenAIAgent}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-950 bg-gradient-to-r from-sky-400 via-teal-300 to-sky-300 hover:from-sky-300 hover:to-teal-200 rounded-lg transition-all shadow-md cursor-pointer whitespace-nowrap"
          title="Open AI Operations Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-950" />
          <span>AI OPERATIONS</span>
        </button>

        <button
          onClick={() => onOpenOperatorPanel('bookings')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Console</span>
        </button>

        <button
          onClick={onResetSeed}
          title="Reset demonstration data to standard baseline"
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
