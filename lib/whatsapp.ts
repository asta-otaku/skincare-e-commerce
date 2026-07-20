/**
 * WhatsApp number from env. Digits only for wa.me links.
 * Default: +234 813 730 9609
 */
const DEFAULT = "2348137309609"

export function getWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "")
  return raw && raw.length >= 10 ? raw : DEFAULT
}

export function getWhatsAppDisplay(): string {
  const n = getWhatsAppNumber()
  // Format NG mobile: 2348137309609 → +234 813 730 9609
  if (n.startsWith("234") && n.length === 13) {
    return `+234 ${n.slice(3, 6)} ${n.slice(6, 9)} ${n.slice(9)}`
  }
  return `+${n}`
}

export function whatsAppHref(text?: string): string {
  const base = `https://wa.me/${getWhatsAppNumber()}`
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text)}`
}
