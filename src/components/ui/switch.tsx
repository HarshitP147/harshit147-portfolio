"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<
  React.ComponentPropsWithoutRef<"button">,
  "onChange"
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  thumbClassName?: string
  thumbCheckedClassName?: string
  thumbChildren?: React.ReactNode
}

function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  children,
  thumbClassName,
  thumbCheckedClassName,
  thumbChildren,
  ...props
}: SwitchProps) {
  const isControlled = checked !== undefined
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)
  const isChecked = isControlled ? checked : internalChecked
  const useCustomTranslate = Boolean(thumbCheckedClassName)

  const toggle = React.useCallback(() => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) {
      setInternalChecked(next)
    }
    onCheckedChange?.(next)
  }, [disabled, isChecked, isControlled, onCheckedChange])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "group relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted transition data-[state=checked]:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute left-2 top-1/2 block h-4 w-4 -translate-y-1/2 rounded-full bg-foreground transition-transform",
          thumbClassName,
          isChecked && !useCustomTranslate && "translate-x-4",
          isChecked && thumbCheckedClassName
        )}
      >
        {thumbChildren}
      </span>
      {children}
    </button>
  )
}

export { Switch }
