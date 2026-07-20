"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react"
import { type Deal, type DealItem } from "@/lib/deals"
import { getDealById, saveDeal } from "@/lib/supabase/deals"
import { revalidateDeals } from "@/app/actions/revalidate"
import { cn } from "@/lib/utils"

let keyCounter = 100

type FormState = Omit<Deal, "id" | "createdAt" | "items"> & {
  items: (DealItem & { _key: number })[]
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}

export default function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [deal, setDeal] = useState<Deal | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  const load = useCallback(async () => {
    setStatus("loading")
    setErrorMsg("")
    try {
      const d = await getDealById(id)
      if (!d) {
        setDeal(null)
        setStatus("missing")
        return
      }
      setDeal(d)
      setStatus("ready")
    } catch (err) {
      setDeal(null)
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Failed to load deal")
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (status === "loading") {
    return (
      <div className="flex-1 overflow-auto px-6 py-8 lg:px-8">
        <div className="space-y-4 max-w-2xl">
          <div className="h-8 w-48 bg-muted/50 animate-pulse" />
          <div className="h-32 w-full bg-muted/30 animate-pulse" />
        </div>
      </div>
    )
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <p className="font-serif text-2xl font-medium">
          {status === "missing" ? "Deal not found" : "Couldn’t load deal"}
        </p>
        <p className="max-w-md text-sm font-light text-muted-foreground">
          {status === "missing"
            ? `No deal with id “${id}” was found. It may have been deleted.`
            : errorMsg}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={load}
            className="border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors"
          >
            Retry
          </button>
          <Link
            href="/admin/deals"
            className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            Back to Deals
          </Link>
        </div>
      </div>
    )
  }

  return <EditDealForm deal={deal!} />
}

function EditDealForm({ deal }: { deal: Deal }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    title:         deal.title,
    brand:         deal.brand,
    subtitle:      deal.subtitle,
    concern:       deal.concern,
    badge:         deal.badge,
    originalPrice: deal.originalPrice,
    salePrice:     deal.salePrice,
    highlight:     deal.highlight ?? false,
    status:        deal.status === "archived" ? "draft" : deal.status,
    items:         deal.items.length
      ? deal.items.map(i => ({ ...i, _key: ++keyCounter }))
      : [{ _key: ++keyCounter, name: "", size: "", price: 0 }],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function addItem() {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { _key: ++keyCounter, name: "", size: "", price: 0 }],
    }))
  }

  function removeItem(key: number) {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i._key !== key) }))
  }

  function updateItem(key: number, field: keyof DealItem, value: string | number) {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => i._key === key ? { ...i, [field]: value } : i),
    }))
  }

  function validate() {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = "Required"
    if (!form.brand.trim()) e.brand = "Required"
    if (!form.salePrice || isNaN(Number(form.salePrice))) e.salePrice = "Enter a valid price"
    if (!form.originalPrice || isNaN(Number(form.originalPrice))) e.originalPrice = "Enter a valid price"
    if (form.items.some(i => !i.name.trim())) e.items = "All items need a name"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setSaveError("")
    try {
      await saveDeal(
        {
          id: deal.id,
          title: form.title,
          brand: form.brand,
          subtitle: form.subtitle,
          concern: form.concern,
          badge: form.badge,
          originalPrice: Number(form.originalPrice),
          salePrice: Number(form.salePrice),
          highlight: form.highlight,
          status: form.status,
          items: form.items.map(({ _key, ...i }) => i),
        },
        deal.id,
      )
      await revalidateDeals()
      setSaved(true)
      setTimeout(() => router.push("/admin/deals"), 800)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.")
      setSaving(false)
    }
  }

  function recalcBadge(original: number, sale: number) {
    if (original > 0 && sale > 0 && sale < original) {
      const pct = Math.round(((original - sale) / original) * 100)
      set("badge", `Save ${pct}%`)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/deals"
            className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-medium">Edit Deal</h1>
            <p className="text-xs font-light text-muted-foreground">{deal.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/deals"
            className="border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-colors hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="deal-edit-form"
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all",
              saved ? "bg-gold text-gold-foreground"
                : saving ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {saved ? <><Check className="size-3.5" /> Saved!</> : saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="deal-edit-form" onSubmit={handleSubmit} className="px-6 py-8 lg:px-8 lg:py-10">
        {saveError && (
          <p className="mb-6 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5">
            {saveError}
            {saveError.includes("brand_name") || saveError.includes("highlight") ? (
              <span className="block mt-1 text-muted-foreground">
                Run migration <code className="font-mono">005_deals_extra_columns.sql</code> in the Supabase SQL Editor.
              </span>
            ) : null}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border p-6">
              <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.15em]">Deal Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Deal Title" required>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    className={cn(
                      "w-full border bg-background px-4 py-2.5 text-sm font-light outline-none transition-colors",
                      errors.title ? "border-destructive" : "border-border focus:border-foreground",
                    )}
                  />
                  {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
                </Field>
                <Field label="Brand / Source" required>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={e => set("brand", e.target.value)}
                    className={cn(
                      "w-full border bg-background px-4 py-2.5 text-sm font-light outline-none transition-colors",
                      errors.brand ? "border-destructive" : "border-border focus:border-foreground",
                    )}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Short Subtitle">
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={e => set("subtitle", e.target.value)}
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground transition-colors"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Target Concerns">
                  <input
                    type="text"
                    value={form.concern}
                    onChange={e => set("concern", e.target.value)}
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground transition-colors"
                  />
                </Field>
              </div>
            </div>

            <div className="border border-border p-6">
              <h2 className="mb-5 text-sm font-medium uppercase tracking-[0.15em]">Pricing</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Original Price (₦)" required>
                  <input
                    type="number"
                    min={0}
                    value={form.originalPrice}
                    onChange={e => {
                      const v = Number(e.target.value)
                      set("originalPrice", v)
                      recalcBadge(v, form.salePrice)
                    }}
                    className={cn(
                      "w-full border bg-background px-4 py-2.5 text-sm font-light outline-none transition-colors",
                      errors.originalPrice ? "border-destructive" : "border-border focus:border-foreground",
                    )}
                  />
                </Field>
                <Field label="Sale Price (₦)" required>
                  <input
                    type="number"
                    min={0}
                    value={form.salePrice}
                    onChange={e => {
                      const v = Number(e.target.value)
                      set("salePrice", v)
                      recalcBadge(form.originalPrice, v)
                    }}
                    className={cn(
                      "w-full border bg-background px-4 py-2.5 text-sm font-light outline-none transition-colors",
                      errors.salePrice ? "border-destructive" : "border-border focus:border-foreground",
                    )}
                  />
                </Field>
                <Field label="Badge Text">
                  <input
                    type="text"
                    value={form.badge}
                    onChange={e => set("badge", e.target.value)}
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground transition-colors"
                  />
                </Field>
              </div>
            </div>

            <div className="border border-border p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-medium uppercase tracking-[0.15em]">Bundle Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1.5 border border-dashed border-border px-3 py-1.5 text-xs font-light text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Plus className="size-3" /> Add item
                </button>
              </div>
              {errors.items && <p className="mb-3 text-xs text-destructive">{errors.items}</p>}
              <div className="space-y-3">
                {form.items.map((item, idx) => (
                  <div key={item._key} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                    <input
                      type="text"
                      placeholder={`Item ${idx + 1} name`}
                      value={item.name}
                      onChange={e => updateItem(item._key, "name", e.target.value)}
                      className="border border-border bg-background px-3 py-2 text-sm font-light outline-none focus:border-foreground transition-colors"
                    />
                    <input
                      type="text"
                      placeholder="Size"
                      value={item.size}
                      onChange={e => updateItem(item._key, "size", e.target.value)}
                      className="w-20 border border-border bg-background px-3 py-2 text-sm font-light outline-none focus:border-foreground transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="₦ Price"
                      min={0}
                      value={item.price || ""}
                      onChange={e => updateItem(item._key, "price", Number(e.target.value))}
                      className="w-24 border border-border bg-background px-3 py-2 text-sm font-light outline-none focus:border-foreground transition-colors"
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item._key)}
                        className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="border border-border p-5">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">Publish</h2>
              <div className="space-y-3">
                {(["active", "draft"] as const).map(s => (
                  <label key={s} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="status"
                      checked={form.status === s}
                      onChange={() => set("status", s)}
                      className="accent-foreground"
                    />
                    <div>
                      <p className="text-sm font-medium capitalize">{s}</p>
                      <p className="text-xs font-light text-muted-foreground">
                        {s === "active" ? "Visible on storefront" : "Hidden from customers"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border border-border p-5">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">Options</h2>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.highlight}
                  onChange={e => set("highlight", e.target.checked)}
                  className="mt-0.5 accent-foreground"
                />
                <div>
                  <p className="text-sm font-medium">Featured Deal</p>
                  <p className="text-xs font-light text-muted-foreground">
                    Adds a highlighted border on the deals page
                  </p>
                </div>
              </label>
            </div>

            <div className="border border-border p-5">
              <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.15em]">Info</h2>
              <p className="text-xs font-light text-muted-foreground">ID: {deal.id}</p>
              <p className="text-xs font-light text-muted-foreground">Created: {deal.createdAt}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
