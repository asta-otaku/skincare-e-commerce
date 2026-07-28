"use client"

import { useMemo, useState } from "react"
import { Check, Search, X } from "lucide-react"
import type { CategorySection } from "@/lib/supabase/categories"
import { cn } from "@/lib/utils"

type Props = {
  tree: CategorySection[]
  value: string[]
  onChange: (names: string[]) => void
  emptyHint?: string
}

/** Multi-select categories grouped by section. */
export function CategoryMultiSelect({
  tree,
  value,
  onChange,
  emptyHint = "Select one or more categories…",
}: Props) {
  const [query, setQuery] = useState("")
  const selected = useMemo(() => value.filter(Boolean), [value])

  const filteredTree = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tree
    return tree
      .map(s => ({
        ...s,
        categories: s.categories.filter(
          c => c.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
        ),
      }))
      .filter(s => s.categories.length > 0)
  }, [tree, query])

  function toggle(name: string) {
    if (selected.includes(name)) onChange(selected.filter(n => n !== name))
    else onChange([...selected, name])
  }

  return (
    <div className="space-y-3">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(name => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 border border-gold/40 bg-lavender px-2.5 py-1 text-[11px] font-light text-gold"
            >
              {name}
              <button type="button" onClick={() => toggle(name)} aria-label={`Remove ${name}`}>
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
          onChange={e => setQuery(e.target.value)}
          placeholder="Search categories…"
          className="w-full border border-border bg-background py-2.5 pl-9 pr-3 text-sm font-light outline-none focus:border-foreground"
        />
      </div>

      <div className="max-h-64 overflow-y-auto border border-border">
        {filteredTree.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs font-light text-muted-foreground">{emptyHint}</p>
        ) : (
          filteredTree.map(section => (
            <div key={section.id} className="border-b border-border last:border-b-0">
              <p className="sticky top-0 bg-muted/80 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-sm">
                {section.name}
              </p>
              <ul>
                {section.categories.map(cat => {
                  const on = selected.includes(cat.name)
                  return (
                    <li key={cat.id}>
                      <button
                        type="button"
                        onClick={() => toggle(cat.name)}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-light transition-colors",
                          on ? "bg-lavender/60 text-gold" : "text-foreground/80 hover:bg-muted",
                        )}
                      >
                        {cat.name}
                        {on && <Check className="size-3.5 shrink-0" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
