import { BusModel, SeatConfig, NavigationWaypoint } from '../types/bus';

// Generate 2x2 standard luxury seating layout
function generate2x2Seats(rows: number, startZ: number, rowPitch: number, basePrice: number): SeatConfig[] {
  const seats: SeatConfig[] = [];
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (let r = 0; r < rows; r++) {
    const z = startZ + r * rowPitch;
    const rowName = rowLetters[r] || `R${r + 1}`;

    // Column 1 (Window Left)
    seats.push({
      id: `${rowName}1`,
      row: r + 1,
      column: 1,
      label: `${rowName}1`,
      tier: 'Window',
      price: basePrice + 50,
      position: [-1.15, 0.55, z],
      rotation: [0, 0, 0],
    });

    // Column 2 (Aisle Left)
    seats.push({
      id: `${rowName}2`,
      row: r + 1,
      column: 2,
      label: `${rowName}2`,
      tier: 'Aisle',
      price: basePrice,
      position: [-0.62, 0.55, z],
      rotation: [0, 0, 0],
    });

    // Column 3 (Aisle Right)
    seats.push({
      id: `${rowName}3`,
      row: r + 1,
      column: 3,
      label: `${rowName}3`,
      tier: 'Aisle',
      price: basePrice,
      position: [0.62, 0.55, z],
      rotation: [0, 0, 0],
    });

    // Column 4 (Window Right)
    seats.push({
      id: `${rowName}4`,
      row: r + 1,
      column: 4,
      label: `${rowName}4`,
      tier: 'Window',
      price: basePrice + 50,
      position: [1.15, 0.55, z],
      rotation: [0, 0, 0],
    });
  }

  return seats;
}

// Generate 2x1 Royal Executive seating layout
function generate2x1Seats(rows: number, startZ: number, rowPitch: number, basePrice: number): SeatConfig[] {
  const seats: SeatConfig[] = [];
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  for (let r = 0; r < rows; r++) {
    const z = startZ + r * rowPitch;
    const rowName = rowLetters[r] || `R${r + 1}`;

    // Column 1 (Window Left)
    seats.push({
      id: `${rowName}1`,
      row: r + 1,
      column: 1,
      label: `${rowName}1`,
      tier: 'Window',
      price: basePrice + 100,
      position: [-1.15, 0.55, z],
      rotation: [0, 0, 0],
    });

    // Column 2 (Aisle Left)
    seats.push({
      id: `${rowName}2`,
      row: r + 1,
      column: 2,
      label: `${rowName}2`,
      tier: 'Aisle',
      price: basePrice + 50,
      position: [-0.58, 0.55, z],
      rotation: [0, 0, 0],
    });

    // Column 3 (Solo Window/Aisle Right)
    seats.push({
      id: `${rowName}3`,
      row: r + 1,
      column: 3,
      label: `${rowName}3`,
      tier: 'Solo',
      price: basePrice + 200,
      position: [1.05, 0.55, z],
      rotation: [0, 0, 0],
    });
  }

  return seats;
}

const standardWaypoints: NavigationWaypoint[] = [
  {
    id: 'wp_entrance',
    label: 'Front Entrance & Cockpit',
    shortDesc: 'Driver console, boarding steps & route display',
    position: [0.15, 1.5, -6.6],
    targetLookAt: [0.0, 1.4, -8.0],
  },
  {
    id: 'wp_front_aisle',
    label: 'Front Passenger Rows (A-B)',
    shortDesc: 'Front view, rows A & B seating area',
    position: [0.0, 1.5, -4.5],
    targetLookAt: [0.0, 1.4, 0.0],
  },
  {
    id: 'wp_mid_forward',
    label: 'Mid-Forward Aisle (C-D)',
    shortDesc: 'Central cabin overview, rows C & D',
    position: [0.0, 1.5, -2.0],
    targetLookAt: [0.0, 1.4, 3.0],
  },
  {
    id: 'wp_center',
    label: 'Center Coach (E-F)',
    shortDesc: 'Main aisle intersection, rows E & F',
    position: [0.0, 1.5, 0.5],
    targetLookAt: [0.0, 1.4, 5.0],
  },
  {
    id: 'wp_mid_rear',
    label: 'Mid-Rear Aisle (G-H)',
    shortDesc: 'Rear seating access, rows G & H',
    position: [0.0, 1.5, 3.0],
    targetLookAt: [0.0, 1.4, 6.0],
  },
  {
    id: 'wp_rear_exit',
    label: 'Rear Cabin & Emergency Exit',
    shortDesc: 'Back row and rear emergency doorway',
    position: [0.0, 1.5, 5.2],
    targetLookAt: [0.0, 1.4, 8.0],
  },
];

export const FLEET_BUSES: BusModel[] = [
  {
    id: 'bus-101',
    code: 'BUS-101',
    name: 'Scania Touring HD Intercity',
    regNumber: 'KA 01 F 9821',
    route: {
      from: 'Chennai',
      to: 'Bangalore',
      stops: ['Chennai CMBT', 'Sriperumbudur', 'Vellore Bypass', 'Hosur', 'Bangalore Electronic City', 'Majestic Terminal'],
      distanceKm: 348,
      departureTime: '10:30 PM',
      estimatedArrival: '05:30 AM',
    },
    layoutType: '2x2_Seater',
    totalSeats: 36,
    seats: generate2x2Seats(9, -4.6, 1.12, 850),
    baseFare: 850,
    waypoints: standardWaypoints,
  },
  {
    id: 'bus-102',
    code: 'BUS-102',
    name: 'Volvo B11R Royal Executive',
    regNumber: 'MH 12 Q 4105',
    route: {
      from: 'Mumbai',
      to: 'Pune',
      stops: ['Borivali Western Express', 'Dadar Asiad', 'Vashi Toll Plaza', 'Lonavala Expressway', 'Wakad Hinjewadi', 'Pune Swargate'],
      distanceKm: 165,
      departureTime: '08:15 AM',
      estimatedArrival: '11:45 AM',
    },
    layoutType: '2x1_Executive',
    totalSeats: 27,
    seats: generate2x1Seats(9, -4.6, 1.12, 650),
    baseFare: 650,
    waypoints: standardWaypoints,
  },
  {
    id: 'bus-103',
    code: 'BUS-103',
    name: 'Mercedes-Benz SuperCoach HD',
    regNumber: 'DL 01 AA 7729',
    route: {
      from: 'Delhi',
      to: 'Jaipur',
      stops: ['Kashmere Gate ISBT', 'Dhaula Kuan', 'Gurugram IFFCO Chowk', 'Kotputli Bypass', 'Jaipur Sindhi Camp'],
      distanceKm: 280,
      departureTime: '11:00 PM',
      estimatedArrival: '04:45 AM',
    },
    layoutType: '2x2_Comfort',
    totalSeats: 32,
    seats: generate2x2Seats(8, -4.4, 1.18, 920),
    baseFare: 920,
    waypoints: standardWaypoints,
  },
];

export const FLEET_TELEMETRY: Record<string, import('../types/bus').BusTelemetry> = {
  'bus-101': {
    busId: 'bus-101',
    code: 'BUS-101',
    status: 'In Transit',
    locationName: 'Near Vellore Bypass (KM 142)',
    coordinates: { lat: 12.9165, lng: 79.1325 },
    speedKmh: 68,
    lastUpdated: '10:42 AM',
    driver: {
      name: 'Ramesh Babu',
      phone: '+91 94441 88210',
      license: 'DL-TN-2015-8941',
    },
    delayMinutes: 0,
    estimatedArrival: '05:30 AM',
    nextStop: 'Hosur Outer Ring Road',
    routeProgressPercent: 44,
    liveGpsConnected: true,
  },
  'bus-102': {
    busId: 'bus-102',
    code: 'BUS-102',
    status: 'In Transit',
    locationName: 'Lonavala Expressway Ghats (KM 88)',
    coordinates: { lat: 18.7546, lng: 73.4062 },
    speedKmh: 54,
    lastUpdated: '10:45 AM',
    driver: {
      name: 'Santosh Shinde',
      phone: '+91 98200 44192',
      license: 'DL-MH-2012-7721',
    },
    delayMinutes: 15,
    estimatedArrival: '12:00 PM',
    nextStop: 'Wakad Hinjewadi Flyover',
    routeProgressPercent: 58,
    liveGpsConnected: true,
  },
  'bus-103': {
    busId: 'bus-103',
    code: 'BUS-103',
    status: 'Depot',
    locationName: 'Delhi Kashmere Gate ISBT Depot',
    coordinates: { lat: 28.6675, lng: 77.2285 },
    speedKmh: 0,
    lastUpdated: '10:30 AM',
    driver: {
      name: 'Gurpreet Singh',
      phone: '+91 98110 33405',
      license: 'DL-DL-2014-5502',
    },
    delayMinutes: 0,
    estimatedArrival: '04:45 AM',
    nextStop: 'Dhaula Kuan Junction',
    routeProgressPercent: 0,
    liveGpsConnected: true,
  },
};

