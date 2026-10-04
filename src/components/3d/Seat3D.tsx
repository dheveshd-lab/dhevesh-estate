import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { SeatConfig, SeatState } from '../../types/bus';

interface Seat3DProps {
  seat: SeatConfig;
  state: SeatState;
  onSelect: (seat: SeatConfig) => void;
}

export const Seat3D: React.FC<Seat3DProps> = ({ seat, state, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Seat material colors based on commercial state
  const getColors = () => {
    switch (state) {
      case 'SELECTED':
        return {
          cushion: '#d97706', // Amber gold
          back: '#b45309',
          headrest: '#78350f',
          frame: '#1e293b',
          glow: '#fbbf24',
          badgeBg: 'bg-amber-500 text-black',
        };
      case 'BOOKED':
        return {
          cushion: '#1e3a8a', // Deep corporate navy
          back: '#1e293b',
          headrest: '#0f172a',
          frame: '#0f172a',
          glow: '#3b82f6',
          badgeBg: 'bg-blue-600 text-white',
        };
      case 'BLOCKED':
        return {
          cushion: '#334155', // Charcoal blocked
          back: '#1e293b',
          headrest: '#475569',
          frame: '#020617',
          glow: '#ef4444',
          badgeBg: 'bg-rose-600 text-white',
        };
      case 'AVAILABLE':
      default:
        return {
          cushion: hovered ? '#3b4252' : '#2e3440', // Rich charcoal executive fabric
          back: hovered ? '#2b303c' : '#222630',
          headrest: '#1a1d24',
          frame: '#0f1117',
          glow: '#10b981',
          badgeBg: 'bg-emerald-600 text-white',
        };
    }
  };

  const colors = getColors();

  // Subtle breathing highlight for selected seat
  useFrame((_, delta) => {
    if (groupRef.current && state === 'SELECTED') {
      groupRef.current.position.y = seat.position[1] + Math.sin(Date.now() * 0.003) * 0.015;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.damp(
        groupRef.current.position.y,
        seat.position[1],
        10,
        delta
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={seat.position}
      rotation={seat.rotation ? [seat.rotation[0], seat.rotation[1], seat.rotation[2]] : [0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(seat);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Base Floor Mounting Pedestal */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.3, 12]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Floor Flange */}
      <mesh position={[0, -0.56, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Seat Bottom Cushion */}
      <mesh position={[0, -0.22, 0.02]}>
        <boxGeometry args={[0.44, 0.12, 0.44]} />
        <meshStandardMaterial
          color={colors.cushion}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Seat Backrest (Ergonomic slight backward tilt) */}
      <mesh position={[0, 0.12, -0.18]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.42, 0.58, 0.1]} />
        <meshStandardMaterial
          color={colors.back}
          roughness={0.7}
          metalness={0.08}
        />
      </mesh>

      {/* Lumbar Support Pad */}
      <mesh position={[0, -0.04, -0.13]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.36, 0.2, 0.04]} />
        <meshStandardMaterial
          color={colors.cushion}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* Headrest */}
      <mesh position={[0, 0.48, -0.22]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[0.3, 0.18, 0.12]} />
        <meshStandardMaterial
          color={colors.headrest}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Outer Side Armrest */}
      <mesh position={[seat.column <= 2 ? -0.23 : 0.23, -0.1, 0.02]}>
        <boxGeometry args={[0.04, 0.18, 0.38]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Armrest top soft cushion pad */}
      <mesh position={[seat.column <= 2 ? -0.23 : 0.23, 0.0, 0.02]}>
        <boxGeometry args={[0.05, 0.03, 0.34]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Seat back pocket / grab handle for passenger behind */}
      <mesh position={[0, 0.12, -0.24]}>
        <boxGeometry args={[0.34, 0.25, 0.02]} />
        <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Active Selection / Hover Ring On Floor */}
      {(hovered || state === 'SELECTED') && (
        <mesh position={[0, -0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.32, 24]} />
          <meshBasicMaterial
            color={state === 'SELECTED' ? '#fbbf24' : '#38bdf8'}
            side={THREE.DoubleSide}
            transparent
            opacity={state === 'SELECTED' ? 0.9 : 0.5}
          />
        </mesh>
      )}

      {/* Seat Number Tag HTML Badge */}
      <Html
        position={[0, 0.52, -0.14]}
        center
        distanceFactor={6}
        zIndexRange={[10, 50]}
        transform
        occlude
      >
        <div
          className={`pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight shadow-sm flex items-center gap-1 border border-white/10 ${colors.badgeBg}`}
        >
          <span>{seat.label}</span>
          {state === 'BOOKED' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </div>
      </Html>

      {/* Hover Information Tooltip */}
      {hovered && (
        <Html position={[0, 0.8, 0]} center distanceFactor={7}>
          <div className="pointer-events-none px-2.5 py-1.5 bg-neutral-900/95 border border-neutral-700/80 rounded-lg shadow-xl backdrop-blur-md text-xs text-white whitespace-nowrap flex flex-col items-center gap-0.5">
            <div className="font-semibold flex items-center gap-1.5">
              <span>Seat {seat.label}</span>
              <span className="text-[10px] text-neutral-400 font-normal">({seat.tier})</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-300">
              <span
                className={`font-semibold ${
                  state === 'AVAILABLE'
                    ? 'text-emerald-400'
                    : state === 'BOOKED'
                    ? 'text-blue-400'
                    : state === 'BLOCKED'
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {state}
              </span>
              <span>·</span>
              <span className="font-mono text-neutral-200">₹{seat.price}</span>
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5">Click to inspect</div>
          </div>
        </Html>
      )}
    </group>
  );
};
