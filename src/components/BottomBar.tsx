import ThemeToggle from "@/components/ThemeToggle";
import { sectionShellClassName } from "@/components/sectionStyles";
import { Separator } from "@/components/ui/separator";

type ThemeMode = "light" | "dark";

export default function BottomBar({
  initialTheme,
}: {
  initialTheme?: ThemeMode;
}) {
  return (
    <footer>
      <div className={sectionShellClassName()}>
        <div className="pb-12">
          <Separator className="mt-8 bg-border/70" />
          <div className="mt-6 flex w-full items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Made by Harshit</p>
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>
      </div>
    </footer>
  );
}
