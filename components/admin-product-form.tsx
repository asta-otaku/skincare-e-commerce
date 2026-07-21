"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Upload, X, Plus, ArrowLeft, Save, Trash2, GripVertical, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products"
import { ALL_CATEGORIES, ALL_CONCERNS, ALL_INGREDIENTS } from "@/lib/products"
import { getActiveBrands, type Brand } from "@/lib/supabase/brands"

/* ─── Form types ─────────────────────────────────────────────── */
type VariantRow = { label: string; price: string }

/**
 * An image entry in the form.
 * - `preview`  — always set: a blob URL (new file) or a real storage URL (existing)
 * - `file`     — only set when the user just picked the file; undefined for existing images
 */
type ImageEntry = { preview: string; file?: File }

type FormState = {
  name: string
  brand: string
  tagline: string
  price: string
  discountPct: string
  category: string
  tag: Product["tag"] | ""
  size: string
  stock: string
  description: string
  howToUse: string
  benefits: string[]
  ingredients: string[]
  concerns: string[]
  images: ImageEntry[]
  hasVariants: boolean
  variants: VariantRow[]
}

const TAGS: Array<Product["tag"] | ""> = ["", "Bestseller", "New", "Sale", "Low Stock"]

const inputClass =
  "w-full border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"

/* ─── Helpers ────────────────────────────────────────────────── */
function toFormState(product?: Product): FormState {
  const hasVariants = !!(product?.variants && product.variants.length > 0)
  const rawImages = product?.images ?? (product?.image ? [product.image] : [])
  return {
    name:        product?.name        ?? "",
    brand:       product?.brand       ?? "",
    tagline:     product?.tagline     ?? "",
    price:       product              ? String(product.price) : "",
    discountPct: product?.discountPct ? String(product.discountPct) : "",
    category:    product?.category    ?? ALL_CATEGORIES[0],
    tag:         product?.tag         ?? "",
    size:        product?.size        ?? "",
    stock:       product              ? String(product.stock) : "",
    description: product?.description ?? "",
    howToUse:    (product as (Product & { howToUse?: string }) | undefined)?.howToUse ?? "",
    benefits:    product?.benefits?.length    ? product.benefits    : [""],
    ingredients: product?.ingredients?.length ? product.ingredients : [""],
    concerns:    product?.concerns    ?? [],
    // Existing images become entries without a file (they're already uploaded)
    images:      rawImages.map(url => ({ preview: url })),
    hasVariants,
    variants:    hasVariants
      ? product!.variants!.map(v => ({ label: v.label, price: String(v.price) }))
      : [{ label: "", price: "" }],
  }
}

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] font-light text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export function AdminProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(toFormState(product))
  const [brands, setBrands] = useState<Brand[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const isEdit = !!product

  useEffect(() => {
    getActiveBrands().then(list => {
      setBrands(list)
      if (!product?.brand && list[0] && !form.brand) {
        setForm(f => ({ ...f, brand: list[0].name }))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Generic field setter ── */
  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  /* ── Image handling ── */
  function addImageFiles(files: FileList | null) {
    if (!files) return
    const entries: ImageEntry[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(f => ({ preview: URL.createObjectURL(f), file: f }))
    setForm(f => ({ ...f, images: [...f.images, ...entries] }))
  }

  function removeImage(i: number) {
    setForm(f => {
      const entry = f.images[i]
      // Revoke blob URL to free memory
      if (entry?.file) URL.revokeObjectURL(entry.preview)
      return { ...f, images: f.images.filter((_, idx) => idx !== i) }
    })
  }

  function moveImage(from: number, to: number) {
    setForm(f => {
      const imgs = [...f.images]
      const [item] = imgs.splice(from, 1)
      imgs.splice(to, 0, item)
      return { ...f, images: imgs }
    })
  }

  /* ── Benefits / Ingredients array helpers ── */
  function setArrayItem(key: "benefits" | "ingredients", i: number, val: string) {
    setForm(f => {
      const arr = [...f[key]]
      arr[i] = val
      return { ...f, [key]: arr }
    })
  }

  function addArrayItem(key: "benefits" | "ingredients") {
    setForm(f => ({ ...f, [key]: [...f[key], ""] }))
  }

  function removeArrayItem(key: "benefits" | "ingredients", i: number) {
    setForm(f => ({ ...f, [key]: f[key].filter((_, idx) => idx !== i) }))
  }

  /* ── Concern toggle ── */
  function toggleConcern(c: string) {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(c)
        ? f.concerns.filter(x => x !== c)
        : [...f.concerns, c],
    }))
  }

  /* ── Ingredient toggle ── */
  function toggleIngredientTag(tag: string) {
    setForm(f => ({
      ...f,
      ingredients: f.ingredients.includes(tag)
        ? f.ingredients.filter(x => x !== tag)
        : [...f.ingredients, tag],
    }))
  }

  /* ── Variant helpers ── */
  function addVariant() {
    setForm(f => ({ ...f, variants: [...f.variants, { label: "", price: "" }] }))
  }

  function removeVariant(i: number) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))
  }

  function setVariantField(i: number, key: keyof VariantRow, val: string) {
    setForm(f => {
      const rows = [...f.variants]
      rows[i] = { ...rows[i], [key]: val }
      return { ...f, variants: rows }
    })
  }

  /* ── Submit ── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setUploadError("")

    try {
      // ── Step 1: Upload any new files to Supabase Storage ──────────
      const productSlug =
        product?.id ??
        form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

      const { uploadProductImage } = await import("@/lib/supabase/storage")

      const resolvedImages: string[] = await Promise.all(
        form.images.map(entry => {
          if (entry.file) {
            // New file — upload it
            return uploadProductImage(entry.file, productSlug)
          }
          // Already a real URL — keep as-is
          return Promise.resolve(entry.preview)
        }),
      )

      // ── Step 2: Save product row with resolved URLs ────────────────
      const { saveProduct } = await import("@/lib/supabase/products")

      const payload = {
        id: productSlug,
        name: form.name,
        brand: form.brand,
        tagline: form.tagline,
        description: form.description,
        price: parseFloat(form.price) || 0,
        discountPct: Math.min(100, Math.max(0, parseInt(form.discountPct, 10) || 0)),
        image: resolvedImages[0] ?? "/product-cleanser.png",
        images: resolvedImages.length > 0 ? resolvedImages : undefined,
        category: form.category,
        tag: (form.tag || undefined) as Product["tag"] | undefined,
        benefits: form.benefits.filter(Boolean),
        ingredients: form.ingredients.filter(Boolean),
        concerns: form.concerns,
        stock: parseInt(form.stock) || 0,
        size: form.size || undefined,
        howToUse: form.howToUse || undefined,
        variants:
          form.hasVariants && form.variants.some(v => v.label && v.price)
            ? form.variants
                .filter(v => v.label && v.price)
                .map(v => ({ label: v.label, price: parseFloat(v.price) }))
            : undefined,
      } as Parameters<typeof saveProduct>[0]

      await saveProduct(payload, product?.id)
      const { revalidateProducts } = await import("@/app/actions/revalidate")
      await revalidateProducts()
    } catch (err) {
      console.error("Failed to save product:", err)
      setUploadError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.push("/admin/products")
    }, 1200)
  }

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto">
      {/* Sticky header */}
      <div className="admin-page-header">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex shrink-0 items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]"
          >
            <ArrowLeft className="size-3.5" /> Products
          </button>
          <span className="hidden text-border sm:inline">/</span>
          <h1 className="font-serif text-lg font-medium sm:text-xl truncate">
            {isEdit ? `Edit — ${product.name}` : "Add Product"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="border border-border px-4 py-2 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all",
              saved
                ? "bg-gold text-gold-foreground"
                : saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {saved ? (
              <><Check className="size-3.5" /> Saved!</>
            ) : saving ? (
              <>
                <span className="size-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                {form.images.some(img => img.file) ? "Uploading…" : "Saving…"}
              </>
            ) : (
              <><Save className="size-3.5" /> {isEdit ? "Save Changes" : "Add Product"}</>
            )}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="admin-page-body">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">

            {/* ── LEFT COLUMN ──────────────────────────────────── */}
            <div className="space-y-6">

              {/* Basic info */}
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Basic Information</h2>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Product Name" required>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setField("name", e.target.value)}
                        placeholder="e.g. Hydrating Facial Cleanser"
                        required
                        className="input-field"
                      />
                    </Field>
                    <Field label="Brand" required>
                      <select
                        value={form.brand}
                        onChange={e => setField("brand", e.target.value)}
                        className={inputClass}
                        required
                      >
                        <option value="">Select brand…</option>
                        {brands.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                      {brands.length === 0 && (
                        <p className="mt-1 text-[10px] font-light text-muted-foreground">
                          No brands yet — add some under Admin → Brands.
                        </p>
                      )}
                    </Field>
                  </div>
                  <Field label="Tagline" required hint="Appears below the product name as a one-liner summary">
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={e => setField("tagline", e.target.value)}
                      placeholder="e.g. Gentle daily cleanser for normal to dry skin"
                      required
                      className="input-field"
                    />
                  </Field>
                  <Field label="Description" required hint="3–5 sentences explaining formulation, texture, and key effects">
                    <textarea
                      value={form.description}
                      onChange={e => setField("description", e.target.value)}
                      rows={4}
                      placeholder="Describe the product, its texture, key actives, and what skin types it suits…"
                      required
                      className="input-field resize-none"
                    />
                  </Field>
                </div>
              </section>

              {/* How to Use */}
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">How to Use</h2>
                <Field label="Application instructions" hint="Shown in the 'How to Use' tab on the storefront product page">
                  <textarea
                    value={form.howToUse}
                    onChange={e => setField("howToUse", e.target.value)}
                    rows={4}
                    placeholder="e.g. Apply 3–4 drops to clean, dry skin morning and evening. Follow with moisturiser and SPF in the AM. Start 2–3x per week and increase as tolerated."
                    className="input-field resize-none"
                  />
                </Field>
              </section>

              {/* Benefits */}
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Benefits</h2>
                <p className="mb-3 text-[11px] font-light text-muted-foreground">
                  Listed as checkmarks on the storefront product page.
                </p>
                <div className="space-y-2">
                  {form.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 text-[10px] font-light text-muted-foreground">{i + 1}.</span>
                      <input
                        type="text"
                        value={b}
                        onChange={e => setArrayItem("benefits", i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="input-field flex-1"
                      />
                      {form.benefits.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem("benefits", i)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem("benefits")}
                    className="mt-1 flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-gold hover:underline underline-offset-2"
                  >
                    <Plus className="size-3.5" /> Add Benefit
                  </button>
                </div>
              </section>

              {/* Key Ingredients */}
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Key Ingredients</h2>

                {/* Quick-add from common list */}
                <p className="mb-2 text-[11px] font-light text-muted-foreground">Quick-add from common ingredients:</p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {ALL_INGREDIENTS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleIngredientTag(tag)}
                      className={cn(
                        "border px-2.5 py-1 text-[11px] font-light transition-all",
                        form.ingredients.includes(tag)
                          ? "border-gold bg-lavender text-gold"
                          : "border-border text-muted-foreground hover:border-gold/60",
                      )}
                    >
                      {form.ingredients.includes(tag) ? <span className="mr-1">✓</span> : null}{tag}
                    </button>
                  ))}
                </div>

                {/* Custom ingredient entries */}
                <p className="mb-2 text-[11px] font-light text-muted-foreground">Or add custom ingredients:</p>
                <div className="space-y-2">
                  {form.ingredients.filter(i => !ALL_INGREDIENTS.includes(i)).map((ing, i) => {
                    const realIdx = form.ingredients.indexOf(ing)
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ing}
                          onChange={e => setArrayItem("ingredients", realIdx, e.target.value)}
                          placeholder="Custom ingredient"
                          className="input-field flex-1"
                        />
                        <button type="button" onClick={() => removeArrayItem("ingredients", realIdx)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                          <X className="size-4" />
                        </button>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => addArrayItem("ingredients")}
                    className="mt-1 flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-gold hover:underline underline-offset-2"
                  >
                    <Plus className="size-3.5" /> Add Custom Ingredient
                  </button>
                </div>
              </section>

              {/* Skin Concerns */}
              <section className="border border-border p-6">
                <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.18em]">Skin Concerns</h2>
                <p className="mb-4 text-[11px] font-light text-muted-foreground">
                  Determines which "Shop by Concern" pages this product appears on.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALL_CONCERNS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      className={cn(
                        "border px-3 py-1.5 text-xs font-light transition-all",
                        form.concerns.includes(c)
                          ? "border-gold bg-lavender text-gold"
                          : "border-border text-muted-foreground hover:border-gold/60",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────── */}
            <div className="space-y-6">

              {/* Image gallery */}
              <section className="border border-border p-6">
                <h2 className="mb-1 text-xs font-medium uppercase tracking-[0.18em]">Product Images</h2>
                <p className="mb-4 text-[10px] font-light text-muted-foreground">
                  First image is the primary. Drag to reorder.
                </p>

                {/* Thumbnails grid */}
                {form.images.length > 0 && (
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {form.images.map((entry, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden border border-border bg-secondary">
                        {i === 0 && (
                          <span className="absolute left-1 top-1 z-10 bg-foreground px-1.5 py-0.5 text-[9px] font-medium text-background uppercase tracking-[0.1em]">
                            Primary
                          </span>
                        )}
                        {entry.file && (
                          <span className="absolute right-1 top-1 z-10 bg-gold/90 px-1.5 py-0.5 text-[9px] font-medium text-white uppercase tracking-[0.1em]">
                            New
                          </span>
                        )}
                        {/* Use plain <img> so blob: URLs work without next/image config */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.preview}
                          alt={`Product image ${i + 1}`}
                          className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                        />
                        {/* Overlay actions on hover */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                          {i > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(i, i - 1)}
                              title="Move left"
                              className="flex size-6 items-center justify-center bg-background text-foreground hover:bg-gold hover:text-gold-foreground transition-colors"
                            >
                              <GripVertical className="size-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            title="Remove"
                            className="flex size-6 items-center justify-center bg-background text-foreground hover:bg-destructive hover:text-background transition-colors"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  onDrop={e => { e.preventDefault(); setDragOver(false); addImageFiles(e.dataTransfer.files) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed py-6 transition-colors",
                    dragOver ? "border-gold bg-lavender" : "border-border hover:border-foreground/40",
                  )}
                >
                  <Upload className="size-6 text-muted-foreground" />
                  <p className="text-xs font-light text-muted-foreground text-center">
                    Drop images here or <span className="text-foreground font-medium">click to browse</span>
                  </p>
                  <p className="text-[10px] font-light text-muted-foreground">PNG, JPG, WebP — multiple allowed</p>
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={e => addImageFiles(e.target.files)}
                />
                <p className="text-[10px] font-light text-muted-foreground/70 text-center">
                  Images are uploaded to Supabase Storage on save. Max 5 MB per file.
                </p>
                {uploadError && (
                  <p className="mt-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2">
                    {uploadError}
                  </p>
                )}
              </section>

              {/* Pricing & meta */}
              <section className="border border-border p-6">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em]">Pricing & Details</h2>
                <div className="space-y-4">
                  <Field label="List price (₦)" required>
                    <div className="relative">
                      {!form.price && (
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          ₦
                        </span>
                      )}
                      <input
                        type="number"
                        value={form.price}
                        onChange={e => setField("price", e.target.value)}
                        placeholder={!form.price ? "0" : undefined}
                        min="0"
                        step="100"
                        required
                        className={cn("input-field", !form.price && "pl-8")}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Discount (%)"
                    hint="0–100. Storefront shows list price struck through and the discounted price."
                  >
                    <input
                      type="number"
                      value={form.discountPct}
                      onChange={e => {
                        const n = e.target.value
                        if (n === "") {
                          setField("discountPct", "")
                          return
                        }
                        const v = Math.min(100, Math.max(0, parseInt(n, 10) || 0))
                        setField("discountPct", String(v))
                      }}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="input-field"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Stock quantity" required>
                      <input
                        type="number"
                        value={form.stock}
                        onChange={e => setField("stock", e.target.value)}
                        placeholder="0"
                        min="0"
                        required
                        className="input-field"
                      />
                    </Field>
                    <Field label="Size / Volume" hint="Used when there are no variants">
                      <input
                        type="text"
                        value={form.size}
                        onChange={e => setField("size", e.target.value)}
                        placeholder="e.g. 30ml"
                        disabled={form.hasVariants}
                        className={cn("input-field", form.hasVariants && "opacity-40 cursor-not-allowed")}
                      />
                    </Field>
                  </div>

                  {/* Variants toggle + builder */}
                  <div className="border border-border p-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div
                        role="checkbox"
                        aria-checked={form.hasVariants}
                        tabIndex={0}
                        onClick={() => setField("hasVariants", !form.hasVariants)}
                        onKeyDown={e => e.key === " " && setField("hasVariants", !form.hasVariants)}
                        className={cn(
                          "relative h-5 w-9 rounded-full transition-colors",
                          form.hasVariants ? "bg-foreground" : "bg-muted-foreground/30",
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform",
                          form.hasVariants ? "translate-x-4" : "translate-x-0.5",
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">This product has size variants</p>
                        <p className="text-[11px] font-light text-muted-foreground">
                          e.g. 30ml / 50ml / 100ml each with their own price
                        </p>
                      </div>
                    </label>

                    {form.hasVariants && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 gap-2 mb-1 sm:grid-cols-[1fr_1fr_auto]">
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Label</p>
                          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Price (₦)</p>
                          <span />
                        </div>
                        {form.variants.map((v, i) => (
                          <div key={i} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr_auto]">
                            <input
                              type="text"
                              value={v.label}
                              onChange={e => setVariantField(i, "label", e.target.value)}
                              placeholder="e.g. 30ml"
                              className="input-field"
                            />
                            <input
                              type="number"
                              value={v.price}
                              onChange={e => setVariantField(i, "price", e.target.value)}
                              placeholder="e.g. 5500"
                              min="0"
                              className="input-field"
                            />
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              disabled={form.variants.length === 1}
                              className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addVariant}
                          className="mt-1 flex items-center gap-1.5 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="size-3.5" /> Add variant
                        </button>
                        <p className="text-[10px] font-light text-muted-foreground/60">
                          The base price above will be used as fallback if no variant is selected.
                        </p>
                      </div>
                    )}
                  </div>

                  <Field label="Category" required>
                    <select value={form.category} onChange={e => setField("category", e.target.value)} className="input-field">
                      {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Tag (optional)">
                    <select
                      value={form.tag}
                      onChange={e => setField("tag", e.target.value as FormState["tag"])}
                      className="input-field"
                    >
                      {TAGS.map(t => <option key={t ?? "none"} value={t}>{t || "None"}</option>)}
                    </select>
                  </Field>
                </div>
              </section>

              {/* Storefront preview card */}
              {(form.name || form.price) && (
                <section className="border border-dashed border-border p-5">
                  <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
                  <div className="flex items-center gap-3">
                    {form.images[0] && (
                      <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.images[0].preview} alt="" className="absolute inset-0 h-full w-full object-contain mix-blend-multiply" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[10px] font-light uppercase tracking-[0.15em] text-gold truncate">{form.brand || "Brand"}</p>
                      <p className="text-sm font-medium truncate">{form.name || "Product name"}</p>
                      <p className="text-xs font-light text-muted-foreground truncate">{form.tagline}</p>
                      <p className="mt-1 text-sm font-light">
                        {form.price ? (
                          Number(form.discountPct) > 0 ? (
                            <span className="flex items-baseline gap-2">
                              <span className="text-sm line-through text-muted-foreground">
                                ₦{Number(form.price).toLocaleString()}
                              </span>
                              <span>
                                ₦{Math.round(Number(form.price) * (1 - Math.min(100, Number(form.discountPct)) / 100)).toLocaleString()}
                              </span>
                              <span className="text-xs text-gold">-{form.discountPct}%</span>
                            </span>
                          ) : (
                            `₦${Number(form.price).toLocaleString()}`
                          )
                        ) : (
                          "₦—"
                        )}
                      </p>
                    </div>
                  </div>
                  {form.concerns.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {form.concerns.map(c => (
                        <span key={c} className="border border-border px-2 py-0.5 text-[10px] font-light text-muted-foreground">{c}</span>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Ensure inputs always show a visible border in admin */}
      <style jsx global>{`
        form#product-form .input-field {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 300;
          outline: none;
          transition: border-color 0.15s;
        }
        form#product-form .input-field:focus {
          border-color: var(--foreground);
        }
        form#product-form .input-field.pl-8 {
          padding-left: 2rem;
        }
      `}</style>
    </div>
  )
}
