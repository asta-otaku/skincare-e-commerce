"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function AdminPagination({ page, pageSize, total, onPageChange, className }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (total <= pageSize) {
    return (
      <p className={cn("text-center text-[11px] font-light text-muted-foreground", className)}>
        Showing {total} {total === 1 ? "item" : "items"}
      </p>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}>
      <p className="text-[11px] font-light text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] disabled:opacity-40 hover:border-foreground"
        >
          <ChevronLeft className="size-3.5" /> Prev
        </button>
        <span className="text-[11px] font-light text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 border border-border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] disabled:opacity-40 hover:border-foreground"
        >
          Next <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

export const ADMIN_PAGE_SIZE = 20

export type MonthRange = 1 | 2 | 3

export const MONTH_RANGE_OPTIONS: { value: MonthRange; label: string }[] = [
  { value: 1, label: "Last month" },
  { value: 2, label: "Last 2 months" },
  { value: 3, label: "Last 3 months" },
]

export function rangeStartIso(months: MonthRange): string {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  return d.toISOString()
}
