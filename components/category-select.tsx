"use client"

import { cn } from "@/lib/utils"
import type { CategorySection } from "@/lib/supabase/categories"

/** Sectioned <select> with <optgroup> for category sections. */
export function CategorySelect({
  value,
  onChange,
  tree,
  required,
  className,
  includeAll,
  allLabel = "All",
  emptyLabel = "Select category…",
  id,
}: {
  value: string
  onChange: (value: string) => void
  tree: CategorySection[]
  required?: boolean
  className?: string
  /** Prefixed "All" option (shop filters) */
  includeAll?: boolean
  allLabel?: string
  emptyLabel?: string
  id?: string
}) {
  const hasValue =
    includeAll
      ? true
      : tree.some(s => s.categories.some(c => c.name === value))

  return (
    <select
      id={id}
      value={hasValue || includeAll ? value : ""}
      onChange={e => onChange(e.target.value)}
      required={required}
      className={cn(className)}
    >
      {includeAll ? (
        <option value="All">{allLabel}</option>
      ) : (
        <option value="" disabled>
          {emptyLabel}
        </option>
      )}
      {tree.map(section => (
        <optgroup key={section.id} label={section.name}>
          {section.categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
