import { emailFrom, emailTo, getResend, NEWSLETTER_PROMO_CODE } from "./client"
import {
  contactNotifyHtml,
  newsletterWelcomeHtml,
  orderConfirmationHtml,
  orderFulfilledHtml,
  orderShippedHtml,
  rewardPromoHtml,
  welcomeHtml,
  wholesaleNotifyHtml,
  type OrderEmailItem,
} from "./templates"

async function send(opts: {
  to: string
  subject: string
  html: string
  replyTo?: string
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const resend = getResend()
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing — skip:", opts.subject)
    return { ok: true, skipped: true }
  }
  if (!opts.to) {
    console.warn("[email] No recipient — skip:", opts.subject)
    return { ok: true, skipped: true }
  }

  const { error } = await resend.emails.send({
    from: emailFrom(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    replyTo: opts.replyTo,
  })

  if (error) {
    const msg =
      typeof error === "object" && error && "message" in error
        ? String((error as { message: string }).message)
        : String(error)
    console.error("[email] send failed:", msg)
    return { ok: false, error: msg }
  }
  return { ok: true }
}

export async function sendOrderConfirmation(opts: {
  to: string
  name: string
  reference: string
  items: OrderEmailItem[]
  total: number
  shippingMethod: string
}) {
  return send({
    to: opts.to,
    subject: `Order confirmed — ${opts.reference}`,
    html: orderConfirmationHtml(opts),
  })
}

export async function sendOrderShipped(opts: {
  to: string
  name: string
  reference: string
}) {
  return send({
    to: opts.to,
    subject: `Your order has shipped — ${opts.reference}`,
    html: orderShippedHtml(opts),
  })
}

export async function sendOrderFulfilled(opts: {
  to: string
  name: string
  reference: string
}) {
  return send({
    to: opts.to,
    subject: `Delivered — ${opts.reference}`,
    html: orderFulfilledHtml(opts),
  })
}

export async function sendWelcome(opts: { to: string; name: string }) {
  return send({
    to: opts.to,
    subject: "Welcome to HAYDA SKINCo.",
    html: welcomeHtml(opts),
  })
}

export async function sendRewardPromo(opts: {
  to: string
  name: string
  promoCode: string
  discountNgn: number
}) {
  return send({
    to: opts.to,
    subject: `Your reward code: ${opts.promoCode}`,
    html: rewardPromoHtml(opts),
  })
}

export async function sendNewsletterWelcome(opts: { to: string; promoCode?: string }) {
  const code = opts.promoCode ?? NEWSLETTER_PROMO_CODE
  return send({
    to: opts.to,
    subject: "Your 10% off code — HAYDA SKINCo.",
    html: newsletterWelcomeHtml({ promoCode: code }),
  })
}

export async function sendContactNotify(opts: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return send({
    to: emailTo(),
    subject: `Contact: ${opts.subject || opts.name}`,
    html: contactNotifyHtml(opts),
    replyTo: opts.email,
  })
}

export async function sendWholesaleNotify(opts: {
  name: string
  business: string
  email: string
  phone: string
  type: string
  volume: string
  message: string
}) {
  return send({
    to: emailTo(),
    subject: `Wholesale: ${opts.business}`,
    html: wholesaleNotifyHtml(opts),
    replyTo: opts.email,
  })
}
