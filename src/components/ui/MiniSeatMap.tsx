import React from 'react';
import { BusModel, SeatConfig, SeatState } from '../../types/bus';
import { X, Eye } from 'lucide-react';

interface MiniSeatMapProps {
  bus: BusModel;
  selectedSeatId: string | null;
  getSeatState: (busId: string, seatId: string) => SeatState;
  onSelectSeat: (seat: SeatConfig) => void;
  onClose: () => void;
}

export const MiniSeatMap: React.FC<MiniSeatMapProps> = ({
  bus,
  selectedSeatId,
  getSeatState,
  onSelectSeat,
  onClose,
}) => {
  // Group seats by row
  const rows = Array.from(new Set(bus.seats.map((s) => s.row))).sort((a, b) => a - b);

  const getSeatColor = (state: SeatState, isSelected: boolean) => {
    if (isSelected) return 'bg-amber-500 text-black border-amber-300 ring-2 ring-amber-400';
    switch (state) {
      case 'BOOKED':
        return 'bg-blue-900/80 text-blue-200 border-blue-700/80';
      case 'BLOCKED':
        return 'bg-neutral-800 text-rose-400 border-rose-900/60';
      case 'AVAILABLE':
      default:
        return 'bg-neutral-800 text-emerald-400 border-neutral-700 hover:bg-neutral-700';
    }
  };

  return (
    <div className="absolute top-16 right-4 z-20 w-72 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl p-3.5 shadow-2xl text-neutral-200 select-none animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800">
        <div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
            <span>2D Cabin Matrix</span>
            <span className="text-[10px] text-neutral-400 font-mono">({bus.layoutType.replace('_', ' ')})</span>
          </div>
          <div className="text-[10px] text-neutral-400">Click a seat to focus 3D camera</div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-1.5 pb-2 mb-3 text-[10px] border-b border-neutral-800 text-center font-mono">
        <div className="flex items-center justify-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-neutral-700 border border-emerald-500" />
          <span className="text-neutral-400">Avail</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-blue-700 border border-blue-500" />
          <span className="text-neutral-400">Booked</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-rose-900 border border-rose-600" />
          <span className="text-neutral-400">Blocked</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-amber-500" />
          <span className="text-neutral-400">Selected</span>
        </div>
      </div>

      {/* Driver & Cockpit Representation */}
      <div className="flex items-center justify-between px-3 py-1.5 mb-2 bg-neutral-900/60 rounded text-[10px] font-mono text-neutral-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>FRONT / STEERING</span>
        </span>
        <span className="text-amber-400">DOOR ➔</span>
      </div>

      {/* Seating Grid */}
      <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5">
        {rows.map((rowNum) => {
          const rowSeats = bus.seats.filter((s) => s.row === rowNum);
          const leftSeats = rowSeats.filter((s) => s.column <= 2);
          const rightSeats = rowSeats.filter((s) => s.column > 2);

          return (
            <div key={rowNum} className="flex items-center justify-between text-xs">
              {/* Left Side */}
              <div className="flex items-center gap-1">
                {leftSeats.map((seat) => {
                  const state = getSeatState(bus.id, seat.id);
                  const isSelected = selectedSeatId === seat.id;
                  return (
                    <button
                      key={seat.id}
                      onClick={() => onSelectSeat(seat)}
                      className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${getSeatColor(
                        state,
                        isSelected
                      )}`}
                      title={`Seat ${seat.label} (${seat.tier}) - ${state}`}
                    >
                      {seat.label}
                    </button>
                  );
                })}
              </div>

              {/* Aisle Space */}
              <div className="text-[9px] font-mono text-neutral-600 px-1">R{rowNum}</div>

              {/* Right Side */}
              <div className="flex items-center gap-1">
                {rightSeats.map((seat) => {
                  const state = getSeatState(bus.id, seat.id);
                  const isSelected = selectedSeatId === seat.id;
                  return (
                    <button
                      key={seat.id}
                      onClick={() => onSelectSeat(seat)}
                      className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border transition-all cursor-pointer ${getSeatColor(
                        state,
                        isSelected
                      )}`}
                      title={`Seat ${seat.label} (${seat.tier}) - ${state}`}
                    >
                      {seat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rear Indicator */}
      <div className="mt-2 text-center text-[10px] font-mono text-neutral-500 border-t border-neutral-800/80 pt-1">
        REAR CABIN / EMERGENCY DOOR
      </div>
    </div>
  );
};
