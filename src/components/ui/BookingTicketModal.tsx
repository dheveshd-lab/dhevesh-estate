import React from 'react';
import { Booking, BusModel } from '../../types/bus';
import { X, Printer, Bus, CheckCircle2, QrCode } from 'lucide-react';

interface BookingTicketModalProps {
  booking: Booking | null;
  bus: BusModel;
  onClose: () => void;
}

export const BookingTicketModal: React.FC<BookingTicketModalProps> = ({ booking, bus, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-neutral-400">
            <Bus className="w-4 h-4 text-sky-400" />
            <span>Commercial E-Ticket & Boarding Pass</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Card */}
        <div className="p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 space-y-5">
          {/* Header Strip */}
          <div className="flex justify-between items-start pb-4 border-b border-neutral-800">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">{bus.name}</h2>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-1">
                <span>{bus.code}</span>
                <span>·</span>
                <span className="font-mono">{bus.regNumber}</span>
                <span>·</span>
                <span>{bus.layoutType.replace('_', ' ')}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-950/80 border border-emerald-600/70 text-emerald-400 text-xs font-mono font-semibold rounded">
                CONFIRMED
              </span>
              <div className="font-mono text-[11px] text-neutral-400 mt-1">ID: {booking.id}</div>
            </div>
          </div>

          {/* Route Grid */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-neutral-950/80 border border-neutral-800 rounded-lg">
            <div>
              <div className="text-[10px] uppercase font-mono text-neutral-400">Boarding Point</div>
              <div className="text-sm font-semibold text-white mt-0.5">{booking.boardingPoint}</div>
              <div className="text-xs text-amber-400 font-mono mt-0.5">{bus.route.departureTime} (Scheduled)</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-neutral-400">Dropping Point</div>
              <div className="text-sm font-semibold text-white mt-0.5">{booking.droppingPoint}</div>
              <div className="text-xs text-neutral-400 font-mono mt-0.5">{bus.route.estimatedArrival} (Est. Arrival)</div>
            </div>
          </div>

          {/* Passenger & Seat Details */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="text-[10px] uppercase font-mono text-neutral-400">Seat Number</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{booking.seatLabel}</div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{booking.ticketType}</div>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg col-span-2">
              <div className="text-[10px] uppercase font-mono text-neutral-400">Passenger</div>
              <div className="text-sm font-semibold text-white mt-1">{booking.passenger.name}</div>
              <div className="text-xs font-mono text-neutral-300 mt-0.5">Phone: {booking.passenger.phone}</div>
            </div>
          </div>

          {/* Payment & Fare */}
          <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
            <div>
              <span className="text-neutral-400">Payment Status: </span>
              <span
                className={`font-semibold font-mono ${
                  booking.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {booking.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400">Total Amount:</span>
              <span className="font-mono text-base font-bold text-white">₹{booking.fare}</span>
            </div>
          </div>

          {/* Barcode & Security Stamp */}
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-neutral-800 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <QrCode className="w-8 h-8 text-neutral-400" />
              <div>
                <div className="font-mono text-[10px]">ELECTRONIC BUS MANIFEST PASS</div>
                <div className="text-[9px] text-neutral-400">Booked: {new Date(booking.bookedAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Operator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
