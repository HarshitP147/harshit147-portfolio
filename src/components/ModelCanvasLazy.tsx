"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

function ModelCanvasPoster() {
  return (
    <div
      className="relative h-[360px] w-full max-w-[360px] overflow-hidden rounded-3xl shadow-sm sm:h-[420px] sm:max-w-[420px]"
      style={{
        background:
          "linear-gradient(to bottom, var(--scene-sky) 0%, var(--scene-sky) 49%, var(--scene-floor) 49%, var(--scene-floor) 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)] opacity-70 dark:opacity-30" />
      <div className="relative z-10 flex h-full w-full items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.4em] text-foreground/60">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground/70" />
        Loading 3D
      </div>
    </div>
  );
}

const ModelCanvas = dynamic(() => import("@/components/ModelCanvas"), {
  ssr: false,
  loading: () => <ModelCanvasPoster />,
});

export default function ModelCanvasLazy() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const loadAttemptedRef = useRef(false);

  const triggerLoad = () => {
    if (loadAttemptedRef.current) return;
    loadAttemptedRef.current = true;
    setShouldLoad(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (document.readyState === "complete") {
      setTimeout(() => triggerLoad(), 0);
      return;
    }

    const handleLoad = () => triggerLoad();
    window.addEventListener("load", handleLoad, { once: true });

    return () => window.removeEventListener("load", handleLoad);
  }, []);

  useEffect(() => {
    if (shouldLoad) return;

    const node = wrapperRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setTimeout(() => triggerLoad(), 0);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerLoad();
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={wrapperRef}>
      {shouldLoad ? <ModelCanvas /> : <ModelCanvasPoster />}
    </div>
  );
}
