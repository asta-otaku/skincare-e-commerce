"use client"

import { use, useState } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react"
import { deals as allDeals, getDeal, type Deal, type DealItem } from "@/lib/deals"
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
  const deal = getDeal(id)

  if (!deal) notFound()

  const [form, setForm] = useState<FormState>({
    title:         deal.title,
    brand:         deal.brand,
    subtitle:      deal.subtitle,
    concern:       deal.concern,
    badge:         deal.badge,
    originalPrice: deal.originalPrice,
    salePrice:     deal.salePrice,
    highlight:     deal.highlight ?? false,
    status:        deal.status,
    items:         deal.items.map(i => ({ ...i, _key: ++keyCounter })),
  })
  const [saved, setSaved] = useState(false)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function recalcBadge(original: number, sale: number) {
    if (original > 0 && sale > 0 && sale < original) {
      const pct = Math.round(((original - sale) / original) * 100)
      set("badge", `Save ${pct}%`)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
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
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] transition-all",
              saved
                ? "bg-gold text-gold-foreground"
                : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {saved ? <><Check className="size-3.5" /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>

      <form id="deal-edit-form" onSubmit={handleSubmit} className="px-6 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: main details */}
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

            {/* Pricing */}
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
              {form.originalPrice > 0 && form.salePrice > 0 && form.salePrice < form.originalPrice && (
                <p className="mt-3 text-xs font-light text-green-600">
                  Saving: ₦{(form.originalPrice - form.salePrice).toLocaleString()} ({Math.round(((form.originalPrice - form.salePrice) / form.originalPrice) * 100)}% off)
                </p>
              )}
            </div>

            {/* Bundle items */}
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

          {/* Right: settings */}
          <div className="space-y-5">
            <div className="border border-border p-5">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.15em]">Publish</h2>
              <div className="space-y-3">
                {(["active", "draft", "archived"] as const).map(s => (
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
                        {s === "active" ? "Visible on storefront"
                          : s === "draft" ? "Hidden from customers"
                          : "Removed from all listings"}
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

            {/* Meta */}
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
