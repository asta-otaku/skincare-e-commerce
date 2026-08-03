/**
 * Canonical production origin when env is unset.
 * Use www — apex haydaskinco.com 308s to www, and email clients often
 * do not follow redirects for <img src>, so images break in mail.
 */
export const DEFAULT_SITE_URL = "https://www.haydaskinco.com"

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  return DEFAULT_SITE_URL
}
