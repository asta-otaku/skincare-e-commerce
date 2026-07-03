"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    if (email === "admin@haydaskinco.com" && password === "password") {
      router.push("/admin/dashboard")
    } else {
      setError("Invalid email or password. Try admin@haydaskinco.com / password")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-foreground p-12 text-background">
        <Link href="/" className="font-serif text-2xl font-medium tracking-[0.25em]">
          HAYDA SKINCo.
        </Link>
        <div>
          <blockquote className="font-serif text-3xl font-light leading-relaxed text-background/90">
            &ldquo;Beauty is not about perfection — it is about the rituals we create for ourselves.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm font-light text-background/50">— HAYDA SKINCo.</p>
        </div>
        <p className="text-xs font-light uppercase tracking-[0.2em] text-background/40">
          Admin Portal
        </p>
      </div>

      {/* Right: form */}
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 md:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-10 block font-serif text-2xl font-medium tracking-[0.25em] lg:hidden">
            HAYDA SKINCo.
          </Link>

          <div className="mb-8">
            <p className="text-[11px] font-light uppercase tracking-[0.25em] text-gold mb-2">Admin Portal</p>
            <h1 className="font-serif text-3xl font-medium">Welcome back</h1>
            <p className="mt-2 text-sm font-light text-muted-foreground">
              Sign in to manage your store.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@haydaskinco.com"
                  required
                  className="w-full border border-border bg-background py-3 pl-11 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[11px] font-light text-gold underline-offset-2 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-border bg-background py-3 pl-11 pr-11 text-sm font-light outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-2.5 rounded-sm">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex w-full items-center justify-center gap-2 py-4 text-xs font-medium uppercase tracking-[0.18em] transition-all",
                loading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
              )}
            >
              {loading ? (
                <>
                  <span className="size-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight className="size-3.5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-xs font-light text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/admin/register"
                className="text-foreground font-medium underline-offset-2 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-4 rounded-sm border border-border/60 bg-muted/40 px-4 py-3">
            <p className="text-[10px] font-light text-muted-foreground text-center">
              Demo credentials: admin@haydaskinco.com / password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
