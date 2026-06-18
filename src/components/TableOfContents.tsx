"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type TocHeading = {
  level: number;
  text: string;
  id: string;
};

type TocNode = {
  heading: TocHeading;
  children: TocNode[];
};

function buildTree(headings: TocHeading[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const h of headings) {
    const node: TocNode = { heading: h, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].heading.level >= h.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return root;
}

function TocLink({ heading, onClick }: { heading: TocHeading; onClick?: () => void }) {
  return (
    <a
      href={`#${heading.id}`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
      }}
      className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-sky-300 hover:underline"
    >
      {heading.text}
    </a>
  );
}

function TocNodes({ nodes, onLinkClick }: { nodes: TocNode[]; onLinkClick?: () => void }) {
  return (
    <>
      {nodes.map((node) => (
        <div key={`${node.heading.id}-${node.heading.level}`} className="flex flex-col gap-1">
          <TocLink heading={node.heading} onClick={onLinkClick} />
          {node.children.length > 0 && (
            <div className="ml-1 flex flex-col gap-1 pl-4 mb-1">
              <TocNodes nodes={node.children} onLinkClick={onLinkClick} />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

const SPRING = "cubic-bezier(0.16, 1, 0.3, 1)";

type TableOfContentsProps = {
  headings: TocHeading[];
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [open, setOpen] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [stickyOpen, setStickyOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tocRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setIsSticky(entry.boundingClientRect.top < 0);
        } else {
          setIsSticky(false);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  const tree = buildTree(headings);

  return (
    <>
      {/* Inline TOC */}
      <div ref={tocRef} className="w-full rounded-2xl border border-border/60" aria-label="Table of contents">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:text-foreground"
        >
          <span className="text-xl font-semibold text-foreground/70">Index</span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className="grid"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: `grid-template-rows 400ms ${SPRING}`,
          }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 px-4 pb-4 pt-1">
              <TocNodes nodes={tree} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky TOC */}
      <div
        aria-label="Table of contents (sticky)"
        className="fixed left-1/2 top-4 z-50 rounded-2xl border border-border/40 bg-background/90 shadow-md backdrop-blur-md"
        style={{
          width: "min(48rem, calc(100vw - 3rem))",
          transform: isSticky ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-130%)",
          transition: `transform 400ms ${SPRING}`,
          pointerEvents: isSticky ? "auto" : "none",
        }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <button
            onClick={() => setStickyOpen((o) => !o)}
            className="flex w-full items-center justify-between py-3 transition-colors hover:text-foreground"
          >
            <span className="text-sm font-semibold text-foreground/70">Index</span>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ease-out ${stickyOpen ? "rotate-180" : ""}`}
            />
          </button>
          <div
            className="grid"
            style={{
              gridTemplateRows: stickyOpen ? "1fr" : "0fr",
              transition: `grid-template-rows 400ms ${SPRING}`,
            }}
          >
            <div className="overflow-hidden">
              <div className="flex max-h-[40vh] flex-col gap-1 overflow-y-auto pb-4 pt-1">
                <TocNodes nodes={tree} onLinkClick={() => setStickyOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
