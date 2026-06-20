import Link from "next/link"
import { products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

export function FeaturedProducts() {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-5 py-20 md:py-28 lg:px-8">
      <div className="mb-14 flex flex-col items-center text-center">
        <p className="text-xs font-light uppercase tracking-[0.3em] text-gold">Curated Edit</p>
        <h2 className="mt-4 text-balance font-serif text-4xl font-light text-foreground md:text-5xl">
          Featured Essentials
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground">
          A considered collection of our most-loved formulations — each one a small act of
          devotion to your skin.
        </p>
        <span className="mt-7 h-px w-16 bg-gold" />
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:gap-x-7 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      <div className="mt-16 flex justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 border border-foreground px-9 py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-foreground transition-all duration-300 hover:border-gold hover:bg-gold hover:text-gold-foreground"
        >
          View All Products
        </Link>
      </div>
    </section>
  )
}
