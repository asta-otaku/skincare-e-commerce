"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Star, ThumbsUp, User, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Review = {
  id: string
  author: string
  authorInitial: string
  rating: number
  title: string
  body: string
  date: string
  verified: boolean
  helpful: number
  productId: string
}

const SEED_REVIEWS: Review[] = [
  {
    id: "r1",
    author: "Sophie L.",
    authorInitial: "SL",
    rating: 5,
    title: "The most beautiful serum I've ever used",
    body: "I've been using this for three months and my skin has never looked better. The glow is real — friends keep asking what I'm doing differently. The texture is featherlight, absorbs immediately, and layers perfectly under moisturiser.",
    date: "2024-11-20",
    verified: true,
    helpful: 24,
    productId: "radiance-serum",
  },
  {
    id: "r2",
    author: "Mia C.",
    authorInitial: "MC",
    rating: 5,
    title: "Worth every penny",
    body: "I was hesitant at the price point but this serum has completely replaced my previous routine. The brightening effect is visible within the first week. My dark spots have faded noticeably.",
    date: "2024-10-15",
    verified: true,
    helpful: 18,
    productId: "radiance-serum",
  },
  {
    id: "r3",
    author: "Emma W.",
    authorInitial: "EW",
    rating: 4,
    title: "Lovely but takes time",
    body: "Beautifully formulated and smells divine. Results took about 6 weeks to become really visible for me. I docked one star only because my skin purged slightly in the first two weeks — but now it looks incredible.",
    date: "2024-09-08",
    verified: false,
    helpful: 11,
    productId: "radiance-serum",
  },
  {
    id: "r4",
    author: "Olivia P.",
    authorInitial: "OP",
    rating: 5,
    title: "A ritual I look forward to",
    body: "The packaging is exquisite and the formula lives up to its promise. My skin feels genuinely plumper and the Vitamin C glow is subtle but persistent. This is a permanent addition to my routine.",
    date: "2024-08-30",
    verified: true,
    helpful: 9,
    productId: "radiance-serum",
  },
  {
    id: "r5",
    author: "Aisha D.",
    authorInitial: "AD",
    rating: 5,
    title: "Transformed my dull winter skin",
    body: "I picked this up after the salon recommendation and I cannot imagine going without it. The formula somehow manages to be both deeply hydrating and brightening at the same time.",
    date: "2024-07-12",
    verified: true,
    helpful: 15,
    productId: "gold-oil",
  },
  {
    id: "r6",
    author: "Clara R.",
    authorInitial: "CR",
    rating: 4,
    title: "A luxurious treat for the skin",
    body: "The gold oil is stunning. It absorbs faster than I expected for an oil and leaves this beautiful soft glow. I press two drops into my cheekbones every evening. The scent is subtle and warm.",
    date: "2024-06-22",
    verified: false,
    helpful: 7,
    productId: "gold-oil",
  },
]

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

type ReviewMode = "login" | "guest"

export function ProductReviews({ productId }: { productId: string }) {
  const productReviews = useMemo(
    () => SEED_REVIEWS.filter((r) => r.productId === productId),
    [productId],
  )

  const [reviews, setReviews] = useState<Review[]>(productReviews)
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<ReviewMode>("login")
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating_high" | "rating_low">("recent")

  // Form state
  const [formRating, setFormRating] = useState(0)
  const [formTitle, setFormTitle] = useState("")
  const [formBody, setFormBody] = useState("")
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

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

  function markHelpful(id: string) {
    if (helpfulClicked.has(id)) return
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, helpful: r.helpful + 1 } : r))
    setHelpfulClicked((prev) => new Set([...prev, id]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formRating) return
    const newReview: Review = {
      id: `r${Date.now()}`,
      author: mode === "guest" ? (formName || "Anonymous") : "You",
      authorInitial: (mode === "guest" ? formName : "Y")[0]?.toUpperCase() ?? "Y",
      rating: formRating,
      title: formTitle,
      body: formBody,
      date: new Date().toISOString().split("T")[0],
      verified: false,
      helpful: 0,
      productId,
    }
    setReviews((prev) => [newReview, ...prev])
    setSubmitted(true)
    setShowForm(false)
    setFormRating(0)
    setFormTitle("")
    setFormBody("")
    setFormName("")
    setFormEmail("")
  }

  return (
    <section className="border-t border-border mt-16 pt-12 mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mb-10 flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
        {/* Rating summary */}
        <div className="shrink-0 text-center md:text-left">
          <p className="font-serif text-6xl font-medium leading-none">{avgRating.toFixed(1)}</p>
          <StarRating rating={Math.round(avgRating)} size="lg" />
          <p className="mt-2 text-sm font-light text-muted-foreground">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Rating bars */}
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

        {/* Write review CTA */}
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

      {/* Review form */}
      {showForm && (
        <div className="mb-10 border border-border p-6 animate-fade-up">
          <h3 className="font-serif text-xl font-medium mb-5">Share your experience</h3>

          {/* Mode toggle */}
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={cn(
                "flex items-center gap-2 border px-4 py-2 text-xs font-light uppercase tracking-[0.12em] transition-all",
                mode === "login"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              <User className="size-3.5" /> Sign in to review
            </button>
            <button
              type="button"
              onClick={() => setMode("guest")}
              className={cn(
                "flex items-center gap-2 border px-4 py-2 text-xs font-light uppercase tracking-[0.12em] transition-all",
                mode === "guest"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              Continue as guest
            </button>
          </div>

          {mode === "login" ? (
            /* Login prompt */
            <div className="flex flex-col items-start gap-4 rounded-sm border border-border/60 bg-muted/20 p-5">
              <div>
                <p className="text-sm font-medium mb-1">Sign in to leave a verified review</p>
                <p className="text-xs font-light text-muted-foreground leading-relaxed">
                  Signed-in reviews are marked as <span className="font-medium text-foreground">Verified Purchase</span> and
                  carry more weight in our community. You can still review as a guest if you prefer.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/account/login"
                  className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/account/register"
                  className="border border-border px-5 py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors"
                >
                  Create Account
                </Link>
              </div>
              <p className="text-[11px] font-light text-muted-foreground">
                Or{" "}
                <button
                  type="button"
                  onClick={() => setMode("guest")}
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  continue as guest
                </button>{" "}
                without signing in.
              </p>
            </div>
          ) : (
            /* Guest review form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Sophie L."
                    className="border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                    Email (not published)
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="border border-border bg-background px-4 py-3 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                  />
                </div>
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

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] font-light text-muted-foreground">
                  Reviews are stored locally until Supabase integration is configured.
                </p>
                <button
                  type="submit"
                  disabled={!formRating || !formBody}
                  className={cn(
                    "px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all",
                    !formRating || !formBody
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
                  )}
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sort + Reviews list */}
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {review.authorInitial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{review.author}</p>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-light text-green-700">
                            <Check className="size-2.5" /> Verified Purchase
                          </span>
                        )}
                        <span className="text-[10px] font-light text-muted-foreground">
                          {new Date(review.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-3 ml-12">
                  <p className="text-sm font-medium mb-1.5">{review.title}</p>
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
                    disabled={helpfulClicked.has(review.id)}
                  >
                    <ThumbsUp className="size-3.5" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {reviews.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Star className="size-8 text-muted-foreground mb-3" />
          <p className="font-serif text-xl font-medium">No reviews yet</p>
          <p className="mt-2 text-sm font-light text-muted-foreground">Be the first to share your experience.</p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 border border-foreground px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] hover:bg-foreground hover:text-background transition-colors"
          >
            Write a Review
          </button>
        </div>
      )}
    </section>
  )
}
