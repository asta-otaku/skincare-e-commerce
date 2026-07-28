"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Plus, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

type TagPickerProps = {
  label: string
  hint?: string
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  allowCustom?: boolean
}

/**
 * Search-first multi-select: selected chips + filtered pinned suggestions.
 * Avoids dumping long option lists as always-visible toggles.
 */
export function TagPicker({
  label,
  hint,
  options,
  value,
  onChange,
  placeholder = "Search to add…",
  allowCustom = true,
}: TagPickerProps) {
  const listId = useId()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => value.filter(Boolean),
    [value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = options.filter(o => !selected.includes(o))
    if (!q) return pool.slice(0, 12)
    return pool.filter(o => o.toLowerCase().includes(q)).slice(0, 20)
  }, [options, query, selected])

  const exactMatch = options.some(o => o.toLowerCase() === query.trim().toLowerCase())
  const canAddCustom =
    allowCustom &&
    query.trim().length > 0 &&
    !exactMatch &&
    !selected.some(s => s.toLowerCase() === query.trim().toLowerCase())

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  function add(tag: string) {
    const t = tag.trim()
    if (!t || selected.includes(t)) return
    onChange([...selected, t])
    setQuery("")
  }

  function remove(tag: string) {
    onChange(selected.filter(s => s !== tag))
  }

  return (
    <div ref={rootRef} className="space-y-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em]">{label}</p>
        {hint && <p className="mt-1 text-[11px] font-light text-muted-foreground">{hint}</p>}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 border border-gold/40 bg-lavender px-2.5 py-1 text-[11px] font-light text-gold"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                aria-label={`Remove ${tag}`}
                className="text-gold/70 hover:text-gold"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (filtered[0]) add(filtered[0])
              else if (canAddCustom) add(query)
            }
            if (e.key === "Escape") setOpen(false)
          }}
          placeholder={placeholder}
          aria-controls={listId}
          aria-expanded={open}
          className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm font-light outline-none focus:border-foreground"
        />

        {open && (filtered.length > 0 || canAddCustom) && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto border border-border bg-background shadow-lg"
          >
            {filtered.map(opt => (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  onClick={() => add(opt)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-light text-foreground/80 hover:bg-muted hover:text-gold"
                >
                  {opt}
                  <Plus className="size-3 opacity-40" />
                </button>
              </li>
            ))}
            {canAddCustom && (
              <li>
                <button
                  type="button"
                  onClick={() => add(query)}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-xs font-medium text-gold hover:bg-muted"
                >
                  <Plus className="size-3.5" />
                  Add “{query.trim()}”
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {!query && !open && selected.length === 0 && (
        <p className="text-[10px] font-light text-muted-foreground">
          Start typing to search {options.length} pinned options
          {allowCustom ? ", or add a custom value" : ""}.
        </p>
      )}
    </div>
  )
}
