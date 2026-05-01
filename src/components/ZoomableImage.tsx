"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SyntheticEvent,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
const DURATION_MS = 360;

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

type Phase = "idle" | "opening" | "open" | "closing";

type ZoomableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  imageClassName,
  priority,
}: ZoomableImageProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [srcRect, setSrcRect] = useState<DOMRect | null>(null);
  const [aspect, setAspect] = useState<number>(width / height);
  const wrapperRef = useRef<HTMLButtonElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);
  const targetRef = useRef<{
    tx: number;
    ty: number;
    sx: number;
    sy: number;
  } | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const computeTarget = useCallback(
    (srcRect: DOMRect) => {
      const pad = window.innerWidth < 640 ? 16 : 48;
      const availW = window.innerWidth - 2 * pad;
      const availH = window.innerHeight - 2 * pad;
      const ar = aspect;
      let tw = availW;
      let th = tw / ar;
      if (th > availH) {
        th = availH;
        tw = th * ar;
      }
      const tx = (window.innerWidth - tw) / 2;
      const ty = (window.innerHeight - th) / 2;
      const sx = tw / srcRect.width;
      const sy = th / srcRect.height;
      return { tx, ty, sx, sy };
    },
    [aspect],
  );

  const applyTransform = useCallback((animated: boolean) => {
    const clone = cloneRef.current;
    const target = targetRef.current;
    if (!clone || !target) return;
    clone.style.transition =
      animated && !reducedMotion
        ? `transform ${DURATION_MS}ms ${EASING}`
        : "none";
    clone.style.transform = `translate(${target.tx}px, ${target.ty}px) scale(${target.sx}, ${target.sy})`;
  }, [reducedMotion]);

  const finalizeClose = useCallback(() => {
    setPhase("idle");
    const prev = previousFocusRef.current;
    if (prev instanceof HTMLElement) {
      prev.focus({ preventScroll: true });
    }
  }, []);

  const open = useCallback(() => {
    if (phase !== "idle") return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    previousFocusRef.current = document.activeElement;
    const rect = wrapper.getBoundingClientRect();
    setSrcRect(rect);
    targetRef.current = computeTarget(rect);
    setPhase("opening");
  }, [phase, computeTarget]);

  const close = useCallback(() => {
    if (phase !== "open") return;
    const wrapper = wrapperRef.current;
    const clone = cloneRef.current;
    if (!wrapper || !clone) return;
    const rect = wrapper.getBoundingClientRect();
    setPhase("closing");
    if (reducedMotion) {
      clone.style.transition = "none";
      clone.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(1, 1)`;
      finalizeClose();
      return;
    }
    clone.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
    clone.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(1, 1)`;
  }, [phase, finalizeClose, reducedMotion]);

  useLayoutEffect(() => {
    if (phase !== "opening") return;
    const clone = cloneRef.current;
    if (!clone || !srcRect) return;
    clone.style.transition = "none";
    clone.style.transform = `translate(${srcRect.left}px, ${srcRect.top}px) scale(1, 1)`;
    void clone.getBoundingClientRect();

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        applyTransform(true);
        setPhase("open");
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [phase, srcRect, applyTransform]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScroll = () => close();
    const onResize = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      targetRef.current = computeTarget(rect);
      applyTransform(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, {
        capture: true,
      } as EventListenerOptions);
      window.removeEventListener("resize", onResize);
    };
  }, [phase, close, applyTransform, computeTarget]);

  const handleLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const next = img.naturalWidth / img.naturalHeight;
        setAspect((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
      }
    },
    [],
  );

  const onCloneTransitionEnd = useCallback(
    (e: TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "transform") return;
      if (phase === "closing") finalizeClose();
    },
    [phase, finalizeClose],
  );

  const showPortal = phase !== "idle";

  return (
    <>
      <button
        ref={wrapperRef}
        type="button"
        onClick={open}
        aria-label={alt ? `Expand image: ${alt}` : "Expand image"}
        className={cn(
          "not-prose relative block w-full cursor-zoom-in overflow-hidden rounded-2xl border-0 bg-card p-0",
          className,
        )}
        style={{
          aspectRatio: String(aspect),
          visibility: phase === "idle" ? "visible" : "hidden",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          className={cn("block", imageClassName ?? "object-contain")}
        />
      </button>
      {showPortal && srcRect
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt || "Image preview"}
              className="fixed inset-0 z-[100]"
            >
              <div
                onClick={close}
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  backgroundColor:
                    phase === "open" ? "rgba(0,0,0,0.86)" : "rgba(0,0,0,0)",
                  transition: reducedMotion
                    ? "none"
                    : `background-color ${DURATION_MS}ms ${EASING}`,
                }}
              />
              <div
                ref={cloneRef}
                onClick={close}
                onTransitionEnd={onCloneTransitionEnd}
                className="absolute top-0 left-0 cursor-zoom-out overflow-hidden rounded-2xl will-change-transform"
                style={{
                  width: srcRect.width,
                  height: srcRect.height,
                  transformOrigin: "top left",
                }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="100vw"
                  className="block object-contain"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
