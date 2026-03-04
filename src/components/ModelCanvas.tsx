"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function Model() {
  const { scene } = useGLTF("/scene.glb");

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

useGLTF.preload("/scene.glb");

const FAST_SPEED = 80.0;
const SLOW_SPEED = 1.0;
const FAST_DURATION = 0.8;

function Scene() {
  const [floor, setFloor] = useState({ y: -0.9 });
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const elapsedRef = useRef(0);
  const speedRef = useRef(FAST_SPEED);
  const hasInteractedRef = useRef(false);
  const floorSetRef = useRef(false);

  useFrame((_, delta) => {
    if (!autoRotate || hasInteractedRef.current || !controlsRef.current) {
      return;
    }

    elapsedRef.current += delta;

    const isFastPhase = elapsedRef.current < FAST_DURATION;
    const targetSpeed = isFastPhase ? FAST_SPEED : SLOW_SPEED;
    const dampingFactor = isFastPhase ? 2 : 7;
    const t = 1 - Math.exp(-dampingFactor * delta);

    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, t);
    controlsRef.current.autoRotateSpeed = speedRef.current;
  });

  return (
    <>
      <hemisphereLight intensity={3.5} position={[0, 10, 0]} castShadow />
      <directionalLight
        position={[0, 4.4, 3]}
        intensity={5}
        castShadow
        shadow-radius={4}
      />
      <Suspense fallback={null}>
        <group>
          <Center
            onCentered={({ boundingBox }) => {
              if (floorSetRef.current) return;
              floorSetRef.current = true;
              setFloor({ y: boundingBox.min.y - 0.02 });
            }}
          >
            <Model />
          </Center>
        </group>
      </Suspense>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, floor.y, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#36261B" roughness={0.9} />
      </mesh>
      <ContactShadows
        position={[0, floor.y + 0.01, 0]}
        opacity={1}
        scale={8}
        blur={2.6}
        far={6}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1.4}
        maxDistance={5}
        autoRotate={autoRotate}
        autoRotateSpeed={FAST_SPEED}
        onStart={() => {
          hasInteractedRef.current = true;
          setAutoRotate(false);
        }}
      />
    </>
  );
}

export default function ModelCanvas() {
  return (
    <div className="relative h-[360px] w-full max-w-[360px] overflow-hidden rounded-3xl shadow-sm sm:h-[420px] sm:max-w-[420px]">
      <div className="absolute inset-0 bg-[#0f0f12]" />
      <Canvas
        className="relative z-10"
        camera={{ position: [0, 0, 3], fov: 45 }}
        shadows
        gl={{ alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
