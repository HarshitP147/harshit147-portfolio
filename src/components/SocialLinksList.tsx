import {
  ArrowUpRight,
  Mail,
} from "lucide-react";

import GitHubIcon from "@/components/icons/GitHubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import type { PersonalLink } from "@/lib/personalLinks";

type SocialLinksListProps = {
  links: PersonalLink[];
};

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

export default function SocialLinksList({ links }: SocialLinksListProps) {
  return (
    <>
      <ul className="flex flex-wrap items-center justify-center gap-3 md:hidden">
        {links.map((link) => {
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

      <ul className="hidden h-full w-full flex-col justify-start gap-3 md:flex md:self-start md:flex-1 md:max-w-[380px]">
        {links.map((link) => {
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
    </>
  );
}

