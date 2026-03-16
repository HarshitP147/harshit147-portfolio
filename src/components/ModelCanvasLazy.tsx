"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import ModelCanvas from "./ModelCanvas";

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

// const ModelCanvas = dynamic(() => import("@/components/ModelCanvas"), {
//   ssr: false,
//   loading: () => <ModelCanvasPoster />,
// });

export default function ModelCanvasLazy() {

  return (
    <div className="flex w-full justify-center xl:w-auto xl:justify-end">
      <ModelCanvas />
    </div>
  );
}
