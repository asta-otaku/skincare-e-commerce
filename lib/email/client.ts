import { Resend } from "resend"

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

export function emailFrom(): string {
  return process.env.EMAIL_FROM ?? "HAYDA SKINCo. <onboarding@resend.dev>"
}

export function emailTo(): string {
  return process.env.EMAIL_TO ?? "hello@haydaskinco.com"
}

export const NEWSLETTER_PROMO_CODE = "WELCOME10"
