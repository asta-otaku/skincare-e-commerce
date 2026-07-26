"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Deal } from "@/lib/deals"
import { getDealById } from "@/lib/supabase/deals"
import { AdminDealForm } from "@/components/admin-deal-form"

export default function EditDealPage() {
  const params = useParams()
  const id = String(params.id ?? "")
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const data = await getDealById(id)
      if (cancelled) return
      if (!data) setMissing(true)
      else setDeal(data)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm font-light text-muted-foreground">
        Loading deal…
      </div>
    )
  }

  if (missing || !deal) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12">
        <p className="font-serif text-xl">Deal not found</p>
        <Link href="/admin/deals" className="flex items-center gap-2 text-sm text-gold hover:underline">
          <ArrowLeft className="size-3.5" /> Back to deals
        </Link>
      </div>
    )
  }

  return <AdminDealForm deal={deal} />
}
