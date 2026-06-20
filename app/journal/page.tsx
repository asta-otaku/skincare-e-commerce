import type { Metadata } from "next"
import Image from "next/image"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Journal — Aurelia",
  description:
    "Rituals, ingredient stories, and skincare wisdom from the Aurelia atelier — thoughtful reading for a more luminous routine.",
}

const featured = {
  category: "The Ritual",
  title: "The Art of the Evening Skincare Ritual",
  excerpt:
    "Slowing down at the end of the day is the most underrated act of self-care. We share how to transform your nightly routine into a sensorial ritual that restores both skin and spirit.",
  image: "/journal-ritual.png",
  readTime: "6 min read",
}

const articles = [
  {
    category: "Ingredients",
    title: "Why 24k Gold Belongs in Your Routine",
    excerpt:
      "Beyond its opulence, gold offers genuine benefits for the skin. Here is the science behind our signature infusion.",
    image: "/journal-ingredients.png",
    readTime: "5 min read",
  },
  {
    category: "Skin Science",
    title: "Building a Barrier-First Routine",
    excerpt:
      "A healthy moisture barrier is the foundation of luminous skin. Learn how to protect and rebuild yours.",
    image: "/journal-glow.png",
    readTime: "7 min read",
  },
  {
    category: "Botanicals",
    title: "The Calming Power of French Lavender",
    excerpt:
      "From soothing redness to balancing tone, discover why this gentle florals earns its place in our toner.",
    image: "/journal-ritual.png",
    readTime: "4 min read",
  },
]

export default function JournalPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Notes on Beauty & Ritual"
        description="Ingredient stories, skincare wisdom, and quiet rituals from the Aurelia atelier."
      />

      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20 lg:px-8">
        {/* Featured article */}
        <article className="group grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[4/3] w-full overflow-hidden border border-border">
            <Image
              src={featured.image || "/placeholder.svg"}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-4 text-[11px] font-light uppercase tracking-[0.2em]">
              <span className="bg-accent px-3 py-1 text-accent-foreground">{featured.category}</span>
              <span className="text-muted-foreground">{featured.readTime}</span>
            </div>
            <h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-5 text-pretty text-base font-light leading-relaxed text-muted-foreground">
              {featured.excerpt}
            </p>
            <a
              href="#"
              className="mt-7 inline-flex items-center gap-2 border-b border-gold pb-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-colors hover:text-gold"
            >
              Read Article
            </a>
          </div>
        </article>

        {/* Article grid */}
        <div className="mt-20 grid gap-x-7 gap-y-12 md:grid-cols-3">
          {articles.map((article) => (
            <article key={article.title} className="group flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-border transition-colors duration-500 group-hover:border-gold/60">
                <Image
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-4 pt-5 text-[10px] font-light uppercase tracking-[0.2em]">
                <span className="text-gold">{article.category}</span>
                <span className="text-muted-foreground">{article.readTime}</span>
              </div>
              <h3 className="mt-3 font-serif text-xl font-medium leading-snug text-foreground">
                {article.title}
              </h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
