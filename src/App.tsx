import React, { useState } from 'react';
import { useBookingStore } from './services/bookingStore';
import { BusModel, SeatConfig, Booking, TicketType, PaymentStatus } from './types/bus';
import { BusScene } from './components/3d/BusScene';
import { TopInfoBar } from './components/ui/TopInfoBar';
import { StreetViewHUD } from './components/ui/StreetViewHUD';
import { MiniSeatMap } from './components/ui/MiniSeatMap';
import { SeatInspectorModal } from './components/ui/SeatInspectorModal';
import { BookingConfirmationDialog } from './components/ui/BookingConfirmationDialog';
import { BookingTicketModal } from './components/ui/BookingTicketModal';
import { OperatorDrawer } from './components/ui/OperatorDrawer';

export default function App() {
  const {
    activeBus,
    activeBusId,
    selectedSeatId,
    cameraFocusTarget,
    setActiveBusId,
    setSelectedSeatId,
    setCameraFocusTarget,
    getSeatState,
    getBookingForSeat,
    getBookingsForActiveBus,
    getMetrics,
    confirmManualBooking,
    updateBooking,
    cancelBooking,
    toggleSeatBlock,
    resetAllToSeed,
  } = useBookingStore();

  // UI state
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isOperatorDrawerOpen, setIsOperatorDrawerOpen] = useState(false);
  const [viewingTicketBooking, setViewingTicketBooking] = useState<Booking | null>(null);

  // Pending Manual Booking Confirmation state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    seatLabel: string;
    seatId: string;
    passengerName: string;
    phone: string;
    boardingPoint: string;
    droppingPoint: string;
    ticketType: TicketType;
    paymentStatus: PaymentStatus;
    fare: number;
    notes?: string;
  } | null>(null);

  // Active metrics directly derived from real data
  const metrics = getMetrics(activeBusId);

  // Currently inspected seat object
  const currentSeat = activeBus.seats.find((s) => s.id === selectedSeatId) || null;
  const currentBooking = selectedSeatId ? getBookingForSeat(activeBusId, selectedSeatId) : undefined;
  const currentSeatState = selectedSeatId ? getSeatState(activeBusId, selectedSeatId) : 'AVAILABLE';

  // Handle seat selection from 3D scene or 2D matrix
  const handleSelectSeat = (seat: SeatConfig) => {
    setSelectedSeatId(seat.id);

    // Position camera comfortably in the aisle facing this seat
    const aisleX = seat.column <= 2 ? 0.05 : -0.05;
    const eyeHeight = 1.48;
    setCameraFocusTarget({
      position: [aisleX, eyeHeight, seat.position[2]],
      lookAt: [seat.position[0], seat.position[1] + 0.1, seat.position[2]],
    });
  };

  // Handle locating a seat from bookings list or manifest
  const handleLocateSeat = (seat: SeatConfig) => {
    handleSelectSeat(seat);
  };

  // When operator clicks "REVIEW & CONFIRM" in the manual booking form
  const handleInitiateBookingReview = (formData: {
    seatLabel: string;
    passengerName: string;
    phone: string;
    boardingPoint: string;
    droppingPoint: string;
    ticketType: TicketType;
    paymentStatus: PaymentStatus;
    fare: number;
    notes?: string;
  }) => {
    if (!selectedSeatId) return;
    setPendingConfirmation({
      ...formData,
      seatId: selectedSeatId,
    });
  };

  // STRICT MANUAL BOOKING: Only commits when operator clicks CONFIRM BOOKING in confirmation dialog!
  const handleFinalConfirmBooking = () => {
    if (!pendingConfirmation) return;

    const newBooking = confirmManualBooking({
      busId: activeBusId,
      seatId: pendingConfirmation.seatId,
      seatLabel: pendingConfirmation.seatLabel,
      passenger: {
        name: pendingConfirmation.passengerName,
        phone: pendingConfirmation.phone,
      },
      boardingPoint: pendingConfirmation.boardingPoint,
      droppingPoint: pendingConfirmation.droppingPoint,
      fare: pendingConfirmation.fare,
      ticketType: pendingConfirmation.ticketType,
      paymentStatus: pendingConfirmation.paymentStatus,
      notes: pendingConfirmation.notes,
    });

    setPendingConfirmation(null);
    // Show generated commercial ticket pass immediately to operator
    setViewingTicketBooking(newBooking);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans select-none">
      {/* 1. PRIMARY EXPERIENCE: 3D Bus Interior Viewport */}
      <div className="absolute inset-0 z-0">
        <BusScene
          bus={activeBus}
          selectedSeatId={selectedSeatId}
          getSeatState={getSeatState}
          onSelectSeat={handleSelectSeat}
          externalCameraFocus={cameraFocusTarget}
          onClearExternalFocus={() => setCameraFocusTarget(null)}
        />
      </div>

      {/* 2. TOP INFORMATION BAR (Commercial bus specifications, route & dynamic counters) */}
      <TopInfoBar
        activeBus={activeBus}
        onSelectBus={(busId) => {
          setActiveBusId(busId);
          setSelectedSeatId(null);
        }}
        metrics={metrics}
        onOpenOperatorPanel={() => setIsOperatorDrawerOpen(true)}
        onResetSeed={resetAllToSeed}
      />

      {/* 3. STREET VIEW NAVIGATION HUD (Aisle waypoints & interaction compass) */}
      <StreetViewHUD
        waypoints={activeBus.waypoints}
        currentWaypointId={activeBus.waypoints[0]?.id || ''}
        onSelectWaypoint={(wp) => {
          setCameraFocusTarget({
            position: wp.position,
            lookAt: wp.targetLookAt,
          });
        }}
        showMiniMap={showMiniMap}
        onToggleMiniMap={() => setShowMiniMap(!showMiniMap)}
      />

      {/* 4. OPTIONAL 2D SEAT MAP (Secondary orientation widget) */}
      {showMiniMap && (
        <MiniSeatMap
          bus={activeBus}
          selectedSeatId={selectedSeatId}
          getSeatState={getSeatState}
          onSelectSeat={handleSelectSeat}
          onClose={() => setShowMiniMap(false)}
        />
      )}

      {/* 5. SEAT INSPECTOR & MANUAL BOOKING PANEL */}
      {currentSeat && (
        <SeatInspectorModal
          seat={currentSeat}
          state={currentSeatState}
          booking={currentBooking}
          bus={activeBus}
          onClose={() => setSelectedSeatId(null)}
          onInitiateBookingReview={handleInitiateBookingReview}
          onCancelBooking={(bookingId) => cancelBooking(bookingId)}
          onToggleBlock={(busId, seatId) => toggleSeatBlock(busId, seatId)}
          onViewTicket={(b) => setViewingTicketBooking(b)}
          onUpdateBooking={(bId, updates) => updateBooking(bId, updates)}
        />
      )}

      {/* 6. BOOKING CONFIRMATION DIALOG (Final manual confirmation required) */}
      {pendingConfirmation && (
        <BookingConfirmationDialog
          isOpen={!!pendingConfirmation}
          onClose={() => setPendingConfirmation(null)}
          onConfirm={handleFinalConfirmBooking}
          bookingData={{
            seatLabel: pendingConfirmation.seatLabel,
            passengerName: pendingConfirmation.passengerName,
            phone: pendingConfirmation.phone,
            boardingPoint: pendingConfirmation.boardingPoint,
            droppingPoint: pendingConfirmation.droppingPoint,
            ticketType: pendingConfirmation.ticketType,
            paymentStatus: pendingConfirmation.paymentStatus,
            fare: pendingConfirmation.fare,
            busCode: activeBus.code,
            route: `${activeBus.route.from} ➔ ${activeBus.route.to}`,
          }}
        />
      )}

      {/* 7. OFFICIAL E-TICKET & BOARDING PASS MODAL */}
      {viewingTicketBooking && (
        <BookingTicketModal
          booking={viewingTicketBooking}
          bus={activeBus}
          onClose={() => setViewingTicketBooking(null)}
        />
      )}

      {/* 8. OPERATOR MANAGEMENT DRAWER (Bookings List, Passenger Manifest, Fleet) */}
      <OperatorDrawer
        isOpen={isOperatorDrawerOpen}
        onClose={() => setIsOperatorDrawerOpen(false)}
        activeBus={activeBus}
        onSelectBus={(busId) => {
          setActiveBusId(busId);
          setSelectedSeatId(null);
        }}
        bookings={getBookingsForActiveBus()}
        metrics={metrics}
        onLocateSeat={handleLocateSeat}
        onViewTicket={(b) => setViewingTicketBooking(b)}
        onCancelBooking={(bookingId) => cancelBooking(bookingId)}
        onToggleBlock={(busId, seatId) => toggleSeatBlock(busId, seatId)}
        getSeatState={getSeatState}
        onResetSeed={resetAllToSeed}
      />
    </main>
  );
}
