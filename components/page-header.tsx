export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <section className="border-b border-border bg-secondary">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24 lg:px-8">
        {eyebrow && (
          <p className="animate-fade-up text-[11px] font-light uppercase tracking-[0.28em] text-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 animate-fade-up text-balance font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl animate-fade-up text-pretty text-sm font-light leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
