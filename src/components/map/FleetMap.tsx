import React, { useState } from 'react';
import { BusModel, BusTelemetry, Booking } from '../../types/bus';
import { FLEET_BUSES, FLEET_TELEMETRY } from '../../data/fleetData';
import {
  MapPin,
  Navigation,
  Clock,
  Compass,
  Radio,
  Eye,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface FleetMapProps {
  onEnter3DInterior: (busId: string) => void;
  onOpenOperatorPanel: (tab?: string) => void;
  selectedBusId?: string;
  onSelectBus?: (busId: string) => void;
}

export const FleetMap: React.FC<FleetMapProps> = ({
  onEnter3DInterior,
  onOpenOperatorPanel,
  selectedBusId = 'bus-101',
  onSelectBus,
}) => {
  const [activeBusId, setActiveBusId] = useState<string>(selectedBusId);
  const [filterStatus, setFilterStatus] = useState<'All' | 'In Transit' | 'Depot'>('All');
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const activeBus = FLEET_BUSES.find((b) => b.id === activeBusId) || FLEET_BUSES[0];
  const activeTelemetry: BusTelemetry = FLEET_TELEMETRY[activeBusId] || FLEET_TELEMETRY['bus-101'];

  const filteredBuses = FLEET_BUSES.filter((bus) => {
    const tele = FLEET_TELEMETRY[bus.id];
    if (filterStatus === 'All') return true;
    if (filterStatus === 'In Transit') return tele?.status === 'In Transit';
    if (filterStatus === 'Depot') return tele?.status === 'Depot' || tele?.status === 'Stopped';
    return true;
  });

  const handleSelect = (id: string) => {
    setActiveBusId(id);
    if (onSelectBus) onSelectBus(id);
  };

  return (
    <div className="w-full h-full relative bg-neutral-950 flex flex-col pt-16 overflow-hidden select-none">
      {/* Map Control Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 z-10 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Fleet GPS Radar & Route Tracking</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                LIVE TELEMETRY
              </span>
            </h2>
            <div className="text-[11px] text-neutral-400">
              Active Intercity Highway Corridors · Real GPS Positions
            </div>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
            {(['All', 'In Transit', 'Depot'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                  filterStatus === filter ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setLastRefreshed('Just now');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="flex-1 relative flex flex-col lg:flex-row overflow-hidden">
        {/* Interactive GIS Vector Map Viewport */}
        <div className="flex-1 relative bg-gradient-to-br from-neutral-950 via-[#0a0f1d] to-[#050811] overflow-hidden flex items-center justify-center p-4">
          {/* Subtle Grid Coordinates Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* SVG Map Canvas representing National Highways & Bus Positions */}
          <svg className="w-full h-full max-w-4xl max-h-[600px] relative z-0" viewBox="0 0 800 500">
            <defs>
              <linearGradient id="routeGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="routeGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="routeGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* ROUTE 1: Chennai ➔ Bangalore (NH 48 / NH 44 corridor) */}
            <path
              d="M 120,400 Q 250,370 380,330"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 120,400 Q 250,370 380,330"
              fill="none"
              stroke="url(#routeGradient1)"
              strokeWidth="3"
              strokeDasharray="6,4"
              className="animate-[dash_20s_linear_infinite]"
            />

            {/* Route 1 Stop Markers */}
            <circle cx="120" cy="400" r="5" fill="#38bdf8" />
            <text x="100" y="425" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Chennai CMBT</text>

            <circle cx="230" cy="380" r="4" fill="#64748b" />
            <text x="215" y="402" fill="#64748b" fontSize="9" fontFamily="sans-serif">Vellore</text>

            <circle cx="380" cy="330" r="5" fill="#38bdf8" />
            <text x="360" y="315" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Bangalore</text>

            {/* BUS-101 Position on Route 1 */}
            <g
              transform="translate(230, 380)"
              className="cursor-pointer group"
              onClick={() => handleSelect('bus-101')}
            >
              <circle r="22" fill="#38bdf8" opacity="0.2" className="animate-ping" />
              <circle r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">101</text>
              <rect x="-40" y="-32" width="80" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="0" y="-20" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">BUS-101 · 68 km/h</text>
            </g>

            {/* ROUTE 2: Mumbai ➔ Pune (Mumbai-Pune Expressway) */}
            <path
              d="M 150,220 Q 220,200 300,240"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 150,220 Q 220,200 300,240"
              fill="none"
              stroke="url(#routeGradient2)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />

            <circle cx="150" cy="220" r="5" fill="#34d399" />
            <text x="130" y="245" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Mumbai</text>

            <circle cx="230" cy="206" r="4" fill="#64748b" />
            <text x="210" y="195" fill="#64748b" fontSize="9" fontFamily="sans-serif">Lonavala</text>

            <circle cx="300" cy="240" r="5" fill="#34d399" />
            <text x="290" y="265" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Pune</text>

            {/* BUS-102 Position on Route 2 */}
            <g
              transform="translate(230, 206)"
              className="cursor-pointer group"
              onClick={() => handleSelect('bus-102')}
            >
              <circle r="22" fill="#34d399" opacity="0.2" className="animate-ping" />
              <circle r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">102</text>
              <rect x="-42" y="-32" width="84" height="18" rx="4" fill="#0f172a" stroke="#34d399" strokeWidth="1" />
              <text x="0" y="-20" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle">BUS-102 · +15m delay</text>
            </g>

            {/* ROUTE 3: Delhi ➔ Jaipur (NH 48) */}
            <path
              d="M 520,110 L 680,180"
              fill="none"
              stroke="#1e293b"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 520,110 L 680,180"
              fill="none"
              stroke="url(#routeGradient3)"
              strokeWidth="3"
              strokeDasharray="6,4"
            />

            <circle cx="520" cy="110" r="5" fill="#fbbf24" />
            <text x="500" y="95" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Delhi ISBT</text>

            <circle cx="680" cy="180" r="5" fill="#fbbf24" />
            <text x="670" y="205" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Jaipur</text>

            {/* BUS-103 Position (Stationary at Delhi Depot) */}
            <g
              transform="translate(520, 110)"
              className="cursor-pointer group"
              onClick={() => handleSelect('bus-103')}
            >
              <circle r="16" fill="#f59e0b" opacity="0.2" />
              <circle r="14" fill="#b45309" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">103</text>
              <rect x="-40" y="-32" width="80" height="18" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
              <text x="0" y="-20" fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">BUS-103 · Depot</text>
            </g>
          </svg>

          {/* Compass & Scale overlay */}
          <div className="absolute bottom-4 left-4 p-2.5 bg-neutral-900/80 border border-neutral-800 rounded-lg text-[10px] text-neutral-400 font-mono flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>N 12° 58' / E 79° 15'</span>
            </div>
            <span>·</span>
            <span>GIS Map Scale 1:250,000</span>
          </div>
        </div>

        {/* Selected Bus Telemetry Slide-over / Inspector Sidebar */}
        <div className="w-full lg:w-96 bg-neutral-900/95 border-t lg:border-t-0 lg:border-l border-neutral-800 p-5 flex flex-col justify-between overflow-y-auto z-10 text-xs">
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold font-mono text-white">{activeBus.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      activeTelemetry.status === 'In Transit'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {activeTelemetry.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-neutral-400 text-xs mt-0.5">{activeBus.name}</div>
                <div className="font-mono text-[11px] text-neutral-500">{activeBus.regNumber}</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-neutral-500 font-mono">LIVE SPEED</div>
                <div className="text-xl font-bold font-mono text-sky-400">
                  {activeTelemetry.speedKmh} <span className="text-xs font-normal">km/h</span>
                </div>
              </div>
            </div>

            {/* GPS Location Details */}
            <div className="space-y-2 p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl">
              <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Current GPS Position</span>
                </span>
                <span className="text-neutral-500 font-mono">{activeTelemetry.lastUpdated}</span>
              </div>
              <div className="text-white font-medium text-xs">
                {activeTelemetry.locationName}
              </div>
              <div className="font-mono text-[10px] text-neutral-500">
                Lat: {activeTelemetry.coordinates.lat.toFixed(4)}, Lng: {activeTelemetry.coordinates.lng.toFixed(4)}
              </div>
            </div>

            {/* Route Details */}
            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-neutral-400 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assigned Route</span>
                </span>
                <span className="font-mono text-neutral-300">{activeBus.route.distanceKm} km</span>
              </div>
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>{activeBus.route.from}</span>
                <span className="text-neutral-500">➔</span>
                <span>{activeBus.route.to}</span>
              </div>
              <div className="text-[11px] text-neutral-400 flex items-center justify-between pt-1 border-t border-neutral-800/80">
                <span>Next Stop: <strong className="text-white">{activeTelemetry.nextStop}</strong></span>
                <span className="font-mono text-amber-400">ETA: {activeTelemetry.estimatedArrival}</span>
              </div>

              {activeTelemetry.delayMinutes > 0 && (
                <div className="p-2 bg-rose-950/60 border border-rose-800/80 rounded text-[11px] text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Reported delay: +{activeTelemetry.delayMinutes} minutes due to ghat traffic.</span>
                </div>
              )}
            </div>

            {/* Driver & Crew Information */}
            <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1.5">
              <div className="text-[11px] text-neutral-400 font-medium">Duty Captain / Driver</div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">{activeTelemetry.driver.name}</span>
                <span className="font-mono text-neutral-300 text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-sky-400" />
                  <span>{activeTelemetry.driver.phone}</span>
                </span>
              </div>
              <div className="text-[10px] font-mono text-neutral-500">
                Commercial License: {activeTelemetry.driver.license}
              </div>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="space-y-2 pt-4 border-t border-neutral-800 mt-4">
            <button
              onClick={() => onEnter3DInterior(activeBus.id)}
              className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Eye className="w-4 h-4" />
              <span>ENTER 3D INTERIOR (STREET VIEW)</span>
            </button>

            <button
              onClick={() => onOpenOperatorPanel('bookings')}
              className="w-full py-2 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
              <span>Inspect Bookings for {activeBus.code}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
