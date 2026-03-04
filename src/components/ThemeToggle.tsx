"use client"

import { useEffect, useId, useState } from "react"

import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

type ThemeMode = "light" | "dark"

const STORAGE_KEY = "theme"

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light"
  }

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === "light" || saved === "dark") {
    return saved
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

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme())
  const switchId = useId()

  useEffect(() => {
    applyTheme(theme)
    window.localStorage.setItem(STORAGE_KEY, theme)
    document.cookie = `theme=${theme}; path=/; max-age=31536000; samesite=lax`
  }, [theme])

  const isDark = theme === "dark"
  return (
    <div
  className={cn("flex items-center justify-center", className)}
  >
      <Switch
        id={switchId}
        checked={isDark}
        onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="h-8 w-14 border-border/70 bg-muted/60"
        thumbClassName="left-1.5 flex h-6 w-6 items-center justify-center bg-foreground text-background shadow-sm p-0"
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
