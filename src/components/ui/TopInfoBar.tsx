import React from 'react';
import { BusModel } from '../../types/bus';
import { FLEET_BUSES } from '../../data/fleetData';
import { Bus, MapPin, Clock, Users, ShieldAlert, CheckCircle2, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface TopInfoBarProps {
  activeBus: BusModel;
  onSelectBus: (busId: string) => void;
  metrics: {
    total: number;
    available: number;
    booked: number;
    blocked: number;
  };
  onOpenOperatorPanel: (tab?: string) => void;
  onResetSeed: () => void;
}

export const TopInfoBar: React.FC<TopInfoBarProps> = ({
  activeBus,
  onSelectBus,
  metrics,
  onOpenOperatorPanel,
  onResetSeed,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 text-neutral-100 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-semibold text-base tracking-tight text-white flex items-center gap-2">
          <Bus className="w-5 h-5 text-sky-400" />
          <span>FleetCraft</span>
        </span>

        {/* Bus Selector Dropdown */}
        <div className="relative">
          <select
            value={activeBus.id}
            onChange={(e) => onSelectBus(e.target.value)}
            className="bg-neutral-900 border border-neutral-700/80 text-neutral-200 text-xs font-mono font-medium rounded-md px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {FLEET_BUSES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} · {b.route.from} ➔ {b.route.to} ({b.layoutType.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Trip Route & Real-Time Operational Counters (Derived directly from actual data) */}
      <div className="hidden lg:flex items-center gap-5 text-xs">
        {/* Route Details */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-medium text-white">{activeBus.route.from}</span>
          <span className="text-neutral-500">➔</span>
          <span className="font-medium text-white">{activeBus.route.to}</span>
          <span className="text-neutral-500">({activeBus.route.distanceKm} km)</span>
        </div>

        <span className="text-neutral-700" aria-hidden="true">|</span>

        {/* Departure Time */}
        <div className="flex items-center gap-1.5 text-neutral-300">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Dep: <strong className="text-white font-mono">{activeBus.route.departureTime}</strong></span>
        </div>

        <span className="text-neutral-700" aria-hidden="true">|</span>

        {/* Actual Dynamic Capacity Counters */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400" title="Seats Available for Manual Booking">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-neutral-400 font-sans text-[11px]">Available:</span>
            <span className="font-bold tabular-nums text-emerald-300">{metrics.available}</span>
          </div>

          <div className="flex items-center gap-1.5 text-blue-400" title="Confirmed Booked Passengers">
            <Users className="w-3.5 h-3.5" />
            <span className="text-neutral-400 font-sans text-[11px]">Booked:</span>
            <span className="font-bold tabular-nums text-blue-300">{metrics.booked}</span>
          </div>

          <div className="flex items-center gap-1.5 text-rose-400" title="Reserved for Crew or Maintenance">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-neutral-400 font-sans text-[11px]">Blocked:</span>
            <span className="font-bold tabular-nums text-rose-300">{metrics.blocked}</span>
          </div>
        </div>
      </div>

      {/* Zone 3: Operator Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenOperatorPanel('bookings')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Operator Console</span>
        </button>

        <button
          onClick={onResetSeed}
          title="Reset demonstration data to standard baseline"
          className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
