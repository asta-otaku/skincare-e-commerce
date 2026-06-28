"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, Edit2, Trash2, Check, X, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

type Review = {
  id: string
  productId: string
  productName: string
  productImage: string
  productCategory: string
  rating: number
  title: string
  body: string
  date: string
  helpful: number
  verified: boolean
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "r1",
    productId: "radiance-serum",
    productName: "Radiance Renewal Serum",
    productImage: "/product-serum.png",
    productCategory: "Serums",
    rating: 5,
    title: "The most beautiful serum I've ever used",
    body: "I've been using this for three months and my skin has never looked better. The glow is real — friends keep asking what I'm doing differently. The texture is featherlight, absorbs immediately, and layers perfectly under moisturiser.",
    date: "2024-11-20",
    helpful: 24,
    verified: true,
  },
  {
    id: "r2",
    productId: "gold-oil",
    productName: "Gold Infusion Face Oil",
    productImage: "/product-oil.png",
    productCategory: "Oils",
    rating: 5,
    title: "Worth every penny",
    body: "Absolutely stunning. I press two drops into damp skin every evening and wake up glowing. The formula doesn't feel greasy at all — it absorbs within seconds. A ritual I genuinely look forward to.",
    date: "2024-10-15",
    helpful: 18,
    verified: true,
  },
]

function StarDisplay({ rating, interactive, onChange }: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const display = interactive ? (hovered || rating) : rating
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={cn(
            "size-4 transition-colors",
            display >= i ? "fill-gold text-gold" : "fill-muted text-border",
            interactive && "cursor-pointer",
          )}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  )
}

export default function AccountReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ rating: 0, title: "", body: "" })

  function startEdit(review: Review) {
    setEditingId(review.id)
    setEditForm({ rating: review.rating, title: review.title, body: review.body })
  }

  function saveEdit() {
    setReviews(prev => prev.map(r =>
      r.id === editingId
        ? { ...r, rating: editForm.rating, title: editForm.title, body: editForm.body }
        : r,
    ))
    setEditingId(null)
  }

  function confirmDelete(id: string) {
    setReviews(prev => prev.filter(r => r.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium">Your Reviews</h2>
        <p className="mt-1 text-sm font-light text-muted-foreground">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""} written
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border py-20 text-center">
          <MessageSquare className="size-10 text-muted-foreground mb-4" />
          <p className="font-serif text-xl font-medium">No reviews yet</p>
          <p className="mt-2 text-sm font-light text-muted-foreground max-w-xs">
            Purchase a product and share your experience with the community.
          </p>
          <Link href="/shop" className="mt-6 border border-foreground px-8 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-colors">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border border-border">
              {/* Product row */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3 bg-muted/20">
                <div className="relative size-10 shrink-0 overflow-hidden border border-border bg-muted/40">
                  <Image src={review.productImage} alt={review.productName} fill sizes="40px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${review.productId}`} className="text-sm font-medium hover:text-gold transition-colors">
                    {review.productName}
                  </Link>
                  <p className="text-[10px] font-light uppercase tracking-[0.18em] text-gold">{review.productCategory}</p>
                </div>
                {review.verified && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-light text-green-700">
                    <Check className="size-3" /> Verified Purchase
                  </span>
                )}
                {/* Actions */}
                {editingId !== review.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(review)}
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Edit review"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(review.id)}
                      className="flex size-7 items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete review"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review content / edit form */}
              <div className="px-5 py-4">
                {editingId === review.id ? (
                  <div className="space-y-3">
                    <div>
                      <p className="mb-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Rating</p>
                      <StarDisplay rating={editForm.rating} interactive onChange={r => setEditForm(f => ({ ...f, rating: r }))} />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Title</p>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">Review</p>
                      <textarea
                        value={editForm.body}
                        onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                        rows={3}
                        className="w-full resize-none border border-border bg-background px-4 py-2.5 text-sm font-light outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="flex items-center gap-1.5 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
                      >
                        <Check className="size-3.5" /> Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1.5 border border-border px-5 py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors"
                      >
                        <X className="size-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-[10px] font-light text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-1">{review.title}</p>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{review.body}</p>
                    <p className="mt-3 text-[11px] font-light text-muted-foreground">
                      {review.helpful} people found this helpful
                    </p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <>
          <div className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px]" onClick={() => setDeleteId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-medium mb-2">Delete Review</h3>
            <p className="text-sm font-light text-muted-foreground mb-6">
              Are you sure you want to delete this review? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="flex-1 border border-border py-3 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors">Cancel</button>
              <button type="button" onClick={() => confirmDelete(deleteId)} className="flex-1 bg-destructive py-3 text-xs font-medium uppercase tracking-[0.15em] text-background hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
