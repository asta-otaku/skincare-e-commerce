import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { getPublishedJournals } from "@/lib/supabase/journals"
import { ArrowRight, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Skin Blog — HAYDA SKINCo.",
  description:
    "Skincare tips, ingredient deep-dives, and product guides from the HAYDA SKINCo. team — everything you need for a better routine.",
}

/** Revalidate journal listing every 60s; admin saves also call revalidatePath. */
export const revalidate = 60

function formatPublished(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}

export default async function JournalPage() {
  const publishedJournals = await getPublishedJournals()
  const [featured, ...rest] = publishedJournals
  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Notes on Beauty & Ritual"
        description="Skincare guides, ingredient explainers, and routine tips from the HAYDA SKINCo. team."
      />

      <div className="mx-auto max-w-5xl px-5 py-16 md:py-20 lg:px-8">

        {featured && (
          <article className="group">
            <p className="text-[11px] font-light uppercase tracking-[0.28em] text-gold">Featured</p>
            <div className="mt-6 grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
              <Link
                href={`/journal/${featured.slug}`}
                className="relative block aspect-[4/3] w-full overflow-hidden border border-border lg:col-span-7 lg:aspect-[5/4]"
              >
                <Image
                  src={featured.image || "/placeholder.svg"}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </Link>
              <div className="lg:col-span-5">
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-light uppercase tracking-[0.2em]">
                  <span className="bg-accent px-3 py-1 text-accent-foreground">{featured.category}</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-3" /> {featured.readTime} min read
                  </span>
                </div>
                <h2 className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.12] text-foreground md:text-5xl">
                  <Link href={`/journal/${featured.slug}`} className="transition-colors hover:text-gold">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-5 text-pretty text-base font-light leading-relaxed text-muted-foreground">
                  {featured.excerpt}
                </p>
                <p className="mt-4 text-[11px] font-light text-muted-foreground">
                  By {featured.author} · {formatPublished(featured.publishedAt)}
                </p>
                <Link
                  href={`/journal/${featured.slug}`}
                  className="mt-7 inline-flex items-center gap-2 border-b border-gold pb-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold"
                >
                  Read Article <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </article>
        )}

        {rest.length > 0 && (
          <section className="mt-16 border-t border-border md:mt-20">
            <h2 className="pt-10 text-[11px] font-light uppercase tracking-[0.28em] text-muted-foreground">
              More stories
            </h2>
            <ul className="mt-2 divide-y divide-border border-b border-border">
              {rest.map(article => (
                <li key={article.id}>
                  <Link
                    href={`/journal/${article.slug}`}
                    className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden border border-border bg-muted">
                      <Image
                        src={article.image || "/placeholder.svg"}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">
                        {article.category}
                      </span>
                      <span className="mt-1 block text-balance font-serif text-xl font-medium leading-snug text-foreground transition-colors group-hover:text-gold">
                        {article.title}
                      </span>
                      <span className="mt-2 line-clamp-2 hidden text-sm font-light leading-relaxed text-muted-foreground sm:block">
                        {article.excerpt}
                      </span>
                      <span className="mt-2 block text-[11px] font-light text-muted-foreground">
                        {formatPublished(article.publishedAt)} · {article.readTime} min
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {publishedJournals.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl font-medium text-muted-foreground">New articles coming soon.</p>
          </div>
        )}
      </div>
    </>
  )
}
