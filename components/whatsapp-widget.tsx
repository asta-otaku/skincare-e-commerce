"use client"

import { useState } from "react"
import { X, MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "2348000000000"
const MESSAGE = "Hi! I'd like to enquire about a product on HAYDA SKINCo."

export function WhatsAppWidget() {
  const [expanded, setExpanded] = useState(false)

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(MESSAGE)}`

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 md:bottom-8 md:right-8">
      {/* Chat bubble */}
      {expanded && (
        <div className="w-72 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 bg-[#25D366] px-4 py-3.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white leading-none">HAYDA SKINCo.</p>
              <p className="mt-0.5 text-[11px] text-white/80">Typically replies instantly</p>
            </div>
            <button type="button" onClick={() => setExpanded(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="size-4" />
            </button>
          </div>
          {/* Body */}
          <div className="p-4">
            <div className="rounded-lg bg-muted p-3 text-sm font-light leading-relaxed text-foreground">
              👋 Hello! Welcome to <strong>HAYDA SKINCo.</strong><br /><br />
              How can we help you today? Ask us about products, orders, recommendations, or anything skincare!
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
            <p className="mt-2 text-center text-[10px] font-light text-muted-foreground">
              Available Mon–Sat · 8am–8pm WAT
            </p>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        aria-label="Chat on WhatsApp"
        className="flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
      >
        {expanded
          ? <X className="size-6 text-white" />
          : <WhatsAppIcon />
        }
      </button>
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 fill-white" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
