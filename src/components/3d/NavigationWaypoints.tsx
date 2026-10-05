import React, { useState, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { NavigationWaypoint } from '../../types/bus';

interface NavigationWaypointsProps {
  waypoints: NavigationWaypoint[];
  currentWaypointId: string;
  onSelectWaypoint: (wp: NavigationWaypoint) => void;
  onHoverWaypoint?: (wp: NavigationWaypoint | null) => void;
}

export const NavigationWaypoints: React.FC<NavigationWaypointsProps> = ({
  waypoints,
  currentWaypointId,
  onSelectWaypoint,
  onHoverWaypoint,
}) => {
  return (
    <group>
      {waypoints.map((wp) => (
        <WaypointNode
          key={wp.id}
          waypoint={wp}
          isCurrent={wp.id === currentWaypointId}
          onSelect={() => onSelectWaypoint(wp)}
          onHover={onHoverWaypoint}
        />
      ))}
    </group>
  );
};

interface WaypointNodeProps {
  waypoint: NavigationWaypoint;
  isCurrent: boolean;
  onSelect: () => void;
  onHover?: (wp: NavigationWaypoint | null) => void;
}

const WaypointNode: React.FC<WaypointNodeProps> = ({
  waypoint,
  isCurrent,
  onSelect,
  onHover,
}) => {
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
          if (onHover) onHover(waypoint);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (onHover) onHover(null);
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
    </group>
  );
};
