import { ArrowUpRight } from "lucide-react";

import type { PersonalLink } from "@/lib/personalLinks";
import { isExternalLink, LinkIcon } from "@/components/SocialLinksShared";

type SocialLinksStackProps = {
  links: PersonalLink[];
};

export default function SocialLinksStack({ links }: SocialLinksStackProps) {
  return (
    <ul className="hidden h-full w-full flex-col justify-center gap-3 md:flex">
      {links.map((link) => {
        const external = isExternalLink(link.href);

        return (
          <li key={link.href}>
            <a
              href={link.href}
              aria-label={link.ariaLabel}
              className="group flex w-full items-center gap-3 rounded-2xl border  bg-background/50 px-4 py-3 text-muted-foreground transition-[border-color,color,box-shadow] duration-200 hover:border-border/70 hover:text-[rgb(147,197,253)] hover:shadow-[0_0_0_1px_hsl(var(--border)/0.7)] focus-visible:border-border/70 focus-visible:text-[rgb(147,197,253)] focus-visible:shadow-[0_0_0_1px_hsl(var(--border)/0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  );
}
