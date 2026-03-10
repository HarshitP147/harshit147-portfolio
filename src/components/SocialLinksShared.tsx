import { Mail } from "lucide-react";

import GitHubIcon from "@/components/icons/GitHubIcon";
import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import XIcon from "@/components/icons/XIcon";
import type { PersonalLink } from "@/lib/personalLinks";

export function LinkIcon({ platform }: { platform: PersonalLink["platform"] }) {
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

export function isExternalLink(href: string) {
  return !href.startsWith("mailto:");
}
