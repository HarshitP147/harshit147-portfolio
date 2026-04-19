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
    title: "LM Studio CLI",
    domain: "Developer Tools",
    description:
      "A terminal REPL for chatting with local LM Studio models over their OpenAI-compatible API, with planned tool use and MCP support.",
    stack: ["TypeScript", "React", "Ink", "Node.js", "LM Studio"],
    links: [
      {
        label: "GitHub",
        href: "https://github.com/HarshitP147/lm-cli",
      },
    ],
    isCurrent: true,
  },
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
];
