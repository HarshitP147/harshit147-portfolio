"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function getDevicePixelRatio() {
  if (typeof window === "undefined") return 1;
  const isMobile = isMobileDevice();
  const dpr = window.devicePixelRatio || 1;
  return isMobile ? Math.min(dpr, 1.5) : Math.min(dpr, 2);
}

function Model() {
  const { scene } = useGLTF("/misc/scene.glb", true);

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

const FAST_SPEED = 350.0;
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

function getSLOW_SPEED() {
  return isMobileDevice() ? 0.0 : 7.0;
}

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
  const isMobile = isMobileDevice();
  const slowSpeed = getSLOW_SPEED();

  useFrame((_, delta) => {
    if (!autoRotate || hasInteractedRef.current || !controlsRef.current) {
      return;
    }

    elapsedRef.current += delta;

    const isFastPhase = elapsedRef.current < FAST_DURATION;
    const targetSpeed = isFastPhase ? FAST_SPEED : slowSpeed;
    const dampingFactor = isFastPhase ? 2 : 7;
    const t = 1 - Math.exp(-dampingFactor * delta);

    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, t);
    controlsRef.current.autoRotateSpeed = speedRef.current;
  });

  const mobileShadowProps = isMobile
    ? { scale: 4, blur: 1.5, far: 4 }
    : { scale: 8, blur: 2.6, far: 6 };

  return (
    <>
      <hemisphereLight intensity={isMobile ? 2.0 : 3.5} position={[0, 10, 0]} castShadow />
      <directionalLight
        position={[0, 4.4, 3]}
        intensity={isMobile ? 3 : 5}
        castShadow
        shadow-radius={isMobile ? 2 : 4}
      />
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
        {...mobileShadowProps}
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
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const calculatedDpr = getDevicePixelRatio();
    
    setDpr([1, calculatedDpr]);
  }, []);

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
        dpr={dpr}
        shadows={isMobileDevice() ? false : "variance"}
        frameloop="demand"
        gl={{
          alpha: true,
          powerPreference: "low-power",
          antialias: isMobileDevice() ? false : true,
          preserveDrawingBuffer: false,
        }}
      >
        <Scene
          shadowOpacity={sceneVisuals.shadowOpacity}
          shadowColor={sceneVisuals.shadowColor}
        />
      </Canvas>
    </div>
  );
}
