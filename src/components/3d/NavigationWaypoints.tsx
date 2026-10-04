import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { NavigationWaypoint } from '../../types/bus';

interface NavigationWaypointsProps {
  waypoints: NavigationWaypoint[];
  currentWaypointId: string;
  onSelectWaypoint: (wp: NavigationWaypoint) => void;
}

export const NavigationWaypoints: React.FC<NavigationWaypointsProps> = ({
  waypoints,
  currentWaypointId,
  onSelectWaypoint,
}) => {
  return (
    <group>
      {waypoints.map((wp) => (
        <WaypointNode
          key={wp.id}
          waypoint={wp}
          isCurrent={wp.id === currentWaypointId}
          onSelect={() => onSelectWaypoint(wp)}
        />
      ))}
    </group>
  );
};

interface WaypointNodeProps {
  waypoint: NavigationWaypoint;
  isCurrent: boolean;
  onSelect: () => void;
}

const WaypointNode: React.FC<WaypointNodeProps> = ({ waypoint, isCurrent, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  // Animate pulse ring
  useFrame((state) => {
    if (pulseRef.current) {
      const time = state.clock.getElapsedTime();
      const scale = 1.0 + (Math.sin(time * 3) + 1) * 0.15;
      pulseRef.current.scale.set(scale, scale, 1);
    }
  });

  // Waypoint sits on the floor: Y = -0.54 (just above floor carpet)
  const floorPos: [number, number, number] = [waypoint.position[0], -0.54, waypoint.position[2]];

  return (
    <group position={floorPos}>
      {/* Outer Pulse Ring */}
      <mesh
        ref={pulseRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <ringGeometry args={[0.28, 0.35, 32]} />
        <meshBasicMaterial
          color={isCurrent ? '#38bdf8' : hovered ? '#60a5fa' : '#94a3b8'}
          transparent
          opacity={isCurrent ? 0.4 : hovered ? 0.6 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main Clickable Disc */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
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
        <circleGeometry args={[0.26, 32]} />
        <meshBasicMaterial
          color={isCurrent ? '#0284c7' : hovered ? '#2563eb' : '#334155'}
          transparent
          opacity={isCurrent ? 0.9 : hovered ? 0.85 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner Accent Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <ringGeometry args={[0.15, 0.18, 24]} />
        <meshBasicMaterial
          color={isCurrent ? '#bae6fd' : '#f8fafc'}
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Directional Chevron Arrow on Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <coneGeometry args={[0.06, 0.1, 3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Street View Node Tag */}
      {(hovered || isCurrent) && (
        <Html position={[0, 0.25, 0]} center distanceFactor={8}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`pointer-events-auto cursor-pointer transition-all duration-200 px-2.5 py-1 rounded-full text-xs font-medium shadow-xl border flex items-center gap-1.5 whitespace-nowrap ${
              isCurrent
                ? 'bg-sky-950/90 text-sky-200 border-sky-400/50 backdrop-blur-md'
                : 'bg-neutral-900/90 text-neutral-200 border-neutral-700/80 backdrop-blur-md hover:bg-neutral-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-sky-400' : 'bg-blue-500'}`} />
            <span>{waypoint.label}</span>
            {!isCurrent && <span className="text-[10px] text-neutral-400">· Walk here</span>}
          </div>
        </Html>
      )}
    </group>
  );
};
