"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus, Search, Trash2, RefreshCw, ToggleLeft, ToggleRight, X, Pencil, FlaskConical, HeartPulse,
} from "lucide-react"
import {
  deleteCatalogEntry,
  getCatalogEntriesForAdmin,
  saveCatalogEntry,
  toggleCatalogEntryActive,
  type CatalogEntry,
  type CatalogKind,
} from "@/lib/supabase/catalog"
import { cn } from "@/lib/utils"

function CatalogPanel({
  kind,
  title,
  hint,
  icon: Icon,
}: {
  kind: CatalogKind
  title: string
  hint: string
  icon: React.ElementType
}) {
  const [entries, setEntries] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setEntries(await getCatalogEntriesForAdmin(kind))
    setLoading(false)
  }, [kind])

  useEffect(() => { void load() }, [load])

  function openAdd() {
    setEditId(null)
    setName("")
    setSortOrder(String((entries[entries.length - 1]?.sortOrder ?? 0) + 1))
    setError(null)
    setModalOpen(true)
  }

  function openEdit(e: CatalogEntry) {
    setEditId(e.id)
    setName(e.name)
    setSortOrder(String(e.sortOrder))
    setError(null)
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return
    setModalOpen(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveCatalogEntry(kind, {
        id: editId ?? undefined,
        name,
        sortOrder: parseInt(sortOrder, 10) || 0,
      })
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.")
    } finally {
      setSaving(false)
    }
  }

  const q = search.toLowerCase()
  const filtered = entries.filter(e => !q || e.name.toLowerCase().includes(q))

  return (
    <div className="border border-border flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <Icon className="size-4 text-gold shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-[10px] font-light text-muted-foreground">{hint}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex size-8 items-center justify-center border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
        </button>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-foreground px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-background hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </div>

      <div className="relative m-3">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${title.toLowerCase()}…`}
          className="w-full border border-border bg-background py-2 pl-9 pr-3 text-sm font-light outline-none focus:border-foreground"
        />
      </div>

      <ul className="divide-y divide-border">
        {filtered.length === 0 ? (
          <li className="px-4 py-10 text-center text-xs font-light text-muted-foreground">
            {loading ? "Loading…" : "No entries yet."}
          </li>
        ) : (
          filtered.map(entry => (
            <li key={entry.id} className="flex items-center gap-2 px-4 py-2.5">
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", !entry.isActive && "text-muted-foreground")}>
                  {entry.name}
                </p>
                <p className="text-[10px] font-light text-muted-foreground">
                  {entry.slug} · #{entry.sortOrder}
                  {!entry.isActive && " · Hidden"}
                </p>
              </div>
              <button type="button" onClick={() => openEdit(entry)} className="text-muted-foreground hover:text-foreground" title="Edit">
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await toggleCatalogEntryActive(kind, entry.id, !entry.isActive)
                    await load()
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Toggle failed")
                  }
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {entry.isActive ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4" />}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Delete “${entry.name}”? Products keeping this value will still show it.`)) return
                  try {
                    await deleteCatalogEntry(kind, entry.id)
                    await load()
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Delete failed")
                  }
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))
        )}
      </ul>

      {error && !modalOpen && (
        <p className="m-3 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md border border-border bg-background p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-serif text-xl font-medium">
                {editId ? `Edit ${title.slice(0, -1).toLowerCase()}` : `Add ${title.slice(0, -1).toLowerCase()}`}
              </h2>
              <button type="button" onClick={closeModal} disabled={saving} aria-label="Close">
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>
            {error && (
              <p className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Name *</span>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  required
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Sort order</span>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  min={0}
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} disabled={saving} className="flex-1 border border-border py-2.5 text-xs font-medium uppercase tracking-[0.15em]">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-50">
                  {saving ? "Saving…" : editId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminCatalogPage() {
  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto">
      <div className="admin-page-header">
        <div>
          <h1 className="font-serif text-2xl font-medium">Catalog Tags</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            Manage key ingredients and skin concerns used on the product form and storefront filters.
            Custom values added on a product are saved here automatically.
          </p>
        </div>
      </div>

      <div className="admin-page-body grid gap-6 lg:grid-cols-2">
        <CatalogPanel
          kind="ingredients"
          title="Key Ingredients"
          hint="Pinned actives for product tagging"
          icon={FlaskConical}
        />
        <CatalogPanel
          kind="concerns"
          title="Skin Concerns"
          hint="Shop-by-concern and product filters"
          icon={HeartPulse}
        />
      </div>
    </div>
  )
}
