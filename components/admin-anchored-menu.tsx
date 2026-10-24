"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

/**
 * Row action menu positioned on the viewport, so table scroll areas cannot clip it.
 * Opens upward when there is more room above the button than below.
 */
export function AnchoredMenu({
  open,
  onToggle,
  label,
  className,
  icon,
  children,
}: {
  open: boolean
  onToggle: () => void
  label: string
  className?: string
  icon: ReactNode
  children: ReactNode
}) {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [style, setStyle] = useState<{ top?: number; bottom?: number; right: number; maxHeight: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null)
      return
    }
    function place() {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const gap = 6
      const spaceBelow = window.innerHeight - rect.bottom - gap - 12
      const spaceAbove = rect.top - gap - 12
      const openUp = spaceBelow < 180 && spaceAbove > spaceBelow
      const maxHeight = Math.max(140, Math.min(320, openUp ? spaceAbove : spaceBelow))
      setStyle({
        top: openUp ? undefined : rect.bottom + gap,
        bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
        right: Math.max(12, window.innerWidth - rect.right),
        maxHeight,
      })
    }
    place()
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={className}
      >
        {icon}
      </button>
      {open && style && createPortal(
        <div
          style={{
            position: "fixed",
            top: style.top,
            bottom: style.bottom,
            right: style.right,
            maxHeight: style.maxHeight,
            overflowY: "auto",
            zIndex: 80,
          }}
          className="min-w-44 border border-border bg-background shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}
