"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Upload, X, Plus, ArrowLeft, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products"

type FormState = {
  name: string
  tagline: string
  price: string
  category: string
  tag: string
  bestseller: boolean
  description: string
  benefits: string[]
  ingredients: string
  image: string
}

const CATEGORIES = ["Serums", "Oils", "Moisturizers", "Toners", "Eye Care", "Cleansers"]
const TAGS = ["", "Bestseller", "New", "Limited"]

function toFormState(product?: Product): FormState {
  return {
    name: product?.name ?? "",
    tagline: product?.tagline ?? "",
    price: product ? String(product.price) : "",
    category: product?.category ?? "Serums",
    tag: product?.tag ?? "",
    bestseller: product?.bestseller ?? false,
    description: product?.description ?? "",
    benefits: product?.benefits ?? [""],
    ingredients: product?.ingredients ?? "",
    image: product?.image ?? "",
  }
}

export function AdminProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(toFormState(product))
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(product?.image ?? null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const isEdit = !!product

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleImageFile(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setForm((f) => ({ ...f, image: url }))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) handleImageFile(file)
  }

  function setBenefit(i: number, val: string) {
    setForm((f) => {
      const benefits = [...f.benefits]
      benefits[i] = val
      return { ...f, benefits }
    })
  }

  function addBenefit() {
    setForm((f) => ({ ...f, benefits: [...f.benefits, ""] }))
  }

  function removeBenefit(i: number) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, idx) => idx !== i) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    router.push("/admin/products")
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-light text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.15em]"
          >
            <ArrowLeft className="size-3.5" /> Products
          </button>
          <span className="text-border">/</span>
          <h1 className="font-serif text-xl font-medium">
            {isEdit ? `Edit ${product.name}` : "Add Product"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
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
              saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {saving ? (
              <>
                <span className="size-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                Saving…
              </>
            ) : (
              <><Save className="size-3.5" /> Save Product</>
            )}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit}>
        <div className="px-6 py-6 lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left: main fields */}
            <div className="space-y-6">
              {/* Basic info */}
              <section className="border border-border p-6">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Basic Information</h2>
                <div className="space-y-4">
                  <Field label="Product Name" required>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Radiance Renewal Serum"
                      required
                      className="input-field"
                    />
                  </Field>
                  <Field label="Tagline" required>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={set("tagline")}
                      placeholder="e.g. Vitamin C + Hyaluronic Acid"
                      required
                      className="input-field"
                    />
                  </Field>
                  <Field label="Description" required>
                    <textarea
                      value={form.description}
                      onChange={set("description")}
                      rows={4}
                      placeholder="Describe the product, its key benefits and skin feel…"
                      required
                      className="input-field resize-none"
                    />
                  </Field>
                </div>
              </section>

              {/* Benefits */}
              <section className="border border-border p-6">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Benefits</h2>
                <div className="space-y-2">
                  {form.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-light text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => setBenefit(i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="input-field flex-1"
                      />
                      {form.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(i)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="mt-1 flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-gold hover:underline underline-offset-2"
                  >
                    <Plus className="size-3.5" /> Add Benefit
                  </button>
                </div>
              </section>

              {/* Ingredients */}
              <section className="border border-border p-6">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Key Ingredients</h2>
                <Field label="Ingredients (comma-separated)">
                  <input
                    type="text"
                    value={form.ingredients}
                    onChange={set("ingredients")}
                    placeholder="e.g. 15% Vitamin C, Hyaluronic Acid, Ferulic Acid"
                    className="input-field"
                  />
                </Field>
              </section>
            </div>

            {/* Right: image + meta */}
            <div className="space-y-6">
              {/* Image upload */}
              <section className="border border-border p-6">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Product Image</h2>

                {/* Preview */}
                {preview ? (
                  <div className="relative aspect-4/5 overflow-hidden border border-border bg-muted/40 mb-3">
                    <Image src={preview} alt="Product preview" fill sizes="320px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreview(null); setForm((f) => ({ ...f, image: "" })) }}
                      className="absolute right-2 top-2 flex size-7 items-center justify-center bg-background/90 text-foreground hover:bg-destructive hover:text-background transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileRef.current?.click()}
                    className={cn(
                      "mb-3 flex aspect-4/5 cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors",
                      dragOver ? "border-gold bg-gold/5" : "border-border hover:border-foreground/50",
                    )}
                  >
                    <Upload className="size-8 text-muted-foreground mb-3" />
                    <p className="text-xs font-medium">Drop image here</p>
                    <p className="mt-1 text-[10px] font-light text-muted-foreground">or click to browse</p>
                    <p className="mt-2 text-[10px] font-light text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border border-border py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors"
                >
                  {preview ? "Change Image" : "Upload Image"}
                </button>
                <p className="mt-2 text-[10px] font-light text-muted-foreground text-center">
                  S3 upload will be configured in a later release.
                </p>
              </section>

              {/* Pricing & meta */}
              <section className="border border-border p-6">
                <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em]">Pricing &amp; Details</h2>
                <div className="space-y-4">
                  <Field label="Price (USD)" required>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={form.price}
                        onChange={set("price")}
                        placeholder="0"
                        min="0"
                        step="1"
                        required
                        className="input-field pl-8"
                      />
                    </div>
                  </Field>

                  <Field label="Category" required>
                    <select value={form.category} onChange={set("category")} className="input-field">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>

                  <Field label="Tag (optional)">
                    <select value={form.tag} onChange={set("tag")} className="input-field">
                      {TAGS.map((t) => <option key={t} value={t}>{t || "None"}</option>)}
                    </select>
                  </Field>

                  <label className="flex cursor-pointer items-center gap-3">
                    <div
                      onClick={() => setForm((f) => ({ ...f, bestseller: !f.bestseller }))}
                      className={cn(
                        "flex size-4 items-center justify-center border transition-all",
                        form.bestseller ? "border-gold bg-gold" : "border-border",
                      )}
                    >
                      {form.bestseller && <span className="block size-2 bg-gold-foreground" />}
                    </div>
                    <span className="text-xs font-light">Mark as Bestseller</span>
                  </label>
                </div>
              </section>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
