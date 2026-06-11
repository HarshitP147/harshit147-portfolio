import { cn } from "@/lib/utils";

type InstagramIconProps = {
  className?: string;
};

// Inline vector glyph with the Instagram brand gradient. Replaces the old
// 10MB exported SVG asset that was served raw for a 28px icon.
export default function InstagramIcon({ className }: InstagramIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-full", className)}
    >
      <defs>
        <radialGradient
          id="ig-brand-gradient"
          cx="0.3"
          cy="1.07"
          r="1.5"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#fdf497" />
          <stop offset="0.05" stopColor="#fdf497" />
          <stop offset="0.45" stopColor="#fd5949" />
          <stop offset="0.6" stopColor="#d6249f" />
          <stop offset="0.9" stopColor="#285aeb" />
        </radialGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="5.5"
        stroke="url(#ig-brand-gradient)"
        strokeWidth="2"
      />
      <circle
        cx="12"
        cy="12"
        r="4.5"
        stroke="url(#ig-brand-gradient)"
        strokeWidth="2"
      />
      <circle cx="17.35" cy="6.65" r="1.35" fill="url(#ig-brand-gradient)" />
    </svg>
  );
}
