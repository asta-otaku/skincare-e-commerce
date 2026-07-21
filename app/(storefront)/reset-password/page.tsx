"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Check, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) {
      setError("Auth is not configured.")
      return
    }

    let settled = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        settled = true
        setReady(true)
      }
    })

    // Hash / PKCE exchange may already have a session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !settled) {
        settled = true
        setReady(true)
      } else if (!session) {
        // Give the recovery event a moment to fire from URL hash
        setTimeout(() => {
          if (!settled) {
            void supabase.auth.getSession().then(({ data }) => {
              if (data.session) setReady(true)
              else setError("This reset link is invalid or has expired. Request a new one.")
            })
          }
        }, 1500)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError("Auth is not configured.")
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    setTimeout(() => router.push("/login"), 2000)
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-md flex-col items-center justify-center px-5 py-12">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-light uppercase tracking-[0.28em] text-gold mb-3">Account</p>
        <h1 className="font-serif text-4xl font-medium">Set new password</h1>
        <p className="mt-3 text-sm font-light text-muted-foreground">
          Choose a new password for your HAYDA account.
        </p>
      </div>

      {done ? (
        <div className="w-full border border-gold/40 bg-lavender px-6 py-10 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-gold text-gold-foreground">
            <Check className="size-5" />
          </span>
          <p className="mt-4 font-serif text-xl font-medium">Password updated</p>
          <p className="mt-2 text-sm font-light text-muted-foreground">Redirecting you to sign in…</p>
        </div>
      ) : !ready && !error ? (
        <p className="text-sm font-light text-muted-foreground">Verifying reset link…</p>
      ) : error && !ready ? (
        <div className="w-full space-y-4 text-center">
          <p className="text-sm font-light text-destructive">{error}</p>
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold hover:underline"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-border bg-background py-3 pl-11 pr-11 text-sm font-light outline-none focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShow(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full border border-border bg-background py-3 pl-11 pr-4 text-sm font-light outline-none focus:border-foreground"
              />
            </div>
          </div>
          {error && <p className="text-sm font-light text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground py-3.5 text-xs font-medium uppercase tracking-[0.18em] text-background transition-colors hover:bg-gold hover:text-gold-foreground disabled:opacity-60"
          >
            {loading ? "Saving…" : "Update password"}
          </button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 pt-2 text-xs font-light text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </form>
      )}
    </div>
  )
}
