import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

interface CameraControllerProps {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  isTransitioning?: boolean;
  onTransitionComplete?: () => void;
  onFloorClick?: (point: THREE.Vector3) => void;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  targetPosition,
  targetLookAt,
  onTransitionComplete,
  onFloorClick,
}) => {
  const { camera, gl } = useThree();

  // Internal state for pan/drag Street View rotation
  const isDraggingRef = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);

  // Spherical yaw (horizontal) and pitch (vertical) in radians
  const yawRef = useRef<number>(0);
  const pitchRef = useRef<number>(0);

  // Target yaw and pitch for smooth damping
  const targetYawRef = useRef<number>(0);
  const targetPitchRef = useRef<number>(0);

  // Current and desired camera positions
  const currentPosRef = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]));
  const desiredPosRef = useRef(new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]));

  // Initialize camera position and look orientation
  useEffect(() => {
    camera.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    currentPosRef.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);
    desiredPosRef.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);

    const dir = new THREE.Vector3(
      targetLookAt[0] - targetPosition[0],
      targetLookAt[1] - targetPosition[1],
      targetLookAt[2] - targetPosition[2]
    ).normalize();

    // Calculate initial yaw and pitch from look vector
    const initialYaw = Math.atan2(-dir.x, -dir.z);
    const initialPitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.95, 0.95));

    yawRef.current = initialYaw;
    pitchRef.current = initialPitch;
    targetYawRef.current = initialYaw;
    targetPitchRef.current = initialPitch;
  }, []);

  // When external target changes (e.g. clicked waypoint or seat locate)
  useEffect(() => {
    desiredPosRef.current.set(targetPosition[0], targetPosition[1], targetPosition[2]);

    const dir = new THREE.Vector3(
      targetLookAt[0] - targetPosition[0],
      targetLookAt[1] - targetPosition[1],
      targetLookAt[2] - targetPosition[2]
    ).normalize();

    const newTargetYaw = Math.atan2(-dir.x, -dir.z);
    const newTargetPitch = Math.asin(THREE.MathUtils.clamp(dir.y, -0.95, 0.95));

    // Handle 360 wrap-around smoothly
    let deltaYaw = (newTargetYaw - targetYawRef.current) % (Math.PI * 2);
    if (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    if (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;

    targetYawRef.current += deltaYaw;
    targetPitchRef.current = newTargetPitch;
  }, [targetPosition, targetLookAt]);

  // Pointer event handlers for Street View drag-to-look
  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      // Only drag with left mouse button (button === 0) or touch
      if (e.button === 0) {
        isDraggingRef.current = true;
        previousPointerPosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousPointerPosition.current.x;
      const deltaY = e.clientY - previousPointerPosition.current.y;

      const sensitivity = 0.0028;
      targetYawRef.current += deltaX * sensitivity;
      targetPitchRef.current -= deltaY * sensitivity;

      // Restrict vertical pitch to realistic human neck range (-75 deg to +75 deg)
      const maxPitch = (75 * Math.PI) / 180;
      targetPitchRef.current = THREE.MathUtils.clamp(targetPitchRef.current, -maxPitch, maxPitch);

      previousPointerPosition.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    // Touch pinch-to-zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistRef.current = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistRef.current !== null && 'fov' in camera) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const distDiff = touchStartDistRef.current - currentDist;

        const persCam = camera as THREE.PerspectiveCamera;
        persCam.fov = THREE.MathUtils.clamp(persCam.fov + distDiff * 0.05, 45, 85);
        persCam.updateProjectionMatrix();

        touchStartDistRef.current = currentDist;
      }
    };

    const handleTouchEnd = () => {
      touchStartDistRef.current = null;
    };

    // Wheel zoom (FOV adjustment)
    const handleWheel = (e: WheelEvent) => {
      if ('fov' in camera) {
        const persCam = camera as THREE.PerspectiveCamera;
        persCam.fov = THREE.MathUtils.clamp(persCam.fov + e.deltaY * 0.02, 45, 85);
        persCam.updateProjectionMatrix();
      }
    };

    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    dom.addEventListener('touchstart', handleTouchStart);
    dom.addEventListener('touchmove', handleTouchMove);
    dom.addEventListener('touchend', handleTouchEnd);
    dom.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      dom.removeEventListener('touchmove', handleTouchMove);
      dom.removeEventListener('touchend', handleTouchEnd);
      dom.removeEventListener('wheel', handleWheel);
    };
  }, [gl, camera]);

  // Frame update loop with smooth lerp
  useFrame((_, delta) => {
    // Smooth camera rotation damping
    yawRef.current = THREE.MathUtils.damp(yawRef.current, targetYawRef.current, 14, delta);
    pitchRef.current = THREE.MathUtils.damp(pitchRef.current, targetPitchRef.current, 14, delta);

    // Smooth Street View position transition
    currentPosRef.current.lerp(desiredPosRef.current, THREE.MathUtils.clamp(delta * 4.5, 0, 1));

    // Realistic physical boundaries inside coach:
    // Z: Entrance (-7.0) to rear back row (+5.6)
    // X: Central aisle with seat proximity allowance (-0.8 to +0.8)
    // Y: Eye height (1.45m - 1.55m)
    const clampedX = THREE.MathUtils.clamp(currentPosRef.current.x, -0.85, 0.85);
    const clampedY = THREE.MathUtils.clamp(currentPosRef.current.y, 1.45, 1.55);
    const clampedZ = THREE.MathUtils.clamp(currentPosRef.current.z, -7.0, 5.6);

    camera.position.set(clampedX, clampedY, clampedZ);

    // Calculate look target from yaw and pitch
    const lookDir = new THREE.Vector3(
      -Math.sin(yawRef.current) * Math.cos(pitchRef.current),
      Math.sin(pitchRef.current),
      -Math.cos(yawRef.current) * Math.cos(pitchRef.current)
    );

    const lookTarget = camera.position.clone().add(lookDir);
    camera.lookAt(lookTarget);

    // Check if transition completed
    if (camera.position.distanceTo(desiredPosRef.current) < 0.05 && onTransitionComplete) {
      onTransitionComplete();
    }
  });

  return null;
};
