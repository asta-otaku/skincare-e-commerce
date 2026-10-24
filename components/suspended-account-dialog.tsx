"use client"

type Props = {
  open: boolean
  onClose: () => void
}

export function SuspendedAccountDialog({ open, onClose }: Props) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspended-account-title"
        className="fixed left-1/2 top-1/2 z-50 w-[min(100%-2rem,24rem)] -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-6 shadow-2xl"
      >
        <p className="text-[11px] font-light uppercase tracking-[0.22em] text-gold">Account restricted</p>
        <h2 id="suspended-account-title" className="mt-2 font-serif text-2xl font-medium">
          This account has been suspended
        </h2>
        <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
          You can’t sign in while this account is suspended. Contact the store if you think this is a mistake.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full bg-foreground py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-gold hover:text-gold-foreground"
        >
          Close
        </button>
      </div>
    </>
  )
}

export const SUSPENDED_AUTH_CODE = "suspended"
export const SUSPENDED_NOTICE_KEY = "hayda_suspended"
