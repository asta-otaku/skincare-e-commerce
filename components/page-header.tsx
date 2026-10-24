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
      <div className="mx-auto w-full min-w-0 max-w-3xl px-5 py-14 text-center md:py-20 lg:px-8">
        {eyebrow && (
          <p className="animate-fade-up text-[11px] font-light uppercase tracking-[0.28em] break-words text-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="mx-auto mt-4 w-full min-w-0 max-w-full animate-fade-up text-wrap font-serif text-4xl font-medium leading-[1.15] break-words whitespace-normal text-foreground md:text-5xl md:leading-[1.12]">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl animate-fade-up text-sm font-light leading-relaxed break-words whitespace-normal text-muted-foreground md:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
