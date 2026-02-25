"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
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

export default function ModelCanvas() {
  const [floor, setFloor] = useState({ y: -0.9 });

  return (
    <div className="relative h-[360px] w-full max-w-[360px] overflow-hidden rounded-3xl shadow-sm sm:h-[420px] sm:max-w-[420px]">
      <div className="absolute inset-0 bg-[#0f0f12]" />
      <Canvas
        className="relative z-10"
        camera={{ position: [0, 0, 3], fov: 45 }}
        shadows
        gl={{ alpha: true }}
      >
        <hemisphereLight intensity={3.5} position={[0, 10, 0]} castShadow />
        <directionalLight
          position={[0, 4.4, 3]}
          intensity={5}
          castShadow
          shadow-radius={4}
        />
        <Suspense fallback={null}>
          <Center
            onCentered={({ boundingBox }) => {
              setFloor({ y: boundingBox.min.y - 0.02 });
            }}
          >
            <Model />
          </Center>
        </Suspense>
        {/* The floor */}
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
        />
      </Canvas>
    </div>
  );
}
