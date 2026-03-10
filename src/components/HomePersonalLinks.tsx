import Image from "next/image";
import {
  ArrowUpRight,
  Mail,
} from "lucide-react";

import { sectionTitleClassName } from "@/components/sectionStyles";
import GitHubIcon from "@/components/icons/GitHubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import type { PersonalLink } from "@/lib/personalLinks";
import { personalLinks } from "@/lib/personalLinks";

function LinkIcon({ platform }: { platform: PersonalLink["platform"] }) {
  if (platform === "linkedin") {
    return <LinkedInIcon />;
  }
  if (platform === "github") {
    return <GitHubIcon className="block size-full object-contain dark:invert" />;
  }
  if (platform === "x") {
    return <XIcon />;
  }
  if (platform === "instagram") {
    return <InstagramIcon />;
  }

  return <Mail className="size-8" aria-hidden="true" />;
}

function isExternalLink(href: string) {
  return !href.startsWith("mailto:");
}

export default function HomePersonalLinks() {
  return (
    <section className="py-12 text-foreground">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center xl:items-start xl:text-left">
          <h2 className={sectionTitleClassName("text-xl")}>My Socials</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Socials where I am most active. Feel free to reach out!
          </p>
        </div>

        <div className="flex flex-col gap-6 md:grid md:w-full md:max-w-4xl md:grid-cols-[minmax(0,240px)_minmax(280px,340px)] md:items-start md:gap-10 xl:max-w-none xl:grid-cols-[minmax(0,280px)_minmax(280px,360px)] xl:gap-16">
          <div className="w-full md:shrink-0 md:self-start">
            <div className="w-full max-w-[135px] md:max-w-[180px] overflow-hidden rounded-3xl border border-border/70 bg-muted/20">
              <div className="relative  aspect-[9/16] w-full">
                <Image
                  src="/misc/me_real_clear.png"
                  alt="Harshit sitting behind a laptop and smiling"
                  fill
                  className="object-cover"
                  sizes="(max-width: 767px) 80vw, (max-width: 1279px) 180px, 200px"
                  priority={false}
                />
              </div>
            </div>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-3 md:hidden">
            {personalLinks.map((link) => {
              const external = isExternalLink(link.href);

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-label={link.ariaLabel}
                    className="group flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition-colors duration-200 hover:text-[rgb(147,197,253)] focus-visible:text-[rgb(147,197,253)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    <span className="grid size-8 place-items-center leading-none">
                      <LinkIcon platform={link.platform} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <ul className="hidden h-full w-full flex-col justify-end gap-3 md:flex">
            {personalLinks.map((link) => {
              const external = isExternalLink(link.href);

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-label={link.ariaLabel}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-muted-foreground transition-colors duration-200 hover:text-[rgb(147,197,253)] focus-visible:text-[rgb(147,197,253)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                  >
                    <span className="grid size-8 shrink-0 place-items-center leading-none">
                      <LinkIcon platform={link.platform} />
                    </span>
                    <span className="text-base font-medium">{link.label}</span>
                    <ArrowUpRight
                      className="ml-auto size-4 translate-y-0.5 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:-translate-y-0.5 group-focus-visible:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
