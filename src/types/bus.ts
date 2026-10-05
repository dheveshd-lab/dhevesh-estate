export type SeatState = 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'BLOCKED';

export type TicketType = 'Standard' | 'VIP Comfort' | 'Senior Citizen' | 'Student';

export type PaymentStatus = 'Paid' | 'Pending';

export interface Passenger {
  name: string;
  phone: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other';
  age?: number;
}

export interface Booking {
  id: string; // e.g. "BK-849201"
  busId: string;
  seatId: string;
  seatLabel: string;
  passenger: Passenger;
  boardingPoint: string;
  droppingPoint: string;
  fare: number;
  ticketType: TicketType;
  paymentStatus: PaymentStatus;
  notes?: string;
  bookedAt: string; // ISO string
  status: 'Confirmed' | 'Cancelled';
}

export interface SeatConfig {
  id: string; // e.g. "A1", "A2", "B1"
  row: number;
  column: number;
  label: string;
  tier: 'Window' | 'Aisle' | 'Solo';
  price: number;
  position: [number, number, number]; // [x, y, z] inside 3D bus
  rotation?: [number, number, number];
}

export interface NavigationWaypoint {
  id: string;
  label: string;
  position: [number, number, number]; // [x, y, z] camera target position
  targetLookAt: [number, number, number]; // [x, y, z] camera default direction
  shortDesc: string;
}

export interface BusTelemetry {
  busId: string;
  code: string;
  status: 'In Transit' | 'Stopped' | 'Depot' | 'Maintenance';
  locationName: string;
  coordinates: { lat: number; lng: number };
  speedKmh: number;
  lastUpdated: string;
  driver: {
    name: string;
    phone: string;
    license: string;
  };
  delayMinutes: number;
  estimatedArrival: string;
  nextStop: string;
  routeProgressPercent: number;
  liveGpsConnected: boolean;
}

export interface BusModel {
  id: string;
  code: string; // "BUS-101"
  name: string; // "Scania Touring HD Intercity"
  regNumber: string; // "TN 01 BX 4092"
  route: {
    from: string;
    to: string;
    stops: string[];
    distanceKm: number;
    departureTime: string;
    estimatedArrival: string;
  };
  layoutType: '2x2_Seater' | '2x1_Executive' | '2x2_Comfort';
  totalSeats: number;
  seats: SeatConfig[];
  baseFare: number;
  waypoints: NavigationWaypoint[];
}
