import type { CSSProperties } from "react";
import { sectionTitleClassName } from "@/components/sectionStyles";

type TechItem = {
  label: string;
  slug: string;
  accent: string;
  src: string;
  invert?: boolean;
  invertAlways?: boolean;
};

const icons: TechItem[] = [
  { label: "HTML", slug: "html", accent: "rgba(227, 79, 38, 0.7)", src: "/marquee/top/html-1.svg" },
  { label: "CSS", slug: "css", accent: "rgba(21, 114, 182, 0.7)", src: "/marquee/top/icons8-css-logo.svg" },
  { label: "JavaScript", slug: "javascript", accent: "rgba(247, 223, 30, 0.7)", src: "/marquee/top/javascript-logo-svgrepo-com.svg" },
  { label: "TypeScript", slug: "typescript", accent: "rgba(49, 120, 198, 0.7)", src: "/marquee/top/ts-logo-128.svg" },
  { label: "React", slug: "react", accent: "rgba(97, 218, 251, 0.7)", src: "/marquee/top/React--Streamline-Svg-Logos.svg" },
  { label: "Next.js", slug: "next", accent: "rgba(255, 255, 255, 0.6)", src: "/marquee/top/nextjs-icon-svgrepo-com.svg", invert: true },
  { label: "Tailwind CSS", slug: "tailwind", accent: "rgba(56, 189, 248, 0.7)", src: "/marquee/top/Tailwind%20CSS.svg" },
  { label: "Express", slug: "express", accent: "rgba(156, 163, 175, 0.55)", src: "/marquee/top/expressjs-icon.svg", invert: true },
  { label: "Docker", slug: "docker", accent: "rgba(14, 118, 168, 0.6)", src: "/marquee/top/docker-mark-blue.svg" },
  { label: "OpenGL", slug: "opengl", accent: "rgba(85, 134, 164, 0.65)", src: "/marquee/top/opengl-svgrepo-com.svg" },
  { label: "C", slug: "c", accent: "rgba(0, 116, 197, 0.6)", src: "/marquee/top/c-1.svg" },
  { label: "C++", slug: "cpp", accent: "rgba(0, 122, 204, 0.65)", src: "/marquee/top/cpp.svg" },
  { label: "Python", slug: "python", accent: "rgba(52, 102, 163, 0.6)", src: "/marquee/top/python-logo.svg" },
  { label: "NumPy", slug: "numpy", accent: "rgba(77, 121, 167, 0.6)", src: "/marquee/top/numpy-svgrepo-com.svg" },
  { label: "Matplotlib", slug: "matplotlib", accent: "rgba(29, 169, 224, 0.6)", src: "/marquee/top/Matplotlib_icon.svg" },
  { label: "PyTorch", slug: "pytorch", accent: "rgba(238, 76, 44, 0.6)", src: "/marquee/bottom/PyTorch_logo_icon.svg" },
  { label: "TensorFlow", slug: "tensorflow", accent: "rgba(255, 107, 0, 0.6)", src: "/marquee/bottom/Tensorflow_logo.svg" },
  { label: "Flask", slug: "flask", accent: "rgba(156, 163, 175, 0.55)", src: "/marquee/bottom/palletsprojects_flask-icon~v2.svg", invert: true },
  { label: "MongoDB", slug: "mongodb", accent: "rgba(67, 153, 52, 0.6)", src: "/marquee/bottom/mongodb-icon.svg" },
  { label: "MySQL", slug: "mysql", accent: "rgba(0, 97, 136, 0.6)", src: "/marquee/bottom/mysql-icon.svg" },
  { label: "PostgreSQL", slug: "postgresql", accent: "rgba(51, 103, 145, 0.6)", src: "/marquee/bottom/postgresql-icon.svg" },
  { label: "Supabase", slug: "supabase", accent: "rgba(62, 207, 142, 0.6)", src: "/marquee/bottom/supabase-logo-icon.svg" },
  { label: "Neovim", slug: "neovim", accent: "rgba(87, 173, 90, 0.6)", src: "/marquee/bottom/neovimio-icon.svg" },
  { label: "GitHub", slug: "github", accent: "rgba(147, 147, 147, 0.6)", src: "/marquee/bottom/Github--Streamline-Unicons.svg", invert: true },
  { label: "Vercel", slug: "vercel", accent: "rgba(255, 255, 255, 0.6)", src: "/marquee/bottom/vercel-icon-svgrepo-com.svg", invert: true },
  { label: "Ollama", slug: "ollama", accent: "rgba(255, 255, 255, 0.6)", src: "/marquee/bottom/ollama.svg", invert: true },
  { label: "LM Studio", slug: "lmstudio", accent: "rgba(255, 255, 255, 0.6)", src: "/marquee/bottom/lmstudio.svg", invert: true },
  { label: "Xcode", slug: "xcode", accent: "rgba(33, 150, 243, 0.6)", src: "/marquee/bottom/Xcode.svg" },
  { label: "Swift", slug: "swift", accent: "rgba(240, 80, 56, 0.6)", src: "/marquee/bottom/swift-svgrepo-com.svg" },
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
      data-label={item.label}
      title={item.label}
      tabIndex={0}
    >
      <img
        src={item.src}
        alt=""
        className={`h-11 w-11 object-contain sm:h-14 sm:w-14 lg:h-16 lg:w-16 ${item.invertAlways ? "always-invert" : item.invert ? "auto-invert" : ""}`.trim()}
        loading="lazy"
        decoding="async"
        fetchPriority="low"
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
      <div className="flex flex-col gap-6">
        <h2 className={sectionTitleClassName()}>Languages and Tools</h2>
        <div className="space-y-6">
          <MarqueeRow items={rowOne} direction="left" duration="28s" />
          <MarqueeRow items={rowTwo} direction="right" duration="32s" />
        </div>
      </div>
    </section>
  );
}
