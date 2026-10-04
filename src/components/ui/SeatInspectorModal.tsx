import React, { useState } from 'react';
import { SeatConfig, SeatState, Booking, BusModel, TicketType, PaymentStatus } from '../../types/bus';
import { X, User, Phone, MapPin, CreditCard, ShieldAlert, CheckCircle2, Ticket, FileEdit, Trash2, AlertCircle } from 'lucide-react';

interface SeatInspectorModalProps {
  seat: SeatConfig;
  state: SeatState;
  booking?: Booking;
  bus: BusModel;
  onClose: () => void;
  onInitiateBookingReview: (data: {
    seatLabel: string;
    passengerName: string;
    phone: string;
    boardingPoint: string;
    droppingPoint: string;
    ticketType: TicketType;
    paymentStatus: PaymentStatus;
    fare: number;
    notes?: string;
  }) => void;
  onCancelBooking: (bookingId: string) => void;
  onToggleBlock: (busId: string, seatId: string) => void;
  onViewTicket: (booking: Booking) => void;
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
}

export const SeatInspectorModal: React.FC<SeatInspectorModalProps> = ({
  seat,
  state,
  booking,
  bus,
  onClose,
  onInitiateBookingReview,
  onCancelBooking,
  onToggleBlock,
  onViewTicket,
  onUpdateBooking,
}) => {
  // Booking Form State (Empty by default - NO AUTO FILL)
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [boardingPoint, setBoardingPoint] = useState(bus.route.stops[0] || '');
  const [droppingPoint, setDroppingPoint] = useState(bus.route.stops[bus.route.stops.length - 1] || '');
  const [ticketType, setTicketType] = useState<TicketType>('Standard');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>(''); // MUST NOT be auto-selected!
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Cancellation Confirmation Dialog state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Edit Booking state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(booking?.passenger.name || '');
  const [editPhone, setEditPhone] = useState(booking?.passenger.phone || '');
  const [editPayment, setEditPayment] = useState<PaymentStatus>(booking?.paymentStatus || 'Paid');

  // Submit manual booking form for review
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!passengerName.trim()) {
      setFormError('Please enter passenger full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setFormError('Please enter a valid passenger phone number.');
      return;
    }
    if (!paymentStatus) {
      setFormError('Please explicitly select a Payment Status (Paid or Pending).');
      return;
    }
    if (boardingPoint === droppingPoint) {
      setFormError('Boarding point and dropping point cannot be the same.');
      return;
    }

    onInitiateBookingReview({
      seatLabel: seat.label,
      passengerName: passengerName.trim(),
      phone: phone.trim(),
      boardingPoint,
      droppingPoint,
      ticketType,
      paymentStatus: paymentStatus as PaymentStatus,
      fare: seat.price,
      notes: notes.trim(),
    });
  };

  const handleConfirmCancel = () => {
    if (booking) {
      onCancelBooking(booking.id);
      setShowCancelConfirm(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    onUpdateBooking(booking.id, {
      passenger: {
        ...booking.passenger,
        name: editName.trim() || booking.passenger.name,
        phone: editPhone.trim() || booking.passenger.phone,
      },
      paymentStatus: editPayment,
    });
    setIsEditing(false);
  };

  return (
    <div className="absolute top-16 left-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl text-neutral-100 select-none overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center font-mono font-bold text-amber-400 text-sm border border-neutral-700">
            {seat.label}
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Seat {seat.label}</span>
              <span className="text-[11px] text-neutral-400 font-normal">({seat.tier})</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono">
              Row {seat.row} · Col {seat.column} · ₹{seat.price}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 max-h-[75vh] overflow-y-auto">
        {/* ========================================================
            CASE 1: BOOKED SEAT
            ======================================================== */}
        {state === 'BOOKED' && booking && !isEditing && (
          <div className="space-y-4">
            {/* Status Strip */}
            <div className="flex items-center justify-between p-2.5 bg-blue-950/60 border border-blue-800/80 rounded-lg">
              <div className="flex items-center gap-1.5 text-blue-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>BOOKED PASSENGER</span>
              </div>
              <span className="font-mono text-xs text-neutral-300">{booking.id}</span>
            </div>

            {/* Passenger Information */}
            <div className="space-y-2.5 p-3 bg-neutral-900/60 border border-neutral-800 rounded-lg text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Passenger</span>
                </span>
                <span className="font-semibold text-white">{booking.passenger.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Contact</span>
                </span>
                <span className="font-mono text-neutral-200">
                  {booking.passenger.phone.length > 4
                    ? `${booking.passenger.phone.slice(0, 3)}****${booking.passenger.phone.slice(-4)}`
                    : booking.passenger.phone}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Boarding</span>
                </span>
                <span className="text-neutral-200 text-right max-w-[160px] truncate">{booking.boardingPoint}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Dropping</span>
                </span>
                <span className="text-neutral-200 text-right max-w-[160px] truncate">{booking.droppingPoint}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-neutral-800">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Payment</span>
                </span>
                <span
                  className={`font-semibold font-mono px-2 py-0.5 rounded text-[10px] ${
                    booking.paymentStatus === 'Paid'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {booking.paymentStatus}
                </span>
              </div>

              {booking.notes && (
                <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                  <span className="font-medium text-neutral-300">Notes: </span>
                  <span>{booking.notes}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onViewTicket(booking)}
                className="w-full py-2 px-3 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>VIEW OFFICIAL TICKET</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="py-1.5 px-3 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>EDIT</span>
                </button>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="py-1.5 px-3 text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>
              </div>
            </div>

            {/* Confirmation Dialog for Cancellation */}
            {showCancelConfirm && (
              <div className="p-3.5 bg-rose-950/90 border border-rose-700 rounded-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start gap-2 text-rose-200 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>Are you sure you want to cancel this booking? The seat will immediately return to AVAILABLE.</span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-3 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 rounded cursor-pointer"
                  >
                    No, Keep
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-3 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded cursor-pointer"
                  >
                    CONFIRM CANCELLATION
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            CASE 2: EDIT BOOKED SEAT
            ======================================================== */}
        {state === 'BOOKED' && booking && isEditing && (
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div className="font-semibold text-white pb-1 border-b border-neutral-800">
              Edit Passenger Record
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Passenger Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-neutral-400 mb-1">Payment Status</label>
              <select
                value={editPayment}
                onChange={(e) => setEditPayment(e.target.value as PaymentStatus)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white rounded bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* ========================================================
            CASE 3: BLOCKED SEAT
            ======================================================== */}
        {state === 'BLOCKED' && (
          <div className="space-y-4">
            <div className="p-3 bg-neutral-900 border border-rose-900/60 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>SEAT BLOCKED / UNAVAILABLE</span>
              </div>
              <p className="text-neutral-400">
                This seat is currently blocked from ticketing (designated for driver relief crew, security, or maintenance).
              </p>
            </div>

            <button
              onClick={() => onToggleBlock(bus.id, seat.id)}
              className="w-full py-2 px-3 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              UNBLOCK SEAT FOR BOOKING
            </button>
          </div>
        )}

        {/* ========================================================
            CASE 4: AVAILABLE SEAT (MANUAL BOOKING WORKFLOW)
            ======================================================== */}
        {(state === 'AVAILABLE' || state === 'SELECTED') && !isBookingFormOpen && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg">
              <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AVAILABLE FOR BOOKING</span>
              </div>
              <span className="font-mono text-xs font-bold text-white">₹{seat.price}</span>
            </div>

            <div className="text-xs text-neutral-400 space-y-1 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
              <div className="flex justify-between">
                <span>Placement:</span>
                <span className="text-neutral-200">{seat.tier} Side</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Fare:</span>
                <span className="font-mono text-neutral-200">₹{seat.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Route:</span>
                <span className="text-neutral-200 truncate max-w-[170px]">{bus.route.from} ➔ {bus.route.to}</span>
              </div>
            </div>

            {/* Operator Actions */}
            <div className="space-y-2">
              <button
                onClick={() => setIsBookingFormOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-bold tracking-wide text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>BOOK SEAT {seat.label}</span>
              </button>

              <button
                onClick={() => onToggleBlock(bus.id, seat.id)}
                className="w-full py-2 px-3 text-xs font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
              >
                Block Seat for Crew / Maintenance
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            CASE 5: MANUAL BOOKING FORM (Strictly operator-entered)
            ======================================================== */}
        {(state === 'AVAILABLE' || state === 'SELECTED') && isBookingFormOpen && (
          <form onSubmit={handleProceedToReview} className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="font-semibold text-white">Passenger Booking Details</span>
              <button
                type="button"
                onClick={() => setIsBookingFormOpen(false)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Back
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded text-rose-200 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Passenger Name */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">
                Passenger Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Anand Kumar"
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98400 12345"
                required
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Boarding Point */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">
                Boarding Point <span className="text-rose-400">*</span>
              </label>
              <select
                value={boardingPoint}
                onChange={(e) => setBoardingPoint(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {bus.route.stops.map((stop) => (
                  <option key={stop} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropping Point */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">
                Dropping Point <span className="text-rose-400">*</span>
              </label>
              <select
                value={droppingPoint}
                onChange={(e) => setDroppingPoint(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {bus.route.stops.map((stop) => (
                  <option key={stop} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>

            {/* Ticket Type */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Ticket Type</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as TicketType)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Standard">Standard</option>
                <option value="VIP Comfort">VIP Comfort (+₹50)</option>
                <option value="Senior Citizen">Senior Citizen Concession</option>
                <option value="Student">Student Concession</option>
              </select>
            </div>

            {/* Payment Status (STRICT MANUAL SELECTION REQUIRED) */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">
                Payment Status <span className="text-rose-400">* (Manual Select)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Paid')}
                  className={`py-2 px-3 rounded-md font-semibold text-center border transition-all cursor-pointer ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500 ring-2 ring-emerald-500/50'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  ✓ Paid (Collected)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('Pending')}
                  className={`py-2 px-3 rounded-md font-semibold text-center border transition-all cursor-pointer ${
                    paymentStatus === 'Pending'
                      ? 'bg-amber-950 text-amber-300 border-amber-500 ring-2 ring-amber-500/50'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                >
                  ⏳ Pending (At Bus)
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Notes / Baggage</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Special baggage, meal preference, or conductor instructions..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1.5 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsBookingFormOpen(false)}
                className="px-3 py-1.5 text-neutral-400 hover:text-white bg-neutral-800 rounded-md cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="submit"
                className="px-4 py-2 font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer shadow flex items-center gap-1.5"
              >
                <span>REVIEW & CONFIRM</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
