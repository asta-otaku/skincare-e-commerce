function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f2;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e8e4de;">
        <tr><td style="padding:28px 32px 16px;border-bottom:1px solid #e8e4de;">
          <p style="margin:0;font-size:18px;letter-spacing:0.2em;font-weight:500;">HAYDA SKINCo.</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          ${body}
        </td></tr>
        <tr><td style="padding:16px 32px 28px;border-top:1px solid #e8e4de;">
          <p style="margin:0;font-size:12px;color:#888;font-family:system-ui,sans-serif;font-weight:300;">
            Questions? Reply to this email or WhatsApp us.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function naira(n: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)
}

export type OrderEmailItem = {
  name: string
  quantity: number
  price: number
}

export function orderConfirmationHtml(opts: {
  name: string
  reference: string
  items: OrderEmailItem[]
  total: number
  shippingMethod: string
}): string {
  const rows = opts.items
    .map(
      i =>
        `<tr>
          <td style="padding:8px 0;font-family:system-ui,sans-serif;font-size:14px;">${escapeHtml(i.name)} × ${i.quantity}</td>
          <td style="padding:8px 0;text-align:right;font-family:system-ui,sans-serif;font-size:14px;">${naira(i.price * i.quantity)}</td>
        </tr>`,
    )
    .join("")
  const eta =
    opts.shippingMethod === "express"
      ? "1–2 business days"
      : "3–5 business days"
  return layout(
    "Order confirmation",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">Thank you, ${escapeHtml(opts.name)}</h1>
     <p style="margin:0 0 20px;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       We’ve received your payment. Order <strong>${escapeHtml(opts.reference)}</strong> is confirmed.
       Estimated delivery: <strong>${eta}</strong>.
     </p>
     <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
     <p style="margin:20px 0 0;font-family:system-ui,sans-serif;font-size:16px;font-weight:500;">
       Total: ${naira(opts.total)}
     </p>`,
  )
}

export function orderShippedHtml(opts: { name: string; reference: string }): string {
  return layout(
    "Your order has shipped",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">On its way</h1>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       Hi ${escapeHtml(opts.name)}, order <strong>${escapeHtml(opts.reference)}</strong> has shipped.
       You’ll hear from us again when it’s delivered.
     </p>`,
  )
}

export function orderFulfilledHtml(opts: { name: string; reference: string }): string {
  return layout(
    "Order delivered",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">Delivered</h1>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       Hi ${escapeHtml(opts.name)}, order <strong>${escapeHtml(opts.reference)}</strong> has been marked as delivered.
       We hope you love your products — leave a review anytime from your account.
     </p>`,
  )
}

export function welcomeHtml(opts: { name: string }): string {
  return layout(
    "Welcome to HAYDA SKINCo.",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">Welcome, ${escapeHtml(opts.name)}</h1>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       Your account is ready. Shop curated skincare, earn loyalty points on every paid order
       (1 point per ₦100), and redeem rewards anytime from your account.
     </p>`,
  )
}

export function rewardPromoHtml(opts: {
  name: string
  promoCode: string
  discountNgn: number
}): string {
  return layout(
    "Your reward code",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">Reward unlocked</h1>
     <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       Hi ${escapeHtml(opts.name)}, here’s your promo code for ${naira(opts.discountNgn)} off:
     </p>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:22px;letter-spacing:0.12em;font-weight:600;">
       ${escapeHtml(opts.promoCode)}
     </p>
     <p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:13px;font-weight:300;color:#888;">
       Use it at checkout before it expires.
     </p>`,
  )
}

export function newsletterWelcomeHtml(opts: { promoCode: string }): string {
  return layout(
    "You're on the list",
    `<h1 style="margin:0 0 12px;font-size:24px;font-weight:500;">Welcome to The HAYDA List</h1>
     <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;color:#555;">
       Thanks for subscribing. Here’s <strong>10% off</strong> your first order:
     </p>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:22px;letter-spacing:0.12em;font-weight:600;">
       ${escapeHtml(opts.promoCode)}
     </p>`,
  )
}

export function contactNotifyHtml(opts: {
  name: string
  email: string
  subject: string
  message: string
}): string {
  return layout(
    "New contact message",
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:500;">Contact form</h1>
     <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:14px;"><strong>From:</strong> ${escapeHtml(opts.name)} &lt;${escapeHtml(opts.email)}&gt;</p>
     <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Subject:</strong> ${escapeHtml(opts.subject || "(none)")}</p>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.message)}</p>`,
  )
}

export function wholesaleNotifyHtml(opts: {
  name: string
  business: string
  email: string
  phone: string
  type: string
  volume: string
  message: string
}): string {
  return layout(
    "Wholesale enquiry",
    `<h1 style="margin:0 0 12px;font-size:22px;font-weight:500;">Wholesale enquiry</h1>
     <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Name:</strong> ${escapeHtml(opts.name)}</p>
     <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Business:</strong> ${escapeHtml(opts.business)}</p>
     <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Email:</strong> ${escapeHtml(opts.email)}</p>
     <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(opts.phone)}</p>
     <p style="margin:0 0 6px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Type:</strong> ${escapeHtml(opts.type)}</p>
     <p style="margin:0 0 16px;font-family:system-ui,sans-serif;font-size:14px;"><strong>Volume:</strong> ${escapeHtml(opts.volume || "—")}</p>
     <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;font-weight:300;line-height:1.6;white-space:pre-wrap;">${escapeHtml(opts.message || "")}</p>`,
  )
}
