import { Github } from "lucide-react";
import { sectionTitleClassName } from "@/components/sectionStyles";
import { featuredProjects } from "@/lib/featuredProjects";

export default function HomeFeaturedProjects() {
  return (
    <section className="py-12 text-foreground">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center xl:items-start xl:text-left">
          <h2 className={sectionTitleClassName("text-xl")}>Projects</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            A curated selection of some of the best work from projects
            I&apos;ve built across different domains.
          </p>
        </div>
        <ul className="flex flex-col">
          {featuredProjects.map((project) => (
            <li
              key={project.title}
              className="border-b border-border/70 first:border-t"
            >
              <article className="group flex flex-col gap-4 py-8 transition-transform duration-300">
                <div className="flex flex-col gap-4 text-left">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-foreground/85 sm:text-3xl">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.72rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                          {project.domain}
                        </p>
                        {project.isCurrent ? (
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Current
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-5">
                      {project.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/project-link flex flex-col items-center gap-1 text-sm text-muted-foreground transition-colors duration-200 hover:text-[rgb(147,197,253)] focus-visible:text-[rgb(147,197,253)] focus-visible:outline-none"
                        >
                          {link.label.toLowerCase() === "github" ? (
                            <Github className="size-[18px] transition-colors duration-200" aria-hidden="true" />
                          ) : null}
                          <span className="underline-offset-4 group-hover/project-link:underline group-focus-visible/project-link:underline">
                            {link.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                    {project.description}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-muted-foreground">
                    {project.stack.map((item, index) => (
                      <span key={item} className="inline-flex items-center">
                        {index > 0 ? <span className="mr-2 opacity-50">•</span> : null}
                        <span>{item}</span>
                      </span>
                    ))}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
