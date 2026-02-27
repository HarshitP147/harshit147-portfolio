import type { CSSProperties } from "react";

type TechItem = {
  label: string;
  slug: string;
  accent: string;
  src: string;
  invert?: boolean;
  invertAlways?: boolean;
};

const icons: TechItem[] = [
  { label: "GitHub", slug: "github", accent: "rgba(147, 147, 147, 0.6)", src: "/Github--Streamline-Unicons.svg", invert: true },
  { label: "Matplotlib", slug: "matplotlib", accent: "rgba(29, 169, 224, 0.6)", src: "/Matplotlib_icon.svg" },
  { label: "PyTorch", slug: "pytorch", accent: "rgba(238, 76, 44, 0.6)", src: "/PyTorch_logo_icon.svg" },
  { label: "React", slug: "react", accent: "rgba(97, 218, 251, 0.7)", src: "/React--Streamline-Svg-Logos.svg" },
  { label: "TensorFlow", slug: "tensorflow", accent: "rgba(255, 107, 0, 0.6)", src: "/Tensorflow_logo.svg" },
  { label: "Xcode", slug: "xcode", accent: "rgba(33, 150, 243, 0.6)", src: "/Xcode.svg" },
  { label: "C", slug: "c", accent: "rgba(0, 116, 197, 0.6)", src: "/c-1.svg" },
  { label: "C++", slug: "cpp", accent: "rgba(0, 122, 204, 0.65)", src: "/cpp.svg" },
  { label: "Docker", slug: "docker", accent: "rgba(14, 118, 168, 0.6)", src: "/docker-mark-blue.svg" },
  { label: "Express", slug: "express", accent: "rgba(156, 163, 175, 0.55)", src: "/expressjs-icon.svg", invert: true },
  { label: "MongoDB", slug: "mongodb", accent: "rgba(67, 153, 52, 0.6)", src: "/mongodb-icon.svg" },
  { label: "MySQL", slug: "mysql", accent: "rgba(0, 97, 136, 0.6)", src: "/mysql-icon.svg" },
  { label: "Next.js", slug: "next", accent: "rgba(255, 255, 255, 0.6)", src: "/nextjs-icon-svgrepo-com.svg", invert: true },
  { label: "NumPy", slug: "numpy", accent: "rgba(77, 121, 167, 0.6)", src: "/numpy-svgrepo-com.svg" },
  { label: "Flask", slug: "flask", accent: "rgba(156, 163, 175, 0.55)", src: "/palletsprojects_flask-icon~v2.svg", invert: true },
  { label: "PostgreSQL", slug: "postgresql", accent: "rgba(51, 103, 145, 0.6)", src: "/postgresql-icon.svg" },
  { label: "Python", slug: "python", accent: "rgba(52, 102, 163, 0.6)", src: "/python-logo.svg" },
  { label: "Supabase", slug: "supabase", accent: "rgba(62, 207, 142, 0.6)", src: "/supabase-logo-icon.svg" },
  { label: "Swift", slug: "swift", accent: "rgba(240, 80, 56, 0.6)", src: "/swift-svgrepo-com.svg" },
  { label: "TypeScript", slug: "typescript", accent: "rgba(49, 120, 198, 0.7)", src: "/ts-logo-128.svg" },
  { label: "Vercel", slug: "vercel", accent: "rgba(255, 255, 255, 0.6)", src: "/vercel-icon-svgrepo-com.svg", invert: true },
  { label: "JavaScript", slug: "javascript", accent: "rgba(247, 223, 30, 0.7)", src: "/javascript-logo-svgrepo-com.svg" },
  { label: "Neovim", slug: "neovim", accent: "rgba(87, 173, 90, 0.6)", src: "/neovimio-icon.svg" },
];

const midpoint = Math.ceil(icons.length / 2);
const rowOne: TechItem[] = icons.slice(0, midpoint);
const rowTwo: TechItem[] = icons.slice(midpoint);

type MarqueeRowProps = {
  items: TechItem[];
  direction?: "left" | "right";
  duration?: string;
};

function MarqueeItem({ item }: { item: TechItem }) {
  return (
    <div
      className={`icon-card icon-${item.slug} flex h-20 w-20 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5 shadow-sm sm:h-24 sm:w-24 sm:rounded-[24px] lg:h-28 lg:w-28 lg:rounded-[28px]`}
      style={{ "--icon-accent": item.accent } as CSSProperties}
      role="img"
      aria-label={item.label}
      tabIndex={0}
    >
      <img
        src={item.src}
        alt=""
        className={`h-11 w-11 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${item.invertAlways ? "always-invert" : item.invert ? "auto-invert" : ""}`.trim()}
        draggable={false}
      />
      <span className="sr-only">{item.label}</span>
    </div>
  );
}

function MarqueeRow({ items, direction = "left", duration = "32s" }: MarqueeRowProps) {
  const marqueeClass = direction === "right" ? "marquee marquee-right" : "marquee";
  return (
    <div className={marqueeClass} style={{ "--duration": duration } as CSSProperties}>
      <div className="marquee-track">
        {items.concat(items).map((item, index) => (
          <MarqueeItem key={`${item.slug}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function TechMarquee() {
  return (
    <section className="w-full py-16 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6">
        <p className="text-center text-sm text-muted-foreground">
          Languages and tools
        </p>
        <div className="space-y-6">
          <MarqueeRow items={rowOne} direction="left" duration="28s" />
          <MarqueeRow items={rowTwo} direction="right" duration="32s" />
        </div>
      </div>
    </section>
  );
}
