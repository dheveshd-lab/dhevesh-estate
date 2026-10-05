import React from 'react';
import { BusModel, Booking } from '../../types/bus';
import { FLEET_BUSES } from '../../data/fleetData';
import {
  Bus,
  MapPin,
  Clock,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  Printer,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface DashboardProps {
  onEnter3DInterior: (busId?: string) => void;
  onOpenFleetMap: (busId?: string) => void;
  onOpenOperatorPanel: (tab?: string) => void;
  onOpenAIAgent: () => void;
  onViewTicket: (booking: Booking) => void;
  allBookings: Booking[];
  getMetrics: (busId: string) => {
    total: number;
    available: number;
    booked: number;
    blocked: number;
  };
  globalMetrics: {
    totalBuses: number;
    activeTrips: number;
    revenue: number;
    paidCount: number;
    pendingAmount: number;
    pendingCount: number;
    totalBookingsCount: number;
    totalSeats: number;
    totalBookedSeats: number;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({
  onEnter3DInterior,
  onOpenFleetMap,
  onOpenOperatorPanel,
  onOpenAIAgent,
  onViewTicket,
  allBookings,
  getMetrics,
  globalMetrics,
}) => {
  const confirmedBookings = allBookings.filter((b) => b.status === 'Confirmed');
  const recentBookings = confirmedBookings.slice(0, 5);

  return (
    <div className="w-full h-full overflow-y-auto bg-neutral-950 text-neutral-100 select-none pb-12 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================
            HERO / OPERATIONS STATUS BANNER
            ======================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-2xl shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE OPERATIONS ACTIVE · FLEETCRAFT COMMERCIAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Commercial Fleet & Booking Command
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Inspect virtual bus interiors with Google Street View-style 3D exploration, manually manage passenger seating allocations, and track intercity service revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* [ ✦ AI OPERATIONS ] HERO BUTTON */}
            <button
              onClick={onOpenAIAgent}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-400 via-teal-300 to-sky-300 hover:from-sky-300 hover:to-teal-200 text-sky-950 font-bold text-xs rounded-xl shadow-lg transition-all duration-150 cursor-pointer"
            >
              <span>✦ AI OPERATIONS</span>
            </button>

            <button
              onClick={() => onEnter3DInterior()}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs rounded-xl shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-neutral-950" />
              <span>ENTER 3D BUS INTERIOR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenFleetMap()}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fleet Map</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            1. KPI METRICS CARDS (4 Essential Commercial Numbers)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Buses */}
          <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Total Fleet Buses</span>
              <div className="p-2 rounded-lg bg-sky-950/70 border border-sky-800/60 text-sky-400">
                <Bus className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                {globalMetrics.totalBuses}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Commercial coaches in active roster
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-500 font-mono">
              Scania · Volvo · Mercedes-Benz
            </div>
          </div>

          {/* Card 2: Active Trips */}
          <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Active Trips Today</span>
              <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
                {globalMetrics.activeTrips}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Scheduled intercity departures
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% On-time schedule readiness</span>
            </div>
          </div>

          {/* Card 3: Revenue (Paid) */}
          <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Total Paid Revenue</span>
              <div className="p-2 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-400">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
                ₹{globalMetrics.revenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {globalMetrics.paidCount} manual bookings collected
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
              Verified fare receipts
            </div>
          </div>

          {/* Card 4: Pending Payments */}
          <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-md space-y-3">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span className="font-medium">Pending Payments</span>
              <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono tracking-tight text-rose-400 tabular-nums">
                ₹{globalMetrics.pendingAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                {globalMetrics.pendingCount} bookings awaiting check-in
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Conductor bus check-in required</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. QUICK ACTIONS SECTION
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Operations Quick Actions
            </h2>
            <span className="text-xs text-neutral-500">Commercial workflow shortcuts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Quick Action 1: Street View Interior */}
            <div
              onClick={() => onEnter3DInterior('bus-101')}
              className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-sky-500/50 rounded-xl transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="font-semibold text-white text-xs">
                Walk 3D Bus Interior
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Explore seats, cockpit, and aisle in Street View
              </div>
            </div>

            {/* Quick Action 2: Fleet GPS Map */}
            <div
              onClick={() => onOpenFleetMap()}
              className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="font-semibold text-white text-xs">
                Fleet GPS Radar Map
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Live vehicle tracking on intercity routes
              </div>
            </div>

            {/* Quick Action 3: AI Operations Agent */}
            <div
              onClick={onOpenAIAgent}
              className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-cyan-500/50 rounded-xl transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <span className="text-sm font-bold">✦</span>
              </div>
              <div className="font-semibold text-white text-xs">
                AI Operations Agent
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Query seats, delay status, revenue & routes
              </div>
            </div>

            {/* Quick Action 4: Passenger Manifest */}
            <div
              onClick={() => onOpenOperatorPanel('passengers')}
              className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-amber-500/50 rounded-xl transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <div className="font-semibold text-white text-xs">
                Passenger Manifest
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                View & print driver boarding check-in rosters
              </div>
            </div>

            {/* Quick Action 5: Bookings Management */}
            <div
              onClick={() => onOpenOperatorPanel('bookings')}
              className="p-4 bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-600 rounded-xl transition-all cursor-pointer group shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div className="font-semibold text-white text-xs">
                Manage Bookings
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                Search, filter, locate, edit or cancel tickets
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. TODAY'S TRIPS TABLE
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                Today's Scheduled Trips
              </h2>
              <div className="text-xs text-neutral-400">
                Commercial intercity routes and real-time seat availability
              </div>
            </div>
            <span className="text-xs font-mono text-neutral-400">
              {FLEET_BUSES.length} Trips Active
            </span>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-xl bg-neutral-900/80 shadow-md">
            <table className="w-full text-left text-xs text-neutral-200">
              <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase border-b border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Bus Vehicle</th>
                  <th className="px-4 py-3">Intercity Route</th>
                  <th className="px-4 py-3">Departure & Arrival</th>
                  <th className="px-4 py-3">Layout & Capacity</th>
                  <th className="px-4 py-3">Live Seat Status</th>
                  <th className="px-4 py-3">Base Fare</th>
                  <th className="px-4 py-3 text-right">3D Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70 font-sans">
                {FLEET_BUSES.map((bus) => {
                  const busMetrics = getMetrics(bus.id);
                  const occupancyPct = Math.round((busMetrics.booked / busMetrics.total) * 100);

                  return (
                    <tr key={bus.id} className="hover:bg-neutral-800/40 transition-colors">
                      {/* Vehicle */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-sky-400" />
                          <span>{bus.code}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400">{bus.name}</div>
                        <div className="text-[10px] font-mono text-neutral-500">{bus.regNumber}</div>
                      </td>

                      {/* Route */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white flex items-center gap-1">
                          <span>{bus.route.from}</span>
                          <span className="text-neutral-500">➔</span>
                          <span>{bus.route.to}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          {bus.route.distanceKm} km · {bus.route.stops.length} major transit stops
                        </div>
                      </td>

                      {/* Timetable */}
                      <td className="px-4 py-3.5 font-mono text-xs">
                        <div className="text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Dep: {bus.route.departureTime}</span>
                        </div>
                        <div className="text-neutral-400 text-[11px] mt-0.5">
                          Arr: {bus.route.estimatedArrival}
                        </div>
                      </td>

                      {/* Configuration */}
                      <td className="px-4 py-3.5">
                        <div className="text-white font-medium">
                          {bus.layoutType.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          {bus.totalSeats} Total Passenger Seats
                        </div>
                      </td>

                      {/* Live Status Counters */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-emerald-400 font-semibold">
                            {busMetrics.available} Avail
                          </span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-blue-400 font-semibold">
                            {busMetrics.booked} Booked
                          </span>
                          <span className="text-neutral-600">·</span>
                          <span className="text-rose-400 font-semibold">
                            {busMetrics.blocked} Blocked
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-36 h-1.5 bg-neutral-800 rounded-full mt-1.5 overflow-hidden flex">
                          <div
                            className="bg-blue-500 h-full transition-all duration-300"
                            style={{ width: `${occupancyPct}%` }}
                          />
                          <div
                            className="bg-rose-500 h-full transition-all duration-300"
                            style={{ width: `${(busMetrics.blocked / busMetrics.total) * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {occupancyPct}% Booked
                        </div>
                      </td>

                      {/* Base Fare */}
                      <td className="px-4 py-3.5 font-mono font-bold text-white text-xs">
                        ₹{bus.baseFare}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => onEnter3DInterior(bus.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open 3D Interior</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================
            4. RECENT MANUAL BOOKINGS LOG
            ======================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
              Recent Manual Bookings
            </h2>
            <button
              onClick={() => onOpenOperatorPanel('bookings')}
              className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              View Full Booking Log ➔
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded bg-neutral-800 border border-neutral-700 font-mono font-bold text-amber-400 flex items-center justify-center text-xs">
                      {b.seatLabel}
                    </span>
                    <div>
                      <div className="font-semibold text-white">{b.passenger.name}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">ID: {b.id}</div>
                    </div>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                      b.paymentStatus === 'Paid'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>

                <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80 flex items-center justify-between">
                  <span>Fare: <strong className="font-mono text-white">₹{b.fare}</strong></span>
                  <button
                    onClick={() => onViewTicket(b)}
                    className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    View E-Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
