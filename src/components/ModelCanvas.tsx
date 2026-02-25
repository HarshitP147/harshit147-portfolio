"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
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
    <div className="h-[420px] w-full rounded-3xl border border-black/10 bg-black shadow-sm">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} shadows="soft">
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.6} />
        {/* Key light – strong directional from upper-front */}
        <directionalLight
          position={[2, 4, 3]}
          intensity={3.5}
          castShadow
          shadow-bias={-0.0004}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        {/* Fill light – softer from the left */}
        <directionalLight position={[-3, 2, 1]} intensity={1.2} />
        {/* Rect area light – large overhead panel */}
        <rectAreaLight
          position={[0, 4, 1]}
          rotation={[-Math.PI / 2.5, 0, 0]}
          width={14}
          height={10}
          intensity={20}
        />
        {/* Front spot – wide cone for broad illumination */}
        <spotLight
          position={[0, 2, 3.5]}
          angle={0.75}
          penumbra={0.8}
          intensity={4}
          distance={20}
          decay={1.2}
          castShadow
          shadow-bias={-0.0004}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
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
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, floor.y, 0]}
          receiveShadow
        >
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#7a512f" />
        </mesh>
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
