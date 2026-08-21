"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, Edit2, Trash2, Eye, Package, RefreshCw } from "lucide-react"
import { formatPrice, productTags, type Product } from "@/lib/products"
import { getAdminProductsPage, deleteProduct } from "@/lib/supabase/products"
import { getCategoryTree } from "@/lib/supabase/categories"
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin-pagination"
import { cn } from "@/lib/utils"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [categoryOptions, setCategoryOptions] = useState<string[]>(["All"])
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { setPage(1) }, [searchDebounced, categoryFilter])

  useEffect(() => {
    getCategoryTree().then(tree => {
      const names = tree.flatMap(s => s.categories.map(c => c.name))
      setCategoryOptions(["All", ...names])
    })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    const { products: rows, total: count } = await getAdminProductsPage({
      search: searchDebounced,
      category: categoryFilter,
      page,
      pageSize: ADMIN_PAGE_SIZE,
    })
    setProducts(rows)
    setTotal(count)
    setLoading(false)
  }, [searchDebounced, categoryFilter, page])

  useEffect(() => { void load() }, [load])

  async function confirmDelete(id: string) {
    setDeleting(true)
    try {
      await deleteProduct(id)
      await load()
    } catch (err) {
      console.error("Delete failed:", err)
    }
    setDeleting(false)
    setDeleteId(null)
  }

  function stockLabel(stock: number) {
    if (stock === 0) return { label: "Out of Stock", className: "text-destructive", dot: "bg-destructive" }
    if (stock <= 5) return { label: "Low Stock", className: "text-amber-600", dot: "bg-amber-500" }
    return { label: "In Stock", className: "text-green-700", dot: "bg-green-500" }
  }

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-auto">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="font-serif text-2xl font-medium">Products</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${total} product${total !== 1 ? "s" : ""} in catalogue`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Refresh"
            className="flex size-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            <Plus className="size-3.5" /> Add Product
          </Link>
        </div>
      </div>

      <div className="admin-page-body">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name, brand, category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-border bg-background px-3 py-2.5 text-xs font-light outline-none focus:border-foreground max-w-xs"
          >
            {categoryOptions.map(cat => (
              <option key={cat} value={cat}>{cat === "All" ? "All categories" : cat}</option>
            ))}
          </select>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="border border-border divide-y divide-border">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="size-12 shrink-0 bg-muted/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-muted/50 animate-pulse" />
                  <div className="h-2.5 w-32 bg-muted/30 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border">
            <Package className="size-10 text-muted-foreground mb-3" />
            <p className="font-serif text-lg font-medium">No products found</p>
            <p className="mt-1 text-sm font-light text-muted-foreground">
              {search || categoryFilter !== "All" ? "Try adjusting your search or filters." : "Add your first product to get started."}
            </p>
          </div>
        ) : (
          <div className="border border-border">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary">
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Product</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Category</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Price</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Tag</th>
                    <th className="px-6 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Stock</th>
                    <th className="px-6 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map(product => {
                    const stock = stockLabel(product.stock)
                    return (
                      <tr key={product.id} className="hover:bg-secondary transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden border border-border bg-muted">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs font-light text-muted-foreground">{product.brand}</p>
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
                          {productTags(product).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {productTags(product).map(t => (
                                <span
                                  key={t}
                                  className={cn(
                                    "border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]",
                                    t === "Bestseller"
                                      ? "border-gold/40 bg-lavender text-gold"
                                      : t === "Sale"
                                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                                        : "border-border text-muted-foreground",
                                  )}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("flex items-center gap-1.5 text-[10px] font-medium", stock.className)}>
                            <span className={cn("size-1.5 rounded-full", stock.dot)} />
                            {stock.label}
                            <span className="text-muted-foreground font-light">({product.stock})</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/product/${product.id}`}
                              target="_blank"
                              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="View on storefront"
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
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-border md:hidden">
              {products.map(product => {
                const stock = stockLabel(product.stock)
                return (
                  <div key={product.id} className="flex items-center gap-3 p-4">
                    <div className="relative size-14 shrink-0 overflow-hidden border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs font-light text-muted-foreground">{product.category}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-medium">{formatPrice(product.price)}</p>
                        <span className={cn("text-[10px] font-medium", stock.className)}>{stock.label}</span>
                      </div>
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
                )
              })}
            </div>
          </div>
        )}

        <AdminPagination
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          className="mt-6"
        />
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]" onClick={() => !deleting && setDeleteId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-medium mb-2">Delete Product</h3>
            <p className="text-sm font-light text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {products.find(p => p.id === deleteId)?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 border border-border py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteId)}
                disabled={deleting}
                className="flex-1 bg-destructive py-3 text-xs font-medium uppercase tracking-[0.15em] text-background hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <><span className="size-3.5 rounded-full border-2 border-background/30 border-t-background animate-spin" /> Deleting…</>
                ) : "Delete"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
