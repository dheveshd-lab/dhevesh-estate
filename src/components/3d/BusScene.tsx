import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { BusModel, SeatConfig, NavigationWaypoint, SeatState } from '../../types/bus';
import { Seat3D } from './Seat3D';
import { BusInterior } from './BusInterior';
import { NavigationWaypoints } from './NavigationWaypoints';
import { CameraController } from './CameraController';

interface BusSceneProps {
  bus: BusModel;
  selectedSeatId: string | null;
  getSeatState: (busId: string, seatId: string) => SeatState;
  onSelectSeat: (seat: SeatConfig) => void;
  externalCameraFocus?: { position: [number, number, number]; lookAt: [number, number, number] } | null;
  onClearExternalFocus?: () => void;
}

export const BusScene: React.FC<BusSceneProps> = ({
  bus,
  selectedSeatId,
  getSeatState,
  onSelectSeat,
  externalCameraFocus,
  onClearExternalFocus,
}) => {
  // Current camera destination for smooth Street View movement
  const initialWp = bus.waypoints[0] || {
    id: 'wp_entrance',
    label: 'Front Entrance & Cockpit',
    shortDesc: 'Entrance',
    position: [0.15, 1.5, -6.6],
    targetLookAt: [0.0, 1.4, -4.0],
  };

  const [camTargetPos, setCamTargetPos] = useState<[number, number, number]>(initialWp.position);
  const [camTargetLookAt, setCamTargetLookAt] = useState<[number, number, number]>(initialWp.targetLookAt);
  const [currentWaypointId, setCurrentWaypointId] = useState<string>(initialWp.id);

  // Hover feedback without Drei's Html roots
  const [hoveredSeat, setHoveredSeat] = useState<SeatConfig | null>(null);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<NavigationWaypoint | null>(null);

  // When active bus changes, reset camera to entrance
  useEffect(() => {
    if (bus.waypoints.length > 0) {
      const first = bus.waypoints[0];
      setCamTargetPos(first.position);
      setCamTargetLookAt(first.targetLookAt);
      setCurrentWaypointId(first.id);
    }
    setHoveredSeat(null);
    setHoveredWaypoint(null);
  }, [bus.id]);

  // Handle external focus triggers (e.g. from 2D seat map or Bookings List "LOCATE IN BUS")
  useEffect(() => {
    if (externalCameraFocus) {
      setCamTargetPos(externalCameraFocus.position);
      setCamTargetLookAt(externalCameraFocus.lookAt);
      if (onClearExternalFocus) {
        onClearExternalFocus();
      }
    }
  }, [externalCameraFocus]);

  // Click on a ground waypoint disc
  const handleSelectWaypoint = (wp: NavigationWaypoint) => {
    setCamTargetPos(wp.position);
    setCamTargetLookAt(wp.targetLookAt);
    setCurrentWaypointId(wp.id);
  };

  // Click on reachable aisle floor (Street View click-to-move)
  const handleFloorClick = (point: THREE.Vector3) => {
    const targetZ = THREE.MathUtils.clamp(point.z, -6.8, 5.4);
    const targetX = THREE.MathUtils.clamp(point.x, -0.25, 0.25);
    const eyeHeight = 1.5;

    const forwardZ = targetZ > camTargetPos[2] ? targetZ + 3.0 : targetZ - 3.0;

    setCamTargetPos([targetX, eyeHeight, targetZ]);
    setCamTargetLookAt([targetX, 1.4, forwardZ]);

    let nearestWp = bus.waypoints[0];
    let minDist = Infinity;
    bus.waypoints.forEach((wp) => {
      const dist = Math.abs(wp.position[2] - targetZ);
      if (dist < minDist) {
        minDist = dist;
        nearestWp = wp;
      }
    });
    if (nearestWp) {
      setCurrentWaypointId(nearestWp.id);
    }
  };

  // Click on a physical seat
  const handleSeatClick = (seat: SeatConfig) => {
    onSelectSeat(seat);

    const aisleX = seat.column <= 2 ? 0.05 : -0.05;
    const eyeHeight = 1.48;
    const seatZ = seat.position[2];

    setCamTargetPos([aisleX, eyeHeight, seatZ]);
    setCamTargetLookAt([seat.position[0], seat.position[1] + 0.1, seat.position[2]]);
  };

  const hoveredSeatState = hoveredSeat ? getSeatState(bus.id, hoveredSeat.id) : null;

  return (
    <div className="w-full h-full relative bg-neutral-950 overflow-hidden">
      {/* 3D WebGL Canvas (Pure Three.js graph, Zero extra React DOM roots) */}
      <Canvas
        camera={{
          fov: 65,
          near: 0.1,
          far: 50,
          position: initialWp.position,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#080b11']} />
        <fog attach="fog" args={['#080b11', 12, 35]} />

        {/* Interior Lighting Setup */}
        <ambientLight intensity={0.65} color="#cbd5e1" />

        <pointLight position={[-0.5, 1.6, -4.5]} intensity={1.2} distance={6} color="#fef3c7" />
        <pointLight position={[0.5, 1.6, -4.5]} intensity={1.2} distance={6} color="#fef3c7" />
        <pointLight position={[-0.5, 1.6, -1.0]} intensity={1.2} distance={6} color="#fef3c7" />
        <pointLight position={[0.5, 1.6, -1.0]} intensity={1.2} distance={6} color="#fef3c7" />
        <pointLight position={[-0.5, 1.6, 2.5]} intensity={1.2} distance={6} color="#fef3c7" />
        <pointLight position={[0.5, 1.6, 2.5]} intensity={1.2} distance={6} color="#fef3c7" />

        <spotLight
          position={[0, 1.6, -6.5]}
          target-position={[0, -0.2, -7.5]}
          intensity={1.5}
          angle={0.6}
          penumbra={0.8}
          color="#38bdf8"
        />

        <directionalLight position={[-6, 3, 0]} intensity={0.5} color="#60a5fa" />
        <directionalLight position={[6, 3, 0]} intensity={0.5} color="#94a3b8" />

        {/* 3D Physical Bus Shell & Interior */}
        <BusInterior bus={bus} onFloorClick={handleFloorClick} />

        {/* All Passenger Physical 3D Seats */}
        <group>
          {bus.seats.map((seat) => (
            <Seat3D
              key={seat.id}
              seat={seat}
              state={getSeatState(bus.id, seat.id)}
              onSelect={handleSeatClick}
              onHover={setHoveredSeat}
            />
          ))}
        </group>

        {/* Street View Floor Waypoints */}
        <NavigationWaypoints
          waypoints={bus.waypoints}
          currentWaypointId={currentWaypointId}
          onSelectWaypoint={handleSelectWaypoint}
          onHoverWaypoint={setHoveredWaypoint}
        />

        {/* Street View Camera Controller */}
        <CameraController
          targetPosition={camTargetPos}
          targetLookAt={camTargetLookAt}
          onFloorClick={handleFloorClick}
        />
      </Canvas>

      {/* Floating Seat Hover Tooltip (Root DOM, avoids Drei Html unmount race condition) */}
      {hoveredSeat && hoveredSeatState && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 bg-neutral-950/90 border border-neutral-700/80 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs text-white animate-in fade-in zoom-in-95 duration-100">
          <div className="w-6 h-6 rounded bg-neutral-800 border border-neutral-700 font-mono font-bold text-amber-400 flex items-center justify-center text-xs">
            {hoveredSeat.label}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Seat {hoveredSeat.label}</span>
              <span className="text-[10px] text-neutral-400">({hoveredSeat.tier})</span>
              <span
                className={`font-semibold text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  hoveredSeatState === 'AVAILABLE'
                    ? 'text-emerald-400 bg-emerald-950/80'
                    : hoveredSeatState === 'BOOKED'
                    ? 'text-blue-400 bg-blue-950/80'
                    : hoveredSeatState === 'BLOCKED'
                    ? 'text-rose-400 bg-rose-950/80'
                    : 'text-amber-400 bg-amber-950/80'
                }`}
              >
                {hoveredSeatState}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-neutral-300">₹{hoveredSeat.price}</span>
              <span>·</span>
              <span>Click seat to inspect & book</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Waypoint Hover Tooltip */}
      {hoveredWaypoint && (
        <div className="pointer-events-none absolute top-14 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-sky-950/90 border border-sky-600/70 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-sky-200 animate-in fade-in zoom-in-95 duration-100">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-semibold">{hoveredWaypoint.label}</span>
          <span className="text-[10px] text-sky-300">· Click disc to glide here</span>
        </div>
      )}
    </div>
  );
};
