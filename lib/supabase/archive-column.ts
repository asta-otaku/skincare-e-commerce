/** True once we know `products.is_archived` is not in this database yet. */
let disabledUntil = 0
let warned = false

export function archiveColumnEnabled() {
  return Date.now() >= disabledUntil
}

export function isMissingArchiveColumn(message: string | undefined | null) {
  if (!message) return false
  return message.includes("is_archived") && /does not exist|schema cache/i.test(message)
}

/** Skip archive filters for a minute so the storefront keeps working before migration 030. */
export function markArchiveColumnMissing() {
  disabledUntil = Date.now() + 60_000
  if (!warned) {
    warned = true
    console.warn(
      "[products] products.is_archived is missing. Apply supabase/migrations/030_archive_and_sub_admin.sql to enable archive.",
    )
  }
}
