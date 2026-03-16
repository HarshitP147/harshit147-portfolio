"use client"

import { Button } from "@/components/ui/button"
import { sectionShellClassName } from "@/components/sectionStyles"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

export default function NotFoundPage() {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const searchParams = useSearchParams()
  const [canGoBack, setCanGoBack] = useState(false)
  const [referrer, setReferrer] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkHistory = () => setCanGoBack(window.history.length > 1);
      checkHistory();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const origin = window.location.origin;
      const ref = document.referrer;
      if (!ref) return;
      const parsed = new URL(ref);
      if (parsed.origin === origin) {
        setTimeout(() => {
          setReferrer(parsed.pathname + parsed.search + parsed.hash);
        }, 0);
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  const displayPath = useMemo(() => {
    const query = searchParams?.toString()
    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])

  const handleGoBack = useCallback(() => {
    // Replace the 404 entry so it doesn't stay in history.
    const target = referrer && referrer !== displayPath ? referrer : canGoBack ? undefined : "/"
    if (target) {
      router.replace(target)
      return
    }
    router.back()
  }, [canGoBack, displayPath, referrer, router])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className={sectionShellClassName()}>
          <div className="flex flex-col gap-6 rounded-2xl border border-border/60 bg-card/40 p-6 text-center shadow-lg backdrop-blur-sm sm:p-8 sm:text-left">
            <div className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-[auto,1fr] sm:items-start sm:gap-8">
              <div className="flex items-center gap-4 sm:pt-1">
                <span className="text-5xl font-semibold leading-none text-foreground">404</span>
                <span className="hidden h-12 w-px bg-border sm:block" aria-hidden />
              </div>
              <div className="flex flex-col items-center gap-4 sm:items-start">
                <p className="text-xl font-semibold leading-snug">
                  Sorry, the link <span className="font-semibold text-foreground">&ldquo;{displayPath}&rdquo;</span> doesn&apos;t exist.
                </p>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  The page you were trying to reach could not be found. You can go back to where you were or hop back to the homepage.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <Button size="lg" onClick={handleGoBack}>
                    Go back
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => router.replace("/")}>
                    Go home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
