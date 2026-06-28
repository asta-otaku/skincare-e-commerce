"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Search, Edit2, Trash2, Eye, MoreHorizontal, Package } from "lucide-react"
import { products as initialProducts, formatPrice, type Product } from "@/lib/products"
import { cn } from "@/lib/utils"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  function confirmDelete(id: string) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Products</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">{products.length} products in catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
        >
          <Plus className="size-3.5" /> Add Product
        </Link>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "border px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] transition-all",
                  categoryFilter === cat
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border">
            <Package className="size-10 text-muted-foreground mb-3" />
            <p className="font-serif text-lg font-medium">No products found</p>
            <p className="mt-1 text-sm font-light text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="border border-border">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Price</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Tag</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 shrink-0 overflow-hidden border border-border bg-muted/40">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-xs font-light text-muted-foreground">{product.tagline}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-light text-muted-foreground">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {product.tag ? (
                          <span className={cn(
                            "border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                            product.tag === "Bestseller"
                              ? "border-gold/40 bg-gold/10 text-gold-foreground"
                              : "border-lavender-foreground/20 bg-lavender text-lavender-foreground",
                          )}>
                            {product.tag}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-green-700">
                          <span className="size-1.5 rounded-full bg-green-500" />
                          In Stock
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="View product"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit2 className="size-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(product.id)}
                            className="flex size-8 items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Delete product"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {filtered.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-4">
                  <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-muted/40">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs font-light text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-medium mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="size-4" />
                    </Link>
                    <button type="button" onClick={() => setDeleteId(product.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]" onClick={() => setDeleteId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-medium mb-2">Delete Product</h3>
            <p className="text-sm font-light text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {products.find((p) => p.id === deleteId)?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-border py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 bg-destructive py-3 text-xs font-medium uppercase tracking-[0.15em] text-background hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
