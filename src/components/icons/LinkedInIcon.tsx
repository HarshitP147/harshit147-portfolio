import { cn } from "@/lib/utils";

import LinkedInSvg from "../../../public/misc/linkedin-icon.svg";

type LinkedInIconProps = {
  className?: string;
};

export default function LinkedInIcon({ className }: LinkedInIconProps) {
  return (
    <LinkedInSvg
      viewBox="0 0 635 540"
      preserveAspectRatio="xMidYMid meet"
      className={cn("block size-full", className)}
      aria-hidden="true"
    />
  );
}
