"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus, Search, Trash2, RefreshCw, ToggleLeft, ToggleRight, FolderTree, ChevronRight, X, Pencil,
} from "lucide-react"
import {
  deleteCategory,
  deleteCategorySection,
  getCategoryTreeForAdmin,
  saveCategory,
  saveCategorySection,
  toggleCategoryActive,
  toggleSectionActive,
  type Category,
  type CategorySection,
} from "@/lib/supabase/categories"
import { cn } from "@/lib/utils"

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<CategorySection[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Section modal
  const [sectionOpen, setSectionOpen] = useState(false)
  const [sectionEditId, setSectionEditId] = useState<string | null>(null)
  const [sectionName, setSectionName] = useState("")
  const [sectionSort, setSectionSort] = useState("0")
  const [savingSection, setSavingSection] = useState(false)

  // Category modal
  const [catOpen, setCatOpen] = useState(false)
  const [catEditId, setCatEditId] = useState<string | null>(null)
  const [catSectionId, setCatSectionId] = useState("")
  const [catName, setCatName] = useState("")
  const [catSort, setCatSort] = useState("0")
  const [savingCat, setSavingCat] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setTree(await getCategoryTreeForAdmin())
    setLoading(false)
  }, [])

  useEffect(() => { void load() }, [load])

  function openAddSection() {
    setSectionEditId(null)
    setSectionName("")
    setSectionSort("0")
    setError(null)
    setSectionOpen(true)
  }

  function openEditSection(s: CategorySection) {
    setSectionEditId(s.id)
    setSectionName(s.name)
    setSectionSort(String(s.sortOrder))
    setError(null)
    setSectionOpen(true)
  }

  function closeSectionModal() {
    if (savingSection) return
    setSectionOpen(false)
    setSectionEditId(null)
    setSectionName("")
    setSectionSort("0")
  }

  function openAddCat(sectionId?: string) {
    setCatEditId(null)
    setCatName("")
    setCatSort("0")
    setCatSectionId(sectionId ?? tree[0]?.id ?? "")
    setError(null)
    setCatOpen(true)
  }

  function openEditCat(c: Category) {
    setCatEditId(c.id)
    setCatName(c.name)
    setCatSectionId(c.sectionId)
    setCatSort(String(c.sortOrder))
    setError(null)
    setCatOpen(true)
  }

  function closeCatModal() {
    if (savingCat) return
    setCatOpen(false)
    setCatEditId(null)
    setCatName("")
    setCatSort("0")
    setCatSectionId("")
  }

  async function handleSaveSection(e: React.FormEvent) {
    e.preventDefault()
    if (!sectionName.trim()) {
      setError("Section name is required.")
      return
    }
    setSavingSection(true)
    setError(null)
    try {
      await saveCategorySection({
        id: sectionEditId ?? undefined,
        name: sectionName,
        sortOrder: parseInt(sectionSort, 10) || 0,
      })
      setSectionOpen(false)
      setSectionEditId(null)
      setSectionName("")
      setSectionSort("0")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save section.")
    } finally {
      setSavingSection(false)
    }
  }

  async function handleSaveCat(e: React.FormEvent) {
    e.preventDefault()
    if (!catName.trim()) {
      setError("Category name is required.")
      return
    }
    if (!catSectionId) {
      setError("Pick a section for this category.")
      return
    }
    setSavingCat(true)
    setError(null)
    try {
      await saveCategory({
        id: catEditId ?? undefined,
        sectionId: catSectionId,
        name: catName,
        sortOrder: parseInt(catSort, 10) || 0,
      })
      setCatOpen(false)
      setCatEditId(null)
      setCatName("")
      setCatSort("0")
      setCatSectionId("")
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save category.")
    } finally {
      setSavingCat(false)
    }
  }

  const q = search.toLowerCase()
  const filtered = tree
    .map(s => ({
      ...s,
      categories: s.categories.filter(c =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q),
      ),
    }))
    .filter(s => !q || s.categories.length > 0 || s.name.toLowerCase().includes(q))

  const totalCats = tree.reduce((n, s) => n + s.categories.length, 0)

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto">
      <div className="admin-page-header">
        <div>
          <h1 className="font-serif text-2xl font-medium">Categories</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            {loading
              ? "Loading…"
              : `${tree.length} sections · ${totalCats} subcategories — used on product form, shop filters & nav`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex size-9 items-center justify-center border border-border text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-40"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </button>
          <button
            type="button"
            onClick={openAddSection}
            className="flex items-center gap-2 border border-border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] hover:border-foreground"
          >
            <Plus className="size-3.5" />
            Section
          </button>
          <button
            type="button"
            onClick={() => openAddCat()}
            disabled={!tree.length}
            className="flex items-center gap-2 bg-foreground px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-40"
          >
            <Plus className="size-3.5" />
            Subcategory
          </button>
        </div>
      </div>

      <div className="admin-page-body space-y-6">
        {error && !sectionOpen && !catOpen && (
          <p className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search sections or categories…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground"
          />
        </div>

        <div className="space-y-4">
          {filtered.map(section => (
            <div key={section.id} className="border border-border">
              <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                <FolderTree className="size-4 text-gold shrink-0" />
                <p className="font-medium text-sm flex-1 min-w-0">{section.name}</p>
                <span className="text-[10px] font-light text-muted-foreground">#{section.sortOrder}</span>
                {!section.isActive && (
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hidden</span>
                )}
                <button
                  type="button"
                  onClick={() => openAddCat(section.id)}
                  className="text-[11px] font-light uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => openEditSection(section)}
                  className="text-muted-foreground hover:text-foreground"
                  title="Edit section"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await toggleSectionActive(section.id, !section.isActive)
                      await load()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Toggle failed")
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  title={section.isActive ? "Deactivate" : "Activate"}
                >
                  {section.isActive ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete section “${section.name}” and all its subcategories?`)) return
                    try {
                      await deleteCategorySection(section.id)
                      await load()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Delete failed")
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <ul className="divide-y divide-border">
                {section.categories.length === 0 ? (
                  <li className="px-4 py-6 text-xs font-light text-muted-foreground">
                    No subcategories yet.{" "}
                    <button
                      type="button"
                      onClick={() => openAddCat(section.id)}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Add one
                    </button>
                  </li>
                ) : (
                  section.categories.map(cat => (
                    <li key={cat.id} className="flex flex-wrap items-center gap-2 px-4 py-3">
                      <ChevronRight className="size-3.5 text-muted-foreground/50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", !cat.isActive && "text-muted-foreground")}>{cat.name}</p>
                        <p className="text-[10px] font-light text-muted-foreground">
                          {cat.slug} · #{cat.sortOrder}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openEditCat(cat)}
                        className="text-muted-foreground hover:text-foreground"
                        title="Edit subcategory"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await toggleCategoryActive(cat.id, !cat.isActive)
                            await load()
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Toggle failed")
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {cat.isActive ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Delete “${cat.name}”? Products keeping this category text will still show it.`)) return
                          try {
                            await deleteCategory(cat.id)
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
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="py-12 text-center text-sm font-light text-muted-foreground">No categories found.</p>
          )}
        </div>
      </div>

      {/* Section modal */}
      {sectionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={closeSectionModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-modal-title"
            className="w-full max-w-md border border-border bg-background p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="section-modal-title" className="font-serif text-xl font-medium">
                  {sectionEditId ? "Edit section" : "Add section"}
                </h2>
                <p className="mt-1 text-xs font-light text-muted-foreground">
                  Top-level groups (e.g. Face, Bath and Body, Perfume).
                </p>
              </div>
              <button
                type="button"
                onClick={closeSectionModal}
                disabled={savingSection}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <p className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <form onSubmit={handleSaveSection} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Name *</span>
                <input
                  value={sectionName}
                  onChange={e => setSectionName(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  placeholder="e.g. Face"
                  required
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Sort order</span>
                <input
                  type="number"
                  value={sectionSort}
                  onChange={e => setSectionSort(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  min={0}
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSectionModal}
                  disabled={savingSection}
                  className="flex-1 border border-border py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:bg-muted disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSection}
                  className="flex-1 bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
                >
                  {savingSection ? "Saving…" : sectionEditId ? "Update" : "Add section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory modal */}
      {catOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={closeCatModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cat-modal-title"
            className="w-full max-w-md border border-border bg-background p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 id="cat-modal-title" className="font-serif text-xl font-medium">
                  {catEditId ? "Edit subcategory" : "Add subcategory"}
                </h2>
                <p className="mt-1 text-xs font-light text-muted-foreground">
                  Stored on products as the category name.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCatModal}
                disabled={savingCat}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <p className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <form onSubmit={handleSaveCat} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Section *</span>
                <select
                  value={catSectionId}
                  onChange={e => setCatSectionId(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  required
                >
                  {tree.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Name *</span>
                <input
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  placeholder="e.g. Face Cleansers & Wash"
                  required
                  autoFocus
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Sort order</span>
                <input
                  type="number"
                  value={catSort}
                  onChange={e => setCatSort(e.target.value)}
                  className="border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground"
                  min={0}
                />
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCatModal}
                  disabled={savingCat}
                  className="flex-1 border border-border py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:bg-muted disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex-1 bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-50"
                >
                  {savingCat ? "Saving…" : catEditId ? "Update" : "Add subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
