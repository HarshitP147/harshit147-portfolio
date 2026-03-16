"use client"

import { useEffect, useId, useRef, useState } from "react"

import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type ThemeMode = "light" | "dark"

const STORAGE_KEY = "theme"

function getPreferredTheme(): ThemeMode {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === "light" || saved === "dark") {
    return saved
  }

  const cookieTheme = document.cookie
    .split("; ")
    .find((row) => row.startsWith("theme="))
  const cookieValue = cookieTheme ? cookieTheme.split("=")[1] : null
  if (cookieValue === "light" || cookieValue === "dark") {
    return cookieValue
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
}

export default function ThemeToggle({
  className,
  initialTheme,
}: {
  className?: string
  initialTheme?: ThemeMode
}) {
  const [theme, setTheme] = useState<ThemeMode>(initialTheme ?? "light")
  const switchId = useId()
  const didInit = useRef(false)

  useEffect(() => {
    if (!didInit.current) {
      const preferred = getPreferredTheme();
      didInit.current = true;
      // Use setTimeout to avoid setState in effect
      setTimeout(() => {
        setTheme(preferred);
      }, 0);
      applyTheme(preferred);
      window.localStorage.setItem(STORAGE_KEY, preferred);
      document.cookie = `theme=${preferred}; path=/; max-age=31536000; samesite=lax`;
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  const isDark = theme === "dark"
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Switch
        id={switchId}
        checked={isDark}
        onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="h-8 w-14 border-border/70 bg-muted/60 dark:border-black/10 dark:bg-white/90"
        thumbClassName="left-1.5 flex h-6 w-6 items-center justify-center bg-foreground text-background shadow-sm p-0 dark:bg-black dark:text-white"
        thumbCheckedClassName="translate-x-5"
        thumbChildren={
          isDark ? (
            <Sun className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <Moon className="h-3.5 w-3.5 shrink-0" />
          )
        }
      />
    </div>
  )
}
