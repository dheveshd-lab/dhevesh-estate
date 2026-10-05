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
import { Dashboard } from './components/dashboard/Dashboard';
import { FleetMap } from './components/map/FleetMap';
import { AIOperationsAgent } from './components/ai/AIOperationsAgent';
import { Sparkles } from 'lucide-react';

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
    getAllBookings,
    getMetrics,
    getGlobalFleetMetrics,
    confirmManualBooking,
    updateBooking,
    cancelBooking,
    toggleSeatBlock,
    resetAllToSeed,
  } = useBookingStore();

  // Primary view state: 'dashboard' | 'interior' | 'map'
  const [currentView, setCurrentView] = useState<'dashboard' | 'interior' | 'map'>('dashboard');

  // UI state
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isOperatorDrawerOpen, setIsOperatorDrawerOpen] = useState(false);
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);
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

  // Metrics directly derived from real data
  const busMetrics = getMetrics(activeBusId);
  const globalMetrics = getGlobalFleetMetrics();
  const allBookings = getAllBookings();

  // Currently inspected seat object
  const currentSeat = activeBus.seats.find((s) => s.id === selectedSeatId) || null;
  const currentBooking = selectedSeatId ? getBookingForSeat(activeBusId, selectedSeatId) : undefined;
  const currentSeatState = selectedSeatId ? getSeatState(activeBusId, selectedSeatId) : 'AVAILABLE';

  // Transition operator directly into 3D interior (optionally targeting a specific seat)
  const handleEnter3DInterior = (busId?: string, seatId?: string) => {
    if (busId && busId !== activeBusId) {
      setActiveBusId(busId);
      setSelectedSeatId(null);
    }
    setCurrentView('interior');

    if (seatId) {
      setTimeout(() => {
        const busObj = activeBus;
        const targetSeat = busObj.seats.find((s) => s.id === seatId || s.label === seatId);
        if (targetSeat) {
          handleSelectSeat(targetSeat);
        }
      }, 100);
    }
  };

  // Transition to Fleet Map
  const handleOpenFleetMap = (busId?: string) => {
    if (busId && busId !== activeBusId) {
      setActiveBusId(busId);
    }
    setCurrentView('map');
  };

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
    setCurrentView('interior');
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
      {/* 1. TOP INFORMATION BAR (Persistent across Dashboard, 3D Interior, and Fleet Map) */}
      <TopInfoBar
        currentView={currentView}
        onChangeView={setCurrentView}
        activeBus={activeBus}
        onSelectBus={(busId) => {
          setActiveBusId(busId);
          setSelectedSeatId(null);
        }}
        metrics={busMetrics}
        onOpenOperatorPanel={() => setIsOperatorDrawerOpen(true)}
        onOpenAIAgent={() => setIsAIAgentOpen(true)}
        onResetSeed={resetAllToSeed}
      />

      {/* 2. PRIMARY VIEW RENDERING */}
      {currentView === 'dashboard' ? (
        <Dashboard
          onEnter3DInterior={handleEnter3DInterior}
          onOpenFleetMap={handleOpenFleetMap}
          onOpenOperatorPanel={(tab) => setIsOperatorDrawerOpen(true)}
          onOpenAIAgent={() => setIsAIAgentOpen(true)}
          onViewTicket={(b) => setViewingTicketBooking(b)}
          allBookings={allBookings}
          getMetrics={getMetrics}
          globalMetrics={globalMetrics}
        />
      ) : currentView === 'map' ? (
        <FleetMap
          onEnter3DInterior={handleEnter3DInterior}
          onOpenOperatorPanel={(tab) => setIsOperatorDrawerOpen(true)}
          selectedBusId={activeBusId}
          onSelectBus={(busId) => setActiveBusId(busId)}
        />
      ) : (
        <div className="absolute inset-0 z-0">
          {/* 3D Bus Interior Viewport */}
          <BusScene
            bus={activeBus}
            selectedSeatId={selectedSeatId}
            getSeatState={getSeatState}
            onSelectSeat={handleSelectSeat}
            externalCameraFocus={cameraFocusTarget}
            onClearExternalFocus={() => setCameraFocusTarget(null)}
          />

          {/* Street View Navigation HUD (Aisle waypoints & interaction compass) */}
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

          {/* Optional 2D Cabin Seat Map */}
          {showMiniMap && (
            <MiniSeatMap
              bus={activeBus}
              selectedSeatId={selectedSeatId}
              getSeatState={getSeatState}
              onSelectSeat={handleSelectSeat}
              onClose={() => setShowMiniMap(false)}
            />
          )}

          {/* Seat Inspector & Manual Ticketing Panel */}
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
        </div>
      )}

      {/* Floating AI Operations Launcher in bottom corner */}
      {!isAIAgentOpen && (
        <button
          onClick={() => setIsAIAgentOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-sky-400 via-teal-300 to-sky-300 hover:from-sky-300 hover:to-teal-200 text-sky-950 font-bold text-xs rounded-full shadow-2xl transition-all duration-150 cursor-pointer border border-sky-200/50 hover:scale-105 active:scale-95"
          title="Open AI Operations Agent"
        >
          <Sparkles className="w-4 h-4 text-sky-950" />
          <span>✦ AI OPERATIONS</span>
        </button>
      )}

      {/* 3. AI OPERATIONS AGENT PANEL */}
      <AIOperationsAgent
        isOpen={isAIAgentOpen}
        onClose={() => setIsAIAgentOpen(false)}
        onEnter3DInterior={handleEnter3DInterior}
        onOpenFleetMap={handleOpenFleetMap}
        onOpenOperatorPanel={(tab) => setIsOperatorDrawerOpen(true)}
        onCancelBooking={(id) => cancelBooking(id)}
        allBookings={allBookings}
        metrics={globalMetrics}
      />

      {/* 4. BOOKING CONFIRMATION DIALOG (Global manual confirmation modal) */}
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

      {/* 5. OFFICIAL E-TICKET & BOARDING PASS MODAL */}
      {viewingTicketBooking && (
        <BookingTicketModal
          booking={viewingTicketBooking}
          bus={activeBus}
          onClose={() => setViewingTicketBooking(null)}
        />
      )}

      {/* 6. OPERATOR MANAGEMENT DRAWER (Bookings List, Passenger Manifest, Fleet) */}
      <OperatorDrawer
        isOpen={isOperatorDrawerOpen}
        onClose={() => setIsOperatorDrawerOpen(false)}
        activeBus={activeBus}
        onSelectBus={(busId) => {
          setActiveBusId(busId);
          setSelectedSeatId(null);
        }}
        bookings={getBookingsForActiveBus()}
        metrics={busMetrics}
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
