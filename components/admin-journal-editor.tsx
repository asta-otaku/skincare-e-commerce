"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Save, Eye, Upload, Trash2, Plus, X,
  Bold, Italic, Heading2, List, Quote, Minus
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Journal } from "@/lib/journals"

type FormState = {
  title: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  image: string
  readTime: string
  status: "published" | "draft"
  tags: string[]
}

const CATEGORIES = ["Rituals", "Ingredients", "Skin Science", "Lifestyle", "Sustainability", "Behind the Brand"]

function toFormState(journal?: Journal): FormState {
  return {
    title: journal?.title ?? "",
    excerpt: journal?.excerpt ?? "",
    content: journal?.content ?? "",
    category: journal?.category ?? "Rituals",
    author: journal?.author ?? "Aurelia Editorial",
    publishedAt: journal?.publishedAt ?? new Date().toISOString().split("T")[0],
    image: journal?.image ?? "",
    readTime: journal ? String(journal.readTime) : "5",
    status: journal?.status ?? "draft",
    tags: journal?.tags ?? [],
  }
}

export function AdminJournalEditor({ journal }: { journal?: Journal }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(toFormState(journal))
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(journal?.image ?? null)
  const [dragOver, setDragOver] = useState(false)
  const [newTag, setNewTag] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isEdit = !!journal

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  function handleImageFile(file: File) {
    const url = URL.createObjectURL(file)
    setImagePreview(url)
    setForm((f) => ({ ...f, image: url }))
  }

  function insertMarkdown(before: string, after = "") {
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = form.content.slice(start, end)
    const newContent =
      form.content.slice(0, start) + before + selected + after + form.content.slice(end)
    setForm((f) => ({ ...f, content: newContent }))
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  function addTag() {
    const tag = newTag.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }))
    }
    setNewTag("")
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  async function handleSave(status: "published" | "draft") {
    setSaving(true)
    setForm((f) => ({ ...f, status }))
    await new Promise((r) => setTimeout(r, 800))
    router.push("/admin/journals")
  }

  /* ── Markdown preview renderer (basic) ── */
  function renderPreview(md: string) {
    return md
      .replace(/^## (.+)$/gm, "<h2 class='font-serif text-2xl font-medium mt-8 mb-3'>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3 class='font-serif text-lg font-medium mt-6 mb-2'>$1</h3>")
      .replace(/\*\*(.+?)\*\*/g, "<strong class='font-medium'>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em class='italic'>$1</em>")
      .replace(/^> (.+)$/gm, "<blockquote class='border-l-2 border-gold pl-4 italic text-muted-foreground my-4'>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li class='ml-4 font-light'>$1</li>")
      .replace(/\n\n/g, "</p><p class='mb-4 font-light leading-relaxed'>")
      .replace(/^(?!<[hbli])(.+)$/gm, "<p class='mb-4 font-light leading-relaxed'>$1</p>")
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
            <ArrowLeft className="size-3.5" /> Journal
          </button>
          <span className="text-border">/</span>
          <h1 className="font-serif text-xl font-medium">
            {isEdit ? "Edit Article" : "Write Article"}
          </h1>
          {form.status === "draft" && (
            <span className="border border-border px-2 py-0.5 text-[10px] font-light uppercase tracking-[0.12em] text-muted-foreground">
              Draft
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className={cn(
              "hidden sm:flex items-center gap-2 border px-4 py-2 text-xs font-light uppercase tracking-[0.15em] transition-colors",
              preview ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
            )}
          >
            <Eye className="size-3.5" /> {preview ? "Edit" : "Preview"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="border border-border px-4 py-2 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all",
              saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
            )}
          >
            {saving ? (
              <span className="size-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Publish
          </button>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main editor */}
          <div className="space-y-5">
            {/* Title */}
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              placeholder="Article title…"
              className="w-full border-0 border-b border-border bg-transparent pb-4 font-serif text-3xl font-medium outline-none placeholder:text-muted-foreground/40 focus:border-foreground transition-colors"
            />

            {/* Excerpt */}
            <textarea
              value={form.excerpt}
              onChange={set("excerpt")}
              placeholder="Write a brief excerpt that appears in listings…"
              rows={2}
              className="w-full resize-none border-0 border-b border-border bg-transparent pb-4 text-sm font-light text-muted-foreground outline-none placeholder:text-muted-foreground/40 focus:border-foreground transition-colors"
            />

            {/* Toolbar + Editor */}
            <div className="border border-border">
              {/* Markdown toolbar */}
              {!preview && (
                <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-3 py-2">
                  <ToolbarBtn onClick={() => insertMarkdown("**", "**")} title="Bold">
                    <Bold className="size-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => insertMarkdown("*", "*")} title="Italic">
                    <Italic className="size-3.5" />
                  </ToolbarBtn>
                  <Divider />
                  <ToolbarBtn onClick={() => insertMarkdown("## ")} title="Heading">
                    <Heading2 className="size-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => insertMarkdown("- ")} title="List item">
                    <List className="size-3.5" />
                  </ToolbarBtn>
                  <ToolbarBtn onClick={() => insertMarkdown("> ")} title="Quote">
                    <Quote className="size-3.5" />
                  </ToolbarBtn>
                  <Divider />
                  <ToolbarBtn onClick={() => insertMarkdown("\n---\n")} title="Divider">
                    <Minus className="size-3.5" />
                  </ToolbarBtn>
                  <span className="ml-auto text-[10px] font-light text-muted-foreground">Markdown supported</span>
                </div>
              )}

              {preview ? (
                <div
                  className="min-h-96 p-6 prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderPreview(form.content) }}
                />
              ) : (
                <textarea
                  ref={textareaRef}
                  value={form.content}
                  onChange={set("content")}
                  placeholder="Write your article here… Markdown is supported.

## Start with a heading

Use **bold** or *italic* for emphasis.

> Add a blockquote for notable quotes.

- Use bullet points for lists"
                  className="min-h-96 w-full resize-y bg-transparent p-6 font-mono text-sm font-light leading-relaxed outline-none placeholder:text-muted-foreground/30"
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Cover image */}
            <section className="border border-border p-5">
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em]">Cover Image</h3>
              {imagePreview ? (
                <div className="relative aspect-video overflow-hidden border border-border bg-muted/40 mb-3">
                  <Image src={imagePreview} alt="Cover" fill sizes="300px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setForm((f) => ({ ...f, image: "" })) }}
                    className="absolute right-2 top-2 flex size-6 items-center justify-center bg-background/90 text-foreground hover:bg-destructive hover:text-background transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ) : (
                <div
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleImageFile(f) }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "mb-3 flex aspect-video cursor-pointer flex-col items-center justify-center border-2 border-dashed transition-colors",
                    dragOver ? "border-gold bg-gold/5" : "border-border hover:border-foreground/50",
                  )}
                >
                  <Upload className="size-6 text-muted-foreground mb-2" />
                  <p className="text-[10px] font-light text-muted-foreground">Drop or click to upload</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }} />
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full border border-border py-2 text-[11px] font-light uppercase tracking-[0.12em] hover:border-foreground transition-colors">
                {imagePreview ? "Change" : "Upload"} Image
              </button>
            </section>

            {/* Metadata */}
            <section className="border border-border p-5 space-y-4">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.18em]">Article Details</h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Category</label>
                <select value={form.category} onChange={set("category")} className="input-field text-sm py-2">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Author</label>
                <input type="text" value={form.author} onChange={set("author")} className="input-field text-sm py-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Publish Date</label>
                  <input type="date" value={form.publishedAt} onChange={set("publishedAt")} className="input-field text-sm py-2" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Read Time (min)</label>
                  <input type="number" value={form.readTime} onChange={set("readTime")} min="1" className="input-field text-sm py-2" />
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">Tags</label>
                <div className="flex gap-1.5 flex-wrap mb-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-light">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-destructive">
                        <X className="size-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                    placeholder="Add tag…"
                    className="input-field flex-1 py-2 text-sm"
                  />
                  <button type="button" onClick={addTag} className="border border-border px-3 hover:border-foreground transition-colors">
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="flex size-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-4 w-px bg-border" />
}
