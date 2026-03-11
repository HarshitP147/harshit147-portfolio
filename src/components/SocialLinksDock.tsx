import type { PersonalLink } from "@/lib/personalLinks";
import { isExternalLink, LinkIcon } from "@/components/SocialLinksShared";

type SocialLinksDockProps = {
  links: PersonalLink[];
};

export default function SocialLinksDock({ links }: SocialLinksDockProps) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3 md:hidden">
      {links.map((link) => {
        const external = isExternalLink(link.href);

        return (
          <li key={link.href}>
            <a
              href={link.href}
              aria-label={link.ariaLabel}
              className="group flex h-11 w-11 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors duration-200 hover:text-[rgb(147,197,253)] focus-visible:text-[rgb(147,197,253)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(147,197,253)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  );
}
