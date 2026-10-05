import { useState, useEffect } from 'react';
import { Booking, SeatState, BusModel } from '../types/bus';
import { FLEET_BUSES } from '../data/fleetData';

const BOOKINGS_KEY = 'fleetcraft_bookings_v2';
const BLOCKED_KEY = 'fleetcraft_blocked_seats_v2';
const ACTIVE_BUS_KEY = 'fleetcraft_active_bus_id_v2';

// Initial pre-booked sample data so the operator can inspect existing commercial records,
// but NO AUTOMATIC BOOKING happens while the app is running!
const INITIAL_SEED_BOOKINGS: Booking[] = [
  {
    id: 'BK-419082',
    busId: 'bus-101',
    seatId: 'A1',
    seatLabel: 'A1',
    passenger: {
      name: 'Dr. Rajesh Sundaram',
      phone: '+91 98401 23456',
      gender: 'Male',
      age: 44,
    },
    boardingPoint: 'Chennai CMBT',
    droppingPoint: 'Majestic Terminal',
    fare: 900,
    ticketType: 'VIP Comfort',
    paymentStatus: 'Paid',
    notes: 'Doctor on emergency transit, needs front window seat',
    bookedAt: '2026-10-03T18:30:00Z',
    status: 'Confirmed',
  },
  {
    id: 'BK-582014',
    busId: 'bus-101',
    seatId: 'C3',
    seatLabel: 'C3',
    passenger: {
      name: 'Ananya Sharma',
      phone: '+91 97412 88719',
      gender: 'Female',
      age: 28,
    },
    boardingPoint: 'Vellore Bypass',
    droppingPoint: 'Bangalore Electronic City',
    fare: 850,
    ticketType: 'Standard',
    paymentStatus: 'Paid',
    notes: 'Luggage: 1 trolley bag in boot',
    bookedAt: '2026-10-03T20:15:00Z',
    status: 'Confirmed',
  },
  {
    id: 'BK-719340',
    busId: 'bus-101',
    seatId: 'D2',
    seatLabel: 'D2',
    passenger: {
      name: 'Karthik Ramanathan',
      phone: '+91 94440 55120',
      gender: 'Male',
      age: 35,
    },
    boardingPoint: 'Chennai CMBT',
    droppingPoint: 'Majestic Terminal',
    fare: 850,
    ticketType: 'Standard',
    paymentStatus: 'Pending',
    notes: 'Conductor to collect fare at boarding check-in',
    bookedAt: '2026-10-04T07:10:00Z',
    status: 'Confirmed',
  },
];

const INITIAL_SEED_BLOCKED: Record<string, string[]> = {
  'bus-101': ['A2'], // Reserved for co-driver/attendant
  'bus-102': ['A1'], // Reserved for tour guide
  'bus-103': [],
};

class BookingStoreService {
  private bookings: Booking[] = [];
  private blockedSeats: Record<string, string[]> = {};
  private activeBusId: string = 'bus-101';
  private selectedSeatId: string | null = null;
  private cameraFocusTarget: { position: [number, number, number]; lookAt: [number, number, number] } | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedBookings = localStorage.getItem(BOOKINGS_KEY);
      if (storedBookings) {
        this.bookings = JSON.parse(storedBookings);
      } else {
        this.bookings = [...INITIAL_SEED_BOOKINGS];
        this.saveBookings();
      }

      const storedBlocked = localStorage.getItem(BLOCKED_KEY);
      if (storedBlocked) {
        this.blockedSeats = JSON.parse(storedBlocked);
      } else {
        this.blockedSeats = { ...INITIAL_SEED_BLOCKED };
        this.saveBlocked();
      }

      const storedBusId = localStorage.getItem(ACTIVE_BUS_KEY);
      if (storedBusId && FLEET_BUSES.some((b) => b.id === storedBusId)) {
        this.activeBusId = storedBusId;
      }
    } catch {
      this.bookings = [...INITIAL_SEED_BOOKINGS];
      this.blockedSeats = { ...INITIAL_SEED_BLOCKED };
    }
  }

  private saveBookings() {
    try {
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(this.bookings));
    } catch (e) {
      console.error('Failed to save bookings to localStorage', e);
    }
  }

  private saveBlocked() {
    try {
      localStorage.setItem(BLOCKED_KEY, JSON.stringify(this.blockedSeats));
    } catch (e) {
      console.error('Failed to save blocked seats to localStorage', e);
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActiveBus(): BusModel {
    return FLEET_BUSES.find((b) => b.id === this.activeBusId) || FLEET_BUSES[0];
  }

  public getActiveBusId(): string {
    return this.activeBusId;
  }

  public setActiveBusId(busId: string) {
    if (this.activeBusId !== busId) {
      this.activeBusId = busId;
      this.selectedSeatId = null;
      try {
        localStorage.setItem(ACTIVE_BUS_KEY, busId);
      } catch {}
      this.notify();
    }
  }

  public getSelectedSeatId(): string | null {
    return this.selectedSeatId;
  }

  public setSelectedSeatId(seatId: string | null) {
    if (this.selectedSeatId !== seatId) {
      this.selectedSeatId = seatId;
      this.notify();
    }
  }

  public getCameraFocusTarget() {
    return this.cameraFocusTarget;
  }

  public setCameraFocusTarget(target: { position: [number, number, number]; lookAt: [number, number, number] } | null) {
    this.cameraFocusTarget = target;
    this.notify();
  }

  public getSeatState(busId: string, seatId: string): SeatState {
    if (this.selectedSeatId === seatId && this.activeBusId === busId) {
      return 'SELECTED';
    }
    const isBlocked = (this.blockedSeats[busId] || []).includes(seatId);
    if (isBlocked) {
      return 'BLOCKED';
    }
    const booking = this.bookings.find(
      (b) => b.busId === busId && b.seatId === seatId && b.status === 'Confirmed'
    );
    if (booking) {
      return 'BOOKED';
    }
    return 'AVAILABLE';
  }

  public getBookingForSeat(busId: string, seatId: string): Booking | undefined {
    return this.bookings.find(
      (b) => b.busId === busId && b.seatId === seatId && b.status === 'Confirmed'
    );
  }

  public getBookingsForActiveBus(): Booking[] {
    return this.bookings.filter((b) => b.busId === this.activeBusId);
  }

  public getAllBookings(): Booking[] {
    return [...this.bookings];
  }

  public getMetrics(busId: string) {
    const bus = FLEET_BUSES.find((b) => b.id === busId) || FLEET_BUSES[0];
    const total = bus.seats.length;
    const booked = this.bookings.filter((b) => b.busId === busId && b.status === 'Confirmed').length;
    const blocked = (this.blockedSeats[busId] || []).length;
    const available = Math.max(0, total - booked - blocked);

    return { total, available, booked, blocked };
  }

  public getGlobalFleetMetrics() {
    const totalBuses = FLEET_BUSES.length;
    const activeTrips = FLEET_BUSES.length;

    const confirmedBookings = this.bookings.filter((b) => b.status === 'Confirmed');
    const paidBookings = confirmedBookings.filter((b) => b.paymentStatus === 'Paid');
    const revenue = paidBookings.reduce((sum, b) => sum + (b.fare || 0), 0);

    const pendingBookings = confirmedBookings.filter((b) => b.paymentStatus === 'Pending');
    const pendingAmount = pendingBookings.reduce((sum, b) => sum + (b.fare || 0), 0);

    const totalSeats = FLEET_BUSES.reduce((sum, b) => sum + b.seats.length, 0);
    const totalBookedSeats = confirmedBookings.length;

    return {
      totalBuses,
      activeTrips,
      revenue,
      paidCount: paidBookings.length,
      pendingAmount,
      pendingCount: pendingBookings.length,
      totalBookingsCount: confirmedBookings.length,
      totalSeats,
      totalBookedSeats,
    };
  }

  // STRICT MANUAL BOOKING: Only executed upon operator's explicit confirmation!
  public confirmManualBooking(data: {
    busId: string;
    seatId: string;
    seatLabel: string;
    passenger: {
      name: string;
      phone: string;
      email?: string;
      gender?: 'Male' | 'Female' | 'Other';
      age?: number;
    };
    boardingPoint: string;
    droppingPoint: string;
    fare: number;
    ticketType: any;
    paymentStatus: 'Paid' | 'Pending';
    notes?: string;
  }): Booking {
    // Generate clean commercial ticket ID
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `BK-${randomHex}`;

    const newBooking: Booking = {
      id: bookingId,
      busId: data.busId,
      seatId: data.seatId,
      seatLabel: data.seatLabel,
      passenger: data.passenger,
      boardingPoint: data.boardingPoint,
      droppingPoint: data.droppingPoint,
      fare: data.fare,
      ticketType: data.ticketType,
      paymentStatus: data.paymentStatus,
      notes: data.notes || '',
      bookedAt: new Date().toISOString(),
      status: 'Confirmed',
    };

    // Remove any previous active booking on this seat if existing
    this.bookings = this.bookings.filter(
      (b) => !(b.busId === data.busId && b.seatId === data.seatId && b.status === 'Confirmed')
    );

    this.bookings.unshift(newBooking);
    this.saveBookings();
    this.notify();
    return newBooking;
  }

  public updateBooking(bookingId: string, updates: Partial<Booking>) {
    this.bookings = this.bookings.map((b) => {
      if (b.id === bookingId) {
        return { ...b, ...updates };
      }
      return b;
    });
    this.saveBookings();
    this.notify();
  }

  public cancelBooking(bookingId: string): boolean {
    const existing = this.bookings.find((b) => b.id === bookingId);
    if (!existing) return false;

    // Filter out active booking so seat returns to AVAILABLE
    this.bookings = this.bookings.filter((b) => b.id !== bookingId);
    this.saveBookings();
    this.notify();
    return true;
  }

  public toggleSeatBlock(busId: string, seatId: string) {
    const currentList = this.blockedSeats[busId] || [];
    if (currentList.includes(seatId)) {
      this.blockedSeats[busId] = currentList.filter((id) => id !== seatId);
    } else {
      this.blockedSeats[busId] = [...currentList, seatId];
      // If was booked, remove booking
      this.bookings = this.bookings.filter(
        (b) => !(b.busId === busId && b.seatId === seatId && b.status === 'Confirmed')
      );
      this.saveBookings();
    }
    this.saveBlocked();
    this.notify();
  }

  public resetAllToSeed() {
    this.bookings = [...INITIAL_SEED_BOOKINGS];
    this.blockedSeats = { ...INITIAL_SEED_BLOCKED };
    this.saveBookings();
    this.saveBlocked();
    this.notify();
  }
}

export const bookingStore = new BookingStoreService();

export function useBookingStore() {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = bookingStore.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  return {
    activeBus: bookingStore.getActiveBus(),
    activeBusId: bookingStore.getActiveBusId(),
    selectedSeatId: bookingStore.getSelectedSeatId(),
    cameraFocusTarget: bookingStore.getCameraFocusTarget(),
    setActiveBusId: (id: string) => bookingStore.setActiveBusId(id),
    setSelectedSeatId: (id: string | null) => bookingStore.setSelectedSeatId(id),
    setCameraFocusTarget: (target: any) => bookingStore.setCameraFocusTarget(target),
    getSeatState: (busId: string, seatId: string) => bookingStore.getSeatState(busId, seatId),
    getBookingForSeat: (busId: string, seatId: string) => bookingStore.getBookingForSeat(busId, seatId),
    getBookingsForActiveBus: () => bookingStore.getBookingsForActiveBus(),
    getAllBookings: () => bookingStore.getAllBookings(),
    getMetrics: (busId: string) => bookingStore.getMetrics(busId),
    getGlobalFleetMetrics: () => bookingStore.getGlobalFleetMetrics(),
    confirmManualBooking: (data: any) => bookingStore.confirmManualBooking(data),
    updateBooking: (id: string, updates: any) => bookingStore.updateBooking(id, updates),
    cancelBooking: (id: string) => bookingStore.cancelBooking(id),
    toggleSeatBlock: (busId: string, seatId: string) => bookingStore.toggleSeatBlock(busId, seatId),
    resetAllToSeed: () => bookingStore.resetAllToSeed(),
  };
}
