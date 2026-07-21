import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, User, Tag } from "lucide-react"
import { getJournalBySlug, getPublishedJournals, getPublishedSlugs } from "@/lib/supabase/journals"

/** Revalidate article pages every 60s; admin saves also call revalidatePath. */
export const revalidate = 60

/* ─── Static params ─────────────────────────────────────────── */
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await getJournalBySlug(slug)
  if (!article) return {}
  return {
    title: `${article.title} — HAYDA Skin Blog`,
    description: article.excerpt,
  }
}

/* ─── Markdown renderer ─────────────────────────────────────── */
function renderInline(text: string): React.ReactNode {
  // Bold + italic → **text** and *text*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-medium text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    }
    return part
  })
}

function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/)

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (!trimmed) return null

        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="font-serif text-2xl font-medium text-foreground mt-10 mb-2 first:mt-0">
              {trimmed.slice(3)}
            </h2>
          )
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={i} className="font-serif text-3xl font-medium text-foreground">
              {trimmed.slice(2)}
            </h1>
          )
        }

        // Multi-line block — preserve line breaks as <br>
        const lines = trimmed.split("\n")
        return (
          <p key={i} className="text-base font-light leading-[1.9] text-muted-foreground">
            {lines.map((line, j) => (
              <span key={j}>
                {renderInline(line)}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

/* ─── Share buttons (client component) ─────────────────────── */
import { ShareButtons } from "./share-buttons"

/* ─── Page ──────────────────────────────────────────────────── */
export default async function JournalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [article, allPublished] = await Promise.all([
    getJournalBySlug(slug),
    getPublishedJournals(),
  ])
  if (!article || article.status !== "published") notFound()

  const related = allPublished
    .filter(j => j.id !== article.id && j.category === article.category)
    .slice(0, 2)

  const otherRelated = related.length < 2
    ? allPublished.filter(j => j.id !== article.id && !related.find(r => r.id === j.id)).slice(0, 2 - related.length)
    : []

  const suggestions = [...related, ...otherRelated]

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 md:py-14 lg:px-8">

      {/* Back */}
      <Link
        href="/journal"
        className="mb-8 flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> The Journal
      </Link>

      <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16 xl:gap-20">

        {/* Main article */}
        <article>
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-light uppercase tracking-[0.2em]">
            <span className="bg-accent px-3 py-1 text-accent-foreground">{article.category}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3" /> {article.readTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-5 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {/* Byline */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-xs font-light text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> {article.author}
            </span>
            <span>
              {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Hero image */}
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden border border-border">
            <Image
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </div>

          {/* Excerpt */}
          <p className="mt-8 border-l-2 border-gold pl-5 font-serif text-lg font-light italic leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>

          {/* Body */}
          <div className="mt-8">
            <MarkdownContent content={article.content} />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <Tag className="size-3.5 text-muted-foreground" />
              {article.tags.map(tag => (
                <span key={tag} className="border border-border px-3 py-1 text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <ShareButtons title={article.title} slug={article.slug} />
        </article>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* About the author */}
          <div className="border border-border p-5">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Written by</p>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {article.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author}</p>
                <p className="text-xs font-light text-muted-foreground">HAYDA SKINCo.</p>
              </div>
            </div>
          </div>

          {/* Read more */}
          {suggestions.length > 0 && (
            <div>
              <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">More to Read</p>
              <div className="space-y-5">
                {suggestions.map(s => (
                  <Link key={s.id} href={`/journal/${s.slug}`} className="group flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden border border-border bg-muted group-hover:border-gold/60 transition-colors">
                      <Image src={s.image || "/placeholder.svg"} alt={s.title} fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-light uppercase tracking-[0.15em] text-gold">{s.category}</p>
                      <p className="mt-0.5 text-xs font-medium leading-snug group-hover:text-gold transition-colors line-clamp-2">{s.title}</p>
                      <p className="mt-1 text-[10px] font-light text-muted-foreground">{s.readTime} min read</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="border border-border bg-secondary p-5">
            <p className="font-serif text-lg font-medium leading-snug">Explore our collection</p>
            <p className="mt-1.5 text-xs font-light text-muted-foreground leading-relaxed">
              Discover the products behind the rituals described in our journal.
            </p>
            <Link
              href="/shop"
              className="mt-4 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-foreground hover:text-gold transition-colors"
            >
              Shop Now <ArrowLeft className="size-3 rotate-180" />
            </Link>
          </div>
        </aside>

      </div>

      {/* Bottom nav */}
      <div className="mt-16 border-t border-border pt-8 text-center">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 border border-border px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] hover:border-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <ArrowLeft className="size-3.5" /> Back to Journal
        </Link>
      </div>

    </div>
  )
}
