import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { journals } from "@/lib/journals"
import { ArrowRight, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Skin Blog — HAYDA SKINCo.",
  description:
    "Skincare tips, ingredient deep-dives, and product guides from the HAYDA SKINCo. team — everything you need for a better routine.",
}

const published = journals.filter(j => j.status === "published")
const [featured, ...rest] = published

export default function JournalPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Notes on Beauty & Ritual"
        description="Skincare guides, ingredient explainers, and routine tips from the HAYDA SKINCo. team."
      />

      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">

        {/* Featured article */}
        {featured && (
          <article className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
            <Link
              href={`/journal/${featured.slug}`}
              className="relative aspect-[4/3] w-full overflow-hidden border border-border block"
            >
              <Image
                src={featured.image || "/placeholder.svg"}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </Link>
            <div>
              <div className="flex items-center gap-4 text-[11px] font-light uppercase tracking-[0.2em]">
                <span className="bg-accent px-3 py-1 text-accent-foreground">{featured.category}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" /> {featured.readTime} min read
                </span>
              </div>
              <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
                {featured.title}
              </h2>
              <p className="mt-5 text-pretty text-base font-light leading-relaxed text-muted-foreground">
                {featured.excerpt}
              </p>
              <div className="mt-3 text-[11px] font-light text-muted-foreground">
                By {featured.author} · {new Date(featured.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <Link
                href={`/journal/${featured.slug}`}
                className="mt-7 inline-flex items-center gap-2 border-b border-gold pb-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold"
              >
                Read Article <ArrowRight className="size-3" />
              </Link>
            </div>
          </article>
        )}

        {/* Article grid */}
        {rest.length > 0 && (
          <div className="mt-20 grid gap-x-7 gap-y-12 md:grid-cols-3">
            {rest.map(article => (
              <article key={article.id} className="group flex flex-col">
                <Link
                  href={`/journal/${article.slug}`}
                  className="relative aspect-[4/3] w-full overflow-hidden border border-border transition-colors duration-500 group-hover:border-gold/60 block"
                >
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </Link>
                <div className="flex items-center gap-4 pt-5 text-[10px] font-light uppercase tracking-[0.2em]">
                  <span className="text-gold">{article.category}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3" /> {article.readTime} min
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-medium leading-snug text-foreground group-hover:text-gold transition-colors">
                  <Link href={`/journal/${article.slug}`}>{article.title}</Link>
                </h3>
                <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-muted-foreground">
                  {article.excerpt}
                </p>
                <Link
                  href={`/journal/${article.slug}`}
                  className="mt-4 flex items-center gap-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors"
                >
                  Read more <ArrowRight className="size-3" />
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* All drafts hidden — show CTA if nothing published */}
        {published.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl font-medium text-muted-foreground">New articles coming soon.</p>
          </div>
        )}
      </div>
    </>
  )
}
