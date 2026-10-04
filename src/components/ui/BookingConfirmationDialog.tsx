import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface BookingConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingData: {
    seatLabel: string;
    passengerName: string;
    phone: string;
    boardingPoint: string;
    droppingPoint: string;
    ticketType: string;
    paymentStatus: string;
    fare: number;
    busCode: string;
    route: string;
  } | null;
}

export const BookingConfirmationDialog: React.FC<BookingConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingData,
}) => {
  if (!isOpen || !bookingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl p-5 text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>CONFIRM BOOKING</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <div className="flex items-start gap-2.5 my-4 p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            Please review the passenger details carefully. This will manually commit the seat allocation into the commercial manifest.
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="space-y-3 bg-neutral-950/70 border border-neutral-800 rounded-lg p-3.5 text-xs font-sans">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800/80">
            <span className="text-neutral-400">Assigned Physical Seat</span>
            <span className="font-mono text-base font-bold text-amber-400">{bookingData.seatLabel}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Passenger Name</span>
            <span className="font-semibold text-white">{bookingData.passengerName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Contact Number</span>
            <span className="font-mono text-neutral-200">{bookingData.phone}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Boarding Station</span>
            <span className="text-white">{bookingData.boardingPoint}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Dropping Station</span>
            <span className="text-white">{bookingData.droppingPoint}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Ticket Category</span>
            <span className="text-neutral-300">{bookingData.ticketType}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Payment Status</span>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-[11px] ${
                bookingData.paymentStatus === 'Paid'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {bookingData.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-neutral-800/80">
            <span className="text-neutral-300 font-medium">Total Fare</span>
            <span className="font-mono text-base font-bold text-emerald-400">₹{bookingData.fare}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM BOOKING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
