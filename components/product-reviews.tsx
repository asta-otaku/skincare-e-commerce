"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Star, ThumbsUp, User, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserAuth } from "@/components/user-auth-provider"
import {
  getReviewsForProduct,
  markReviewHelpful,
  submitReview,
  type ReviewRow,
} from "@/lib/supabase/reviews"

function StarRating({
  rating,
  interactive,
  onChange,
  size = "default",
}: {
  rating: number
  interactive?: boolean
  onChange?: (r: number) => void
  size?: "default" | "sm" | "lg"
}) {
  const [hovered, setHovered] = useState(0)
  const display = interactive ? (hovered || rating) : rating
  const cls = size === "sm" ? "size-3.5" : size === "lg" ? "size-6" : "size-4"

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            cls,
            "transition-colors",
            display >= i ? "fill-gold text-gold" : "fill-muted text-border",
            interactive && "cursor-pointer hover:scale-110 transition-transform",
          )}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  )
}

export function ProductReviews({ productId }: { productId: string }) {
  const { session } = useUserAuth()
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating_high" | "rating_low">("recent")
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState("")
  const [formBody, setFormBody] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function load() {
    setLoading(true)
    const data = await getReviewsForProduct(productId)
    setReviews(data)
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rv) => rv.rating === r).length,
  }))

  const sorted = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === "helpful") return b.helpful - a.helpful
      if (sortBy === "rating_high") return b.rating - a.rating
      if (sortBy === "rating_low") return a.rating - b.rating
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [reviews, sortBy])

  async function markHelpful(id: string) {
    if (helpfulClicked.has(id)) return
    if (!session) return
    const res = await markReviewHelpful(id)
    if (res.ok) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpful: res.helpful ?? r.helpful + 1 } : r)),
      )
      setHelpfulClicked((prev) => new Set([...prev, id]))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRating || !session) return
    setSubmitting(true)
    setFormError("")
    const res = await submitReview({
      productId,
      rating: formRating,
      title: formTitle,
      body: formBody,
    })
    setSubmitting(false)
    if (!res.ok) {
      setFormError(res.message ?? "Could not submit review.")
      return
    }
    setSubmitted(true)
    setShowForm(false)
    setFormRating(0)
    setFormTitle("")
    setFormBody("")
    await load()
  }

  return (
    <section className="border-t border-border mt-16 pt-12 mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        <div className="shrink-0 text-center md:text-left">
          <p className="font-serif text-6xl font-medium leading-none">
            {loading ? "—" : avgRating.toFixed(1)}
          </p>
          <StarRating rating={Math.round(avgRating)} size="lg" />
          <p className="mt-2 text-sm font-light text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {ratingCounts.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-3 text-[11px] font-light text-muted-foreground">{star}</span>
              <Star className="size-3 fill-gold text-gold shrink-0" />
              <div className="flex-1 h-1.5 bg-muted overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-4 text-[11px] font-light text-muted-foreground text-right">{count}</span>
            </div>
          ))}
        </div>

        <div className="shrink-0">
          {submitted && (
            <div className="mb-3 flex items-center gap-2 text-sm font-light text-green-700">
              <Check className="size-4" /> Your review has been submitted.
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="border border-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-colors hover:bg-foreground hover:text-background"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-10 border border-border p-6 animate-fade-up">
          <h3 className="font-serif text-xl font-medium mb-5">Share your experience</h3>

          {!session ? (
            <div className="flex flex-col items-start gap-4 rounded-sm border border-border/60 bg-secondary p-5">
              <div>
                <p className="text-sm font-medium mb-1">Sign in to leave a review</p>
                <p className="text-xs font-light text-muted-foreground leading-relaxed">
                  Signed-in reviews can earn rewards points and may be marked as{" "}
                  <span className="font-medium text-foreground">Verified Purchase</span> if you bought this product.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="border border-border px-5 py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-light text-muted-foreground">
                <User className="size-3.5" />
                Reviewing as {session.email}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                  Your Rating <span className="text-gold">*</span>
                </label>
                <StarRating rating={formRating} interactive onChange={setFormRating} size="lg" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                  Review Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Sum up your experience in a few words"
                  required
                  className="border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                  Your Review <span className="text-gold">*</span>
                </label>
                <textarea
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Tell others about your experience with this product…"
                  rows={4}
                  required
                  className="resize-none border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                />
              </div>

              {formError && (
                <p className="text-xs font-light text-destructive">{formError}</p>
              )}

              <div className="flex items-center justify-end pt-1">
                <button
                  type="submit"
                  disabled={!formRating || !formBody || submitting}
                  className={cn(
                    "px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all",
                    !formRating || !formBody || submitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
                  )}
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs font-light uppercase tracking-[0.18em] text-muted-foreground">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none border border-border bg-background py-2 pl-3 pr-8 text-xs font-light outline-none focus:border-foreground transition-colors cursor-pointer"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating_high">Highest Rated</option>
                <option value="rating_low">Lowest Rated</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="divide-y divide-border">
            {sorted.map((review) => (
              <div key={review.id} className="py-7">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {review.authorInitial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{review.author}</p>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-light text-green-700">
                          <Check className="size-2.5" /> Verified Purchase
                        </span>
                      )}
                      <span className="text-[10px] font-light text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    <p className="text-sm font-medium mt-3 mb-1.5">{review.title}</p>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{review.body}</p>
                    <button
                      type="button"
                      onClick={() => markHelpful(review.id)}
                      className={cn(
                        "mt-4 flex items-center gap-1.5 text-[11px] font-light transition-colors",
                        helpfulClicked.has(review.id)
                          ? "text-gold cursor-default"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      disabled={helpfulClicked.has(review.id) || !session}
                      title={!session ? "Sign in to mark helpful" : undefined}
                    >
                      <ThumbsUp className="size-3.5" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && reviews.length === 0 && !showForm && (
        <p className="text-center text-sm font-light text-muted-foreground py-8">
          No reviews yet. Be the first to share your experience.
        </p>
      )}
    </section>
  )
}
