"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";

import type { TocHeading } from "@/components/TableOfContents";

// Layer overhangs the link wrapper so the goo blur isn't cropped at the edges.
const PAD = 16;
const PILL_X = 8;
const PILL_Y = 3;
// Ignore the strip under the top of the viewport when deciding what's "on screen".
const VIEWPORT_TOP = 80;

const LEAD = { type: "spring", visualDuration: 0.35, bounce: 0.2 } as const;
const TRAIL = { type: "spring", visualDuration: 0.55, bounce: 0.12 } as const;

// `h` is the true pill box (drives the blob's edges); `fillH` stretches down to
// the next row so uneven list spacing never leaves a gap the goo can't bridge.
type Pill = { x: number; y: number; w: number; h: number; fillH: number };
type Geometry = { pills: (Pill | null)[]; height: number };
type Range = { start: number; end: number } | null;

type TocBlobProps = {
  headings: TocHeading[];
  containerRef: RefObject<HTMLDivElement | null>;
  scrollerRef: RefObject<HTMLDivElement | null>;
  onActiveChange: (ids: string[]) => void;
};

function sameRange(a: Range, b: Range) {
  return a === b || (!!a && !!b && a.start === b.start && a.end === b.end);
}

// Liquid scroll-spy highlight for the desktop index rail. One rounded pill per
// row (hugging the link text), clipped to the springy [top, bottom] span, then
// run through an SVG goo filter so indent steps and edges melt into one blob.
export default function TocBlob({ headings, containerRef, scrollerRef, onActiveChange }: TocBlobProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `toc-goo-${uid}`;
  const clipId = `toc-clip-${uid}`;
  const clipRectRef = useRef<SVGRectElement>(null);
  const reducedMotion = useReducedMotion();
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [range, setRange] = useState<Range>(null);

  const top = useMotionValue(0);
  const bottom = useMotionValue(0);

  // Write the springy span straight onto the SVG clip rect (no React renders).
  useEffect(() => {
    const update = () => {
      const rect = clipRectRef.current;
      if (!rect) return;
      const t = top.get();
      rect.setAttribute("y", String(t));
      rect.setAttribute("height", String(Math.max(0, bottom.get() - t)));
    };
    update();
    const offTop = top.on("change", update);
    const offBottom = bottom.on("change", update);
    return () => {
      offTop();
      offBottom();
    };
  }, [top, bottom]);

  const rangeRef = useRef<Range>(null);
  const prevRangeRef = useRef<Range>(null);
  const placedRef = useRef(false);
  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });

  // Measure the text box of every TOC link, relative to the layer.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const c = container.getBoundingClientRect();
      const textRange = document.createRange();
      const pills: (Pill | null)[] = headings.map((h) => {
        const link = container.querySelector(`[data-toc-id="${CSS.escape(h.id)}"]`);
        if (!link) return null;
        textRange.selectNodeContents(link);
        const r = textRange.getBoundingClientRect();
        const height = r.height + PILL_Y * 2;
        return {
          x: r.left - c.left + PAD - PILL_X,
          y: r.top - c.top + PAD - PILL_Y,
          w: r.width + PILL_X * 2,
          h: height,
          fillH: height,
        };
      });
      for (let i = 0; i < pills.length - 1; i++) {
        const p = pills[i];
        const next = pills[i + 1];
        if (p && next) p.fillH = Math.max(p.h, next.y - p.y + 2);
      }
      setGeometry({ pills, height: c.height + PAD * 2 });
    };

    const ro = new ResizeObserver(measure);
    ro.observe(container);
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [headings, containerRef]);

  // Scroll-spy: every section (heading → next heading) overlapping the viewport.
  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id));
    const markdown = els.find(Boolean)?.closest(".blog-markdown") ?? null;
    let frame = 0;

    const compute = () => {
      frame = 0;
      const vh = window.innerHeight;
      const tops = els.map((el) => (el ? el.getBoundingClientRect().top : NaN));
      const end = markdown ? markdown.getBoundingClientRect().bottom : Infinity;
      let first = -1;
      let last = -1;
      for (let i = 0; i < tops.length; i++) {
        if (Number.isNaN(tops[i])) continue;
        let next = end;
        for (let j = i + 1; j < tops.length; j++) {
          if (!Number.isNaN(tops[j])) {
            next = tops[j];
            break;
          }
        }
        if (tops[i] < vh && next > VIEWPORT_TOP) {
          if (first === -1) first = i;
          last = i;
        }
      }
      const nextRange: Range = first === -1 ? null : { start: first, end: last };
      if (sameRange(nextRange, rangeRef.current)) return;
      rangeRef.current = nextRange;
      setRange(nextRange);
      onActiveChangeRef.current(
        nextRange ? headings.slice(nextRange.start, nextRange.end + 1).map((h) => h.id) : [],
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(compute);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  // Drive the blob edges toward the active span.
  useEffect(() => {
    if (!geometry) return;
    const prev = prevRangeRef.current;
    prevRangeRef.current = range;

    if (!range) {
      if (prev && !reducedMotion) {
        const mid = (top.get() + bottom.get()) / 2;
        animate(top, mid, TRAIL);
        animate(bottom, mid, TRAIL);
      } else {
        top.jump(0);
        bottom.jump(0);
      }
      return;
    }

    const a = geometry.pills[range.start];
    const b = geometry.pills[range.end];
    if (!a || !b) return;
    const targetTop = a.y;
    const targetBottom = b.y + b.h;

    // Keep the blob inside the rail's own scroll box.
    const scroller = scrollerRef.current;
    const container = containerRef.current;
    if (scroller && container) {
      const offset =
        container.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - PAD;
      const viewTop = scroller.scrollTop;
      const viewBottom = viewTop + scroller.clientHeight;
      if (offset + targetTop < viewTop || offset + targetBottom > viewBottom) {
        scroller.scrollTo({
          top: offset + targetTop - 24,
          behavior: reducedMotion ? "auto" : "smooth",
        });
      }
    }

    // First placement, re-layout with the same span, or reduced motion: no animation.
    if (!placedRef.current || reducedMotion || sameRange(prev, range)) {
      placedRef.current = true;
      top.jump(targetTop);
      bottom.jump(targetBottom);
      return;
    }

    if (!prev) {
      // Droplet grows out from the middle of its new span.
      const mid = (targetTop + targetBottom) / 2;
      top.jump(mid);
      bottom.jump(mid);
      animate(top, targetTop, LEAD);
      animate(bottom, targetBottom, LEAD);
      return;
    }

    // Leading edge springs first, trailing edge follows: a short liquid stretch.
    const down = range.end > prev.end || range.start > prev.start;
    animate(top, targetTop, down ? TRAIL : LEAD);
    animate(bottom, targetBottom, down ? LEAD : TRAIL);
  }, [range, geometry, reducedMotion, top, bottom, scrollerRef, containerRef]);

  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute -z-10 overflow-visible text-foreground opacity-[0.14] dark:opacity-[0.09]"
      style={{ left: -PAD, top: -PAD, width: `calc(100% + ${PAD * 2}px)`, height: `calc(100% + ${PAD * 2}px)` }}
    >
      <defs>
        <clipPath id={clipId}>
          <rect ref={clipRectRef} x={0} y={0} width="100%" height={0} />
        </clipPath>
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            {/* Flat fill: goo shape only, no highlight/rim. Tint strength is the
                svg's per-theme opacity. */}
        </filter>
      </defs>
      {/* Clip first (inner g), then goo (outer g) so cut edges melt too. */}
      <g filter={`url(#${filterId})`}>
        <g clipPath={`url(#${clipId})`}>
          {geometry?.pills.map((p, i) =>
            p ? (
              <rect
                key={`${headings[i]?.id}-${i}`}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.fillH}
                rx={10}
                fill="currentColor"
              />
            ) : null,
          )}
        </g>
      </g>
    </svg>
  );
}
