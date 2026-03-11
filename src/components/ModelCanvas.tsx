"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function Model() {
  const { scene } = useGLTF("/misc/scene.glb");

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

function ModelLoader() {
  return (
    <Html center>
      <div className="flex items-center gap-3 rounded-full bg-background/80 px-3 py-2 text-xs font-medium uppercase tracking-[0.3em] text-foreground/70 shadow-sm">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground/70" />
        Loading 3D
      </div>
    </Html>
  );
}

const FAST_SPEED = 350.0;
const SLOW_SPEED = 7.0;
const FAST_DURATION = 0.7;
const SCENE_FLOOR_COLOR = "#36261b";
const LIGHT_SCENE_VISUALS = {
  skyColor: "#dfe8f8",
  shadowOpacity: 0.58,
  shadowColor: "#1f1712",
};
const DARK_SCENE_VISUALS = {
  skyColor: "#0f0f12",
  shadowOpacity: 1,
  shadowColor: "#000000",
};

function isDarkTheme() {
  if (typeof window === "undefined") {
    return true;
  }

  const root = document.documentElement;
  if (root.classList.contains("dark")) {
    return true;
  }

  if (root.classList.contains("light")) {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSceneVisuals() {
  return isDarkTheme() ? DARK_SCENE_VISUALS : LIGHT_SCENE_VISUALS;
}

function Scene({
  shadowOpacity,
  shadowColor,
}: {
  shadowOpacity: number;
  shadowColor: string;
}) {
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
      <Suspense fallback={<ModelLoader />}>
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
        <meshStandardMaterial color={SCENE_FLOOR_COLOR} roughness={0.9} />
      </mesh>
      <ContactShadows
        position={[0, floor.y + 0.01, 0]}
        opacity={shadowOpacity}
        color={shadowColor}
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
  const [sceneVisuals, setSceneVisuals] = useState(LIGHT_SCENE_VISUALS);

  useEffect(() => {
    const root = document.documentElement;
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncSceneVisuals = () => {
      const nextSceneVisuals = getSceneVisuals();
      setSceneVisuals((currentSceneVisuals) =>
        currentSceneVisuals.skyColor === nextSceneVisuals.skyColor &&
        currentSceneVisuals.shadowOpacity === nextSceneVisuals.shadowOpacity &&
        currentSceneVisuals.shadowColor === nextSceneVisuals.shadowColor
          ? currentSceneVisuals
          : nextSceneVisuals,
      );
    };

    const observer = new MutationObserver(() => {
      syncSceneVisuals();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    darkMediaQuery.addEventListener("change", syncSceneVisuals);

    const frame = window.requestAnimationFrame(syncSceneVisuals);

    return () => {
      observer.disconnect();
      darkMediaQuery.removeEventListener("change", syncSceneVisuals);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative h-[360px] w-full max-w-[360px] overflow-hidden rounded-3xl shadow-sm sm:h-[420px] sm:max-w-[420px]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--scene-sky) 0%, var(--scene-sky) 49%, var(--scene-floor) 49%, var(--scene-floor) 100%)",
        }}
      />
      <Canvas
        className="relative z-10"
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 1.5]}
        shadows
        gl={{ alpha: true }}
      >
        <Scene
          shadowOpacity={sceneVisuals.shadowOpacity}
          shadowColor={sceneVisuals.shadowColor}
        />
      </Canvas>
    </div>
  );
}
