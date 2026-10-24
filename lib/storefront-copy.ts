/**
 * Shared storefront marketing copy.
 *
 * Standard shipping is free (5–7 business days). Express is ₦3,000 (2–3 business days).
 * Do not add spend thresholds or same-day dispatch.
 *
 * Exports used by the announcement bar and footer:
 * - FREE_STANDARD_DELIVERY
 * - ANNOUNCEMENT_MESSAGES
 * - SOCIAL_URLS
 * - SOCIAL_LINKS
 */

export const FREE_STANDARD_DELIVERY = "Free standard delivery nationwide"

export const SOCIAL_URLS = {
  instagram: "https://instagram.com/haydaskinco",
  tiktok: "https://tiktok.com/@haydaskinco",
  facebook: "https://facebook.com/haydaskinco",
} as const

export const SOCIAL_LINKS = [
  { label: "Instagram" as const, href: SOCIAL_URLS.instagram },
  { label: "TikTok" as const, href: SOCIAL_URLS.tiktok },
  { label: "Facebook" as const, href: SOCIAL_URLS.facebook },
]

export const ANNOUNCEMENT_MESSAGES = [
  FREE_STANDARD_DELIVERY,
  "Pay securely with Paystack",
  "Authentic products",
  "Combo deals",
] as const
