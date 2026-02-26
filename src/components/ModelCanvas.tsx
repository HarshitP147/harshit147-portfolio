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

const FAST_SPEED = 5.0;   // rad/s — burst on load
const SLOW_SPEED = 0.45;  // rad/s — idle display spin
const FAST_DURATION = 1.0; // seconds before slowing down

function Scene() {
  const [floor, setFloor] = useState({ y: -0.9 });
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rotatingRef = useRef(true);          // ref avoids stale-closure issues in useFrame
  const spinSpeedRef = useRef(FAST_SPEED);
  const elapsedRef = useRef(0);
  const floorSetRef = useRef(false);

  useFrame((_, delta) => {
    if (!rotatingRef.current || !modelGroupRef.current) return;

    elapsedRef.current += delta;

    // After the fast burst, switch target to slow speed with a snappier damping
    const isFastPhase = elapsedRef.current < FAST_DURATION;
    const targetSpeed = isFastPhase ? FAST_SPEED : SLOW_SPEED;
    const dampingFactor = isFastPhase ? 2 : 7; // 7 → slows down quickly once the burst ends

    const t = 1 - Math.exp(-dampingFactor * delta);
    spinSpeedRef.current = THREE.MathUtils.lerp(spinSpeedRef.current, targetSpeed, t);

    modelGroupRef.current.rotation.y += spinSpeedRef.current * delta;
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
        <group ref={modelGroupRef}>
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
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={1.4}
        maxDistance={5}
        onStart={() => { rotatingRef.current = false; }}
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
