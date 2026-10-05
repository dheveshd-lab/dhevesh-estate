import React, { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SeatConfig, SeatState } from '../../types/bus';

interface Seat3DProps {
  seat: SeatConfig;
  state: SeatState;
  onSelect: (seat: SeatConfig) => void;
  onHover?: (seat: SeatConfig | null) => void;
}

// Canvas-based texture generator for crisp, zero-DOM-root seat number badge
const badgeTextureCache = new Map<string, THREE.CanvasTexture>();

function getSeatBadgeTexture(label: string, state: SeatState): THREE.CanvasTexture {
  const cacheKey = `${label}_${state}`;
  if (badgeTextureCache.has(cacheKey)) {
    return badgeTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    let bgColor = '#059669'; // Emerald
    let textColor = '#ffffff';
    let borderColor = '#34d399';

    if (state === 'SELECTED') {
      bgColor = '#d97706'; // Amber
      textColor = '#ffffff';
      borderColor = '#fbbf24';
    } else if (state === 'BOOKED') {
      bgColor = '#1d4ed8'; // Royal Blue
      textColor = '#ffffff';
      borderColor = '#60a5fa';
    } else if (state === 'BLOCKED') {
      bgColor = '#be123c'; // Rose
      textColor = '#ffffff';
      borderColor = '#f43f5e';
    }

    // Pill background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(6, 6, 116, 52, 12);
    ctx.fill();
    ctx.stroke();

    // Text label
    ctx.fillStyle = textColor;
    ctx.font = 'bold 30px monospace, "Courier New", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 64, 33);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  badgeTextureCache.set(cacheKey, texture);
  return texture;
}

export const Seat3D: React.FC<Seat3DProps> = ({ seat, state, onSelect, onHover }) => {
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
        };
      case 'BOOKED':
        return {
          cushion: '#1e3a8a', // Deep corporate navy
          back: '#1e293b',
          headrest: '#0f172a',
        };
      case 'BLOCKED':
        return {
          cushion: '#334155', // Charcoal blocked
          back: '#1e293b',
          headrest: '#475569',
        };
      case 'AVAILABLE':
      default:
        return {
          cushion: hovered ? '#3b4252' : '#2e3440', // Rich charcoal executive fabric
          back: hovered ? '#2b303c' : '#222630',
          headrest: '#1a1d24',
        };
    }
  };

  const colors = getColors();

  // Generate or retrieve cached 2D texture for badge
  const badgeTexture = useMemo(() => {
    return getSeatBadgeTexture(seat.label, state);
  }, [seat.label, state]);

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
        if (onHover) onHover(seat);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        if (onHover) onHover(null);
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

      {/* Crisp 3D Seat Label Badge (Pure CanvasTexture mesh, zero DOM roots) */}
      <mesh position={[0, 0.48, -0.155]} rotation={[-0.1, 0, 0]}>
        <planeGeometry args={[0.18, 0.09]} />
        <meshBasicMaterial map={badgeTexture} transparent />
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
    </group>
  );
};
