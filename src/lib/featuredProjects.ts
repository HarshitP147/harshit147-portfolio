export type FeaturedProjectLink = {
  label: string;
  href: string;
};

export type FeaturedProject = {
  title: string;
  domain: string;
  description: string;
  stack: string[];
  links: FeaturedProjectLink[];
  isCurrent?: boolean;
};

export const featuredProjects: FeaturedProject[] = [
  {
    title: "Portfolio Website",
    domain: "Fullstack Web",
    description:
      "The website you're currently viewing, designed and engineered with Codex.",
    stack: [
      "Next.js",
      "Shadcn UI",
      "Three.js",
      "Apollo Client",
      "Redis",
    ],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/HarshitP147/harshit147-portfolio",
      },
    ],
    isCurrent: true,
  },
  {
    title: "MNIST Imagen",
    domain: "AI / Generative Models",
    description:
      "A small diffusion model that generates handwritten digit images trained on MNIST.",
    stack: [ "PyTorch", "Matplotlib", "Jupyter"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/HarshitP147/mnist-imagen",
      },
    ],
  },
  {
    title: "Solarpunk Scene explorer",
    domain: "Computer Graphics",
    description:
      "A C++ OpenGL renderer that builds a futuristic Emerald Isle scene with a custom real-time graphics pipeline.",
    stack: ["C++", "OpenGL", "CMake"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/HarshitP147/landscape-opengl-Graphics",
      },
    ],
  },
];
