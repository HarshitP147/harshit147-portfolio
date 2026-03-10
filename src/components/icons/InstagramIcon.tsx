import Image from "next/image";

import { cn } from "@/lib/utils";

type InstagramIconProps = {
  className?: string;
};

export default function InstagramIcon({ className }: InstagramIconProps) {
  return (
    <Image
      // Use the original SVG file (with its clipPath) without importing it via SVGR,
      // so Babel/Turbopack doesn't try to process a 10MB SVG as JS.
      src="/misc/Instagram_Glyph_Gradient.svg"
      alt=""
      width={28}
      height={28}
      className={cn("size-full object-contain", className)}
      unoptimized
      aria-hidden="true"
    />
  );
}
