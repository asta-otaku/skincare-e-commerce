/** Canonical production origin when env is unset (local / preview). */
export const DEFAULT_SITE_URL = "https://haydaskinco.com"

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (fromEnv) return fromEnv
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`
  return DEFAULT_SITE_URL
}
