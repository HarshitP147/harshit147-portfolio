import { cn } from "@/lib/utils";

export function sectionShellClassName(className?: string) {
  return cn("mx-auto w-full max-w-5xl px-4", className);
}

export function sectionTitleClassName(className?: string) {
  return cn("text-center text-lg font-semibold text-foreground xl:text-left", className);
}
