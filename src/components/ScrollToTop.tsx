"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 240);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-foreground/15 bg-white/70 text-foreground backdrop-blur-md transition hover:bg-white/85 dark:bg-black/70 dark:hover:bg-black/85"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
