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
    title: "Numpy Network",
    domain: "Deep Learning / AI",
    description:
      "A simple neural network built from scratch using only Numpy, designed to classify handwritten digits from the MNIST dataset.",
    stack: ["Python", "Numpy", "Matplotlib", "Differential Calculus"],
    links: [
      {
        "label":"GitHub",
        "href":"https://github.com/HarshitP147/nn-from-scratch"
      }
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
      "Cloudflare (R2 and D1)"
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
