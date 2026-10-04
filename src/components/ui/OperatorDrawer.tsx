import React, { useState } from 'react';
import { BusModel, Booking, SeatConfig, SeatState } from '../../types/bus';
import { FLEET_BUSES } from '../../data/fleetData';
import {
  X,
  Bus,
  Users,
  Search,
  Crosshair,
  Printer,
  Ticket,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Database,
  RefreshCw,
  MapPin,
} from 'lucide-react';

interface OperatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeBus: BusModel;
  onSelectBus: (busId: string) => void;
  bookings: Booking[];
  metrics: {
    total: number;
    available: number;
    booked: number;
    blocked: number;
  };
  onLocateSeat: (seat: SeatConfig) => void;
  onViewTicket: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
  onToggleBlock: (busId: string, seatId: string) => void;
  getSeatState: (busId: string, seatId: string) => SeatState;
  onResetSeed: () => void;
}

export const OperatorDrawer: React.FC<OperatorDrawerProps> = ({
  isOpen,
  onClose,
  activeBus,
  onSelectBus,
  bookings,
  metrics,
  onLocateSeat,
  onViewTicket,
  onCancelBooking,
  onToggleBlock,
  getSeatState,
  onResetSeed,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'bus' | 'passengers' | 'seats' | 'settings'>('bookings');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter bookings for this active bus
  const busBookings = bookings.filter((b) => b.busId === activeBus.id && b.status === 'Confirmed');

  const filteredBookings = busBookings.filter((b) => {
    const matchesSearch =
      b.passenger.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.seatLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passenger.phone.includes(searchQuery);

    const matchesPayment = paymentFilter === 'All' || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-neutral-950/98 backdrop-blur-xl border-l border-neutral-800 text-neutral-100 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
            <Bus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">Operator Control Panel</h3>
            <div className="text-[11px] text-neutral-400 font-mono">
              {activeBus.code} · {activeBus.regNumber}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-4 bg-neutral-900/60 border-b border-neutral-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Bookings ({busBookings.length})
        </button>

        <button
          onClick={() => setActiveTab('passengers')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'passengers'
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Passenger Manifest
        </button>

        <button
          onClick={() => setActiveTab('seats')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'seats'
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Seats Matrix ({metrics.total})
        </button>

        <button
          onClick={() => setActiveTab('bus')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'bus'
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Bus & Fleet
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-sky-400 text-sky-300'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          System
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* ========================================================
            TAB 1: BOOKINGS LIST & MANAGEMENT
            ======================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search passenger, seat, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Payment Filter Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shrink-0">
                {(['All', 'Paid', 'Pending'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPaymentFilter(filter)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer ${
                      paymentFilter === filter ? 'bg-sky-600 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs">
                No confirmed bookings found matching your search.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredBookings.map((b) => {
                  const seatObj = activeBus.seats.find((s) => s.id === b.seatId);
                  return (
                    <div
                      key={b.id}
                      className="p-3.5 bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700 rounded-xl space-y-3 transition-colors text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono font-bold text-amber-400 text-sm">
                            {b.seatLabel}
                          </span>
                          <div>
                            <div className="font-semibold text-white text-sm">{b.passenger.name}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">
                              {b.passenger.phone} · ID: {b.id}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            b.paymentStatus === 'Paid'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {b.paymentStatus.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-950/60 p-2 rounded border border-neutral-800/80">
                        <div>
                          <span className="text-neutral-500 block">Boarding</span>
                          <span className="text-neutral-200 font-medium truncate block">{b.boardingPoint}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Dropping</span>
                          <span className="text-neutral-200 font-medium truncate block">{b.droppingPoint}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                        <div className="font-mono text-neutral-300 font-semibold">₹{b.fare}</div>

                        <div className="flex items-center gap-1.5">
                          {seatObj && (
                            <button
                              onClick={() => {
                                onLocateSeat(seatObj);
                                onClose();
                              }}
                              className="px-2.5 py-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/80 rounded transition-colors flex items-center gap-1 cursor-pointer"
                              title="Smoothly move 3D camera to this seat"
                            >
                              <Crosshair className="w-3.5 h-3.5" />
                              <span>LOCATE IN BUS</span>
                            </button>
                          )}

                          <button
                            onClick={() => onViewTicket(b)}
                            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors cursor-pointer"
                            title="View official ticket pass"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setCancelTargetId(b.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded transition-colors cursor-pointer"
                            title="Cancel booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Cancellation Confirm inside list item */}
                      {cancelTargetId === b.id && (
                        <div className="p-2.5 bg-rose-950 border border-rose-800 rounded-lg text-xs space-y-2 animate-in fade-in">
                          <p className="text-rose-200">Confirm cancellation of booking for {b.passenger.name}?</p>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setCancelTargetId(null)}
                              className="px-2.5 py-0.5 text-neutral-300 hover:text-white bg-neutral-800 rounded text-xs cursor-pointer"
                            >
                              Back
                            </button>
                            <button
                              onClick={() => {
                                onCancelBooking(b.id);
                                setCancelTargetId(null);
                              }}
                              className="px-2.5 py-0.5 font-bold text-white bg-rose-600 hover:bg-rose-500 rounded text-xs cursor-pointer"
                            >
                              Confirm Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PASSENGER ROSTER / MANIFEST
            ======================================================== */}
        {activeTab === 'passengers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Boarding Manifest</h4>
                <div className="text-[11px] text-neutral-400">Total Passengers: {busBookings.length}</div>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Roster</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-neutral-800 rounded-lg">
              <table className="w-full text-left text-xs text-neutral-300 font-sans">
                <thead className="bg-neutral-900 text-neutral-400 font-mono text-[10px] uppercase border-b border-neutral-800">
                  <tr>
                    <th className="px-3 py-2">Seat</th>
                    <th className="px-3 py-2">Passenger</th>
                    <th className="px-3 py-2">Contact</th>
                    <th className="px-3 py-2">Boarding</th>
                    <th className="px-3 py-2">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80 bg-neutral-950/80 font-mono text-[11px]">
                  {busBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-neutral-500">
                        No passengers booked yet for this bus trip.
                      </td>
                    </tr>
                  ) : (
                    busBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-900/50">
                        <td className="px-3 py-2.5 font-bold text-amber-400">{b.seatLabel}</td>
                        <td className="px-3 py-2.5 font-sans font-medium text-white">{b.passenger.name}</td>
                        <td className="px-3 py-2.5 text-neutral-400">{b.passenger.phone}</td>
                        <td className="px-3 py-2.5 font-sans text-neutral-300 truncate max-w-[120px]">
                          {b.boardingPoint}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              b.paymentStatus === 'Paid'
                                ? 'bg-emerald-950 text-emerald-400'
                                : 'bg-amber-950 text-amber-400'
                            }`}
                          >
                            {b.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SEATS MATRIX & BLOCK/UNBLOCK
            ======================================================== */}
        {activeTab === 'seats' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Full Physical Seat Inventory</span>
              <span className="font-mono text-neutral-400">{metrics.total} Total Seats</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activeBus.seats.map((seat) => {
                const state = getSeatState(activeBus.id, seat.id);
                return (
                  <div
                    key={seat.id}
                    className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col justify-between text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-amber-400">{seat.label}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                          state === 'AVAILABLE'
                            ? 'bg-emerald-950 text-emerald-400'
                            : state === 'BOOKED'
                            ? 'bg-blue-950 text-blue-400'
                            : state === 'BLOCKED'
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-amber-950 text-amber-400'
                        }`}
                      >
                        {state}
                      </span>
                    </div>

                    <div className="mt-2 text-[10px] text-neutral-400 flex items-center justify-between">
                      <span>{seat.tier}</span>
                      <span className="font-mono">₹{seat.price}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
                      <button
                        onClick={() => {
                          onLocateSeat(seat);
                          onClose();
                        }}
                        className="flex-1 py-1 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-sky-300 rounded cursor-pointer text-center"
                      >
                        Locate 3D
                      </button>
                      {state !== 'BOOKED' && (
                        <button
                          onClick={() => onToggleBlock(activeBus.id, seat.id)}
                          className="py-1 px-1.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded cursor-pointer"
                          title={state === 'BLOCKED' ? 'Unblock seat' : 'Block seat for crew'}
                        >
                          {state === 'BLOCKED' ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: BUS & FLEET SPECIFICATIONS
            ======================================================== */}
        {activeTab === 'bus' && (
          <div className="space-y-4 text-xs">
            <h4 className="font-semibold text-white">Commercial Fleet Vehicles</h4>
            <div className="space-y-3">
              {FLEET_BUSES.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onSelectBus(b.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeBus.id === b.id
                      ? 'bg-sky-950/40 border-sky-500/80 shadow-lg ring-1 ring-sky-500/30'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{b.code}</span>
                        <span className="text-xs font-normal text-neutral-400">· {b.name}</span>
                      </div>
                      <div className="font-mono text-[11px] text-sky-400 mt-0.5">{b.regNumber}</div>
                    </div>
                    {activeBus.id === b.id && (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-sky-500 text-white rounded">
                        ACTIVE IN 3D
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-neutral-800 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Route:</span>
                      <span className="text-white font-medium">
                        {b.route.from} ➔ {b.route.to}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Departure:</span>
                      <span className="font-mono text-amber-400">{b.route.departureTime}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Seating Layout:</span>
                      <span className="text-neutral-200">{b.layoutType.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Total Capacity:</span>
                      <span className="font-mono text-neutral-200">{b.totalSeats} Passenger Seats</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: SYSTEM & PERSISTENCE SETTINGS
            ======================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Commercial Data Storage</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Bookings and seat allocations are automatically persisted using Browser LocalStorage. The data structure is prepared for live REST API / Cloud backend synchronisation.
              </p>
              <div className="font-mono text-[11px] text-neutral-300">
                Storage Key: <span className="text-sky-400">fleetcraft_bookings_v2</span>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Reset Demo Baseline</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Reset all bus trips, seat states, and sample bookings back to initial commercial seed values.
              </p>
              <button
                onClick={() => {
                  onResetSeed();
                  alert('Fleet data successfully restored to default commercial seed.');
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                Reset to Standard Seed Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
