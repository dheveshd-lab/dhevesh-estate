import React from 'react';
import * as THREE from 'three';
import { BusModel } from '../../types/bus';

interface BusInteriorProps {
  bus: BusModel;
  onFloorClick?: (point: THREE.Vector3) => void;
}

export const BusInterior: React.FC<BusInteriorProps> = ({ bus, onFloorClick }) => {
  return (
    <group>
      {/* ========================================================
          1. FLOORING SYSTEM
          ======================================================== */}
      {/* Central Aisle Floor (Walkable non-slip commercial runner) */}
      <mesh
        position={[0, -0.55, -0.5]}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (onFloorClick) {
            onFloorClick(e.point);
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'crosshair';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[0.9, 0.04, 15.5]} />
        <meshStandardMaterial
          color="#1e222b"
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Aisle Edge Safety Strip (Left) */}
      <mesh position={[-0.44, -0.53, -0.5]}>
        <boxGeometry args={[0.02, 0.01, 15.5]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.5} opacity={0.6} transparent />
      </mesh>

      {/* Aisle Edge Safety Strip (Right) */}
      <mesh position={[0.44, -0.53, -0.5]}>
        <boxGeometry args={[0.02, 0.01, 15.5]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.5} opacity={0.6} transparent />
      </mesh>

      {/* Left Raised Platform for Seats */}
      <mesh position={[-0.95, -0.51, -0.5]} receiveShadow>
        <boxGeometry args={[0.9, 0.08, 14.5]} />
        <meshStandardMaterial color="#14171f" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Right Raised Platform for Seats */}
      <mesh position={[0.95, -0.51, -0.5]} receiveShadow>
        <boxGeometry args={[0.9, 0.08, 14.5]} />
        <meshStandardMaterial color="#14171f" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* ========================================================
          2. ROOF & CEILING WITH RECESSED LIGHTING
          ======================================================== */}
      {/* Main Curved Ceiling Shell */}
      <mesh position={[0, 1.82, -0.5]}>
        <boxGeometry args={[2.7, 0.06, 16.0]} />
        <meshStandardMaterial color="#1c202a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Central Roof Acoustic Panel */}
      <mesh position={[0, 1.79, -0.5]}>
        <boxGeometry args={[1.2, 0.02, 15.5]} />
        <meshStandardMaterial color="#262b37" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Left Longitudinal Warm LED Lighting Strip */}
      <mesh position={[-0.6, 1.77, -0.5]}>
        <boxGeometry args={[0.08, 0.02, 14.8]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* Right Longitudinal Warm LED Lighting Strip */}
      <mesh position={[0.6, 1.77, -0.5]}>
        <boxGeometry args={[0.08, 0.02, 14.8]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#fbbf24"
          emissiveIntensity={0.65}
          roughness={0.3}
        />
      </mesh>

      {/* Ceiling Blue Night Courtesy Ambient Strip */}
      <mesh position={[0, 1.78, -0.5]}>
        <boxGeometry args={[0.04, 0.01, 15.0]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#3b82f6"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* ========================================================
          3. SIDE WALLS & PANORAMIC WINDOW SYSTEM
          ======================================================== */}
      {/* Left Wall Baseboard & Heating Ducts */}
      <mesh position={[-1.38, -0.1, -0.5]}>
        <boxGeometry args={[0.06, 0.8, 15.5]} />
        <meshStandardMaterial color="#181b22" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Right Wall Baseboard & Heating Ducts */}
      <mesh position={[1.38, -0.1, -0.5]}>
        <boxGeometry args={[0.06, 0.8, 15.5]} />
        <meshStandardMaterial color="#181b22" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Left Panoramic Tinted Windows */}
      <mesh position={[-1.37, 0.82, -0.5]}>
        <boxGeometry args={[0.02, 1.05, 14.8]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transmission={0.75}
          opacity={0.88}
          transparent
          roughness={0.1}
          ior={1.45}
        />
      </mesh>

      {/* Right Panoramic Tinted Windows */}
      <mesh position={[1.37, 0.82, -0.5]}>
        <boxGeometry args={[0.02, 1.05, 14.8]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transmission={0.75}
          opacity={0.88}
          transparent
          roughness={0.1}
          ior={1.45}
        />
      </mesh>

      {/* Window Structural Pillars (Vertical Mullions every 1.8m) */}
      {[-5.8, -4.0, -2.2, -0.4, 1.4, 3.2, 5.0].map((zPos, idx) => (
        <group key={`mullion-${idx}`}>
          {/* Left Pillar */}
          <mesh position={[-1.36, 0.82, zPos]}>
            <boxGeometry args={[0.06, 1.15, 0.12]} />
            <meshStandardMaterial color="#1e2430" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Right Pillar */}
          <mesh position={[1.36, 0.82, zPos]}>
            <boxGeometry args={[0.06, 1.15, 0.12]} />
            <meshStandardMaterial color="#1e2430" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Exterior Road / Night City Ambience Horizon (Visible through windows) */}
      <mesh position={[-4.5, 0.8, -0.5]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#090d16" />
      </mesh>
      <mesh position={[4.5, 0.8, -0.5]}>
        <planeGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#090d16" />
      </mesh>

      {/* ========================================================
          4. OVERHEAD LUGGAGE COMPARTMENTS & AC UNITS
          ======================================================== */}
      {/* Left Overhead Luggage Rack Shelf */}
      <mesh position={[-0.92, 1.42, -0.5]}>
        <boxGeometry args={[0.82, 0.05, 14.2]} />
        <meshStandardMaterial color="#222733" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Left Luggage Rack Edge Lip */}
      <mesh position={[-0.52, 1.48, -0.5]}>
        <boxGeometry args={[0.03, 0.09, 14.2]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.6} opacity={0.8} transparent />
      </mesh>

      {/* Right Overhead Luggage Rack Shelf */}
      <mesh position={[0.92, 1.42, -0.5]}>
        <boxGeometry args={[0.82, 0.05, 14.2]} />
        <meshStandardMaterial color="#222733" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Right Luggage Rack Edge Lip */}
      <mesh position={[0.52, 1.48, -0.5]}>
        <boxGeometry args={[0.03, 0.09, 14.2]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.6} opacity={0.8} transparent />
      </mesh>

      {/* Passenger Service Units (Reading lights & AC vents below racks) */}
      {[-4.6, -3.4, -2.2, -1.0, 0.2, 1.4, 2.6, 3.8].map((zPos, idx) => (
        <group key={`psu-${idx}`}>
          {/* Left PSU Box */}
          <mesh position={[-0.88, 1.38, zPos]}>
            <boxGeometry args={[0.3, 0.03, 0.18]} />
            <meshStandardMaterial color="#11141c" roughness={0.7} />
          </mesh>
          {/* Left Reading Spot (Soft glow) */}
          <mesh position={[-0.88, 1.36, zPos]}>
            <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>

          {/* Right PSU Box */}
          <mesh position={[0.88, 1.38, zPos]}>
            <boxGeometry args={[0.3, 0.03, 0.18]} />
            <meshStandardMaterial color="#11141c" roughness={0.7} />
          </mesh>
          {/* Right Reading Spot */}
          <mesh position={[0.88, 1.36, zPos]}>
            <cylinderGeometry args={[0.025, 0.025, 0.01, 16]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          5. STANCHIONS & AISLE CEILING HANDRAILS
          ======================================================== */}
      {/* Left Ceiling Handrail Tube */}
      <mesh position={[-0.45, 1.58, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 14.5, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Right Ceiling Handrail Tube */}
      <mesh position={[0.45, 1.58, -0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.016, 0.016, 14.5, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging Grab Straps along aisle */}
      {[-4.0, -2.5, -1.0, 0.5, 2.0, 3.5].map((zPos, idx) => (
        <group key={`strap-${idx}`}>
          <mesh position={[-0.45, 1.48, zPos]}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[-0.45, 1.38, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.04, 0.008, 8, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>

          <mesh position={[0.45, 1.48, zPos]}>
            <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0.45, 1.38, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.04, 0.008, 8, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          6. FRONT COCKPIT & DRIVER CABIN AREA
          ======================================================== */}
      {/* Front Windshield Curved Glass */}
      <mesh position={[0, 0.75, -8.15]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[2.55, 1.45, 0.03]} />
        <meshPhysicalMaterial
          color="#0f172a"
          transmission={0.82}
          opacity={0.85}
          transparent
          roughness={0.08}
          ior={1.5}
        />
      </mesh>

      {/* Digital Destination Route Display Above Windshield */}
      <group position={[0, 1.56, -7.95]} rotation={[-0.1, 0, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.22, 0.06]} />
          <meshStandardMaterial color="#090d16" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[1.65, 0.16]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
      </group>

      {/* Panoramic Interior Rear-view Mirror */}
      <mesh position={[0, 1.38, -7.6]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.02]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Driver Dashboard Console Binnacle */}
      <group position={[-0.6, -0.05, -7.5]}>
        <mesh>
          <boxGeometry args={[0.9, 0.65, 0.6]} />
          <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.2} />
        </mesh>
        {/* Gauge Cluster Panel */}
        <mesh position={[0, 0.24, 0.15]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.42, 0.18, 0.02]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        {/* Steering Column & Wheel */}
        <mesh position={[0, 0.26, 0.25]} rotation={[0.8, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.35, 12]} />
          <meshStandardMaterial color="#374151" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.38, 0.34]} rotation={[0.8, 0, 0]}>
          <torusGeometry args={[0.18, 0.022, 12, 24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} />
        </mesh>
      </group>

      {/* Driver Seat */}
      <group position={[-0.6, 0.15, -6.8]}>
        {/* Base */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.35, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Cushion */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.22, -0.22]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.46, 0.64, 0.1]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Headrest */}
        <mesh position={[0, 0.6, -0.25]}>
          <boxGeometry args={[0.28, 0.18, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* Driver Cabin Acrylic Safety Partition */}
      <mesh position={[-0.6, 0.45, -6.2]}>
        <boxGeometry args={[0.9, 1.25, 0.02]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
        />
      </mesh>

      {/* Boarding Steps at Front Right Door */}
      <group position={[0.85, -0.55, -7.1]}>
        {/* Lower step */}
        <mesh position={[0, -0.15, -0.3]}>
          <boxGeometry args={[0.7, 0.12, 0.35]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Step yellow edge */}
        <mesh position={[0, -0.09, -0.13]}>
          <boxGeometry args={[0.7, 0.02, 0.03]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>
        {/* Vertical Entrance Safety Stanchion */}
        <mesh position={[-0.32, 0.75, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8, 16]} />
          <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* Ticket Validator / Transit Pass Pedestal */}
      <group position={[0.45, 0.05, -6.6]}>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.6, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[0.16, 0.22, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Green validator screen */}
        <mesh position={[0, 0.22, 0.062]}>
          <planeGeometry args={[0.11, 0.08]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* ========================================================
          7. REAR SECTION & EMERGENCY EXIT DOOR
          ======================================================== */}
      {/* Rear Cabin Back Wall */}
      <mesh position={[0, 0.65, 6.4]}>
        <boxGeometry args={[2.65, 2.3, 0.08]} />
        <meshStandardMaterial color="#181b22" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Rear Emergency Exit Door Frame */}
      <mesh position={[0, 0.55, 6.36]}>
        <boxGeometry args={[0.92, 1.7, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Emergency Push Bar (Red) */}
      <mesh position={[0, 0.45, 6.32]}>
        <boxGeometry args={[0.76, 0.05, 0.04]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Glowing Emergency Exit Sign Above Door */}
      <group position={[0, 1.52, 6.34]}>
        <mesh>
          <boxGeometry args={[0.48, 0.15, 0.03]} />
          <meshStandardMaterial color="#064e3b" />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.42, 0.11]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Rear Exit Safety Vertical Stanchions */}
      <mesh position={[-0.42, 0.55, 6.1]}>
        <cylinderGeometry args={[0.018, 0.018, 1.9, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[0.42, 0.55, 6.1]}>
        <cylinderGeometry args={[0.018, 0.018, 1.9, 16]} />
        <meshStandardMaterial color="#eab308" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
};
