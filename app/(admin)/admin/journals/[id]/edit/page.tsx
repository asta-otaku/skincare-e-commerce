"use client"

import { use, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AdminJournalEditor } from "@/components/admin-journal-editor"
import { getJournalById } from "@/lib/supabase/journals"
import type { Journal } from "@/lib/journals"

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [journal, setJournal] = useState<Journal | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading")
  const [errorMsg, setErrorMsg] = useState("")

  const load = useCallback(async () => {
    setStatus("loading")
    setErrorMsg("")
    try {
      const j = await getJournalById(id)
      if (!j) {
        setJournal(null)
        setStatus("missing")
        return
      }
      setJournal(j)
      setStatus("ready")
    } catch (err) {
      setJournal(null)
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Failed to load article")
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (status === "loading") {
    return (
      <div className="flex flex-1 flex-col gap-8 overflow-auto">
        <div className="admin-page-body">
          <div className="space-y-4 max-w-2xl animate-pulse">
            <div className="h-8 w-48 bg-muted" />
            <div className="h-4 w-72 bg-secondary" />
            <div className="h-96 w-full bg-secondary mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (status === "missing" || status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
        <p className="font-serif text-2xl font-medium">
          {status === "missing" ? "Article not found" : "Couldn’t load article"}
        </p>
        <p className="max-w-md text-sm font-light text-muted-foreground">
          {status === "missing"
            ? `No journal with id “${id}” was found. It may have been deleted, or your admin session may not have permission to read it.`
            : errorMsg}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={load}
            className="border border-border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] hover:border-foreground transition-colors"
          >
            Retry
          </button>
          <Link
            href="/admin/journals"
            className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
          >
            Back to Journal
          </Link>
        </div>
      </div>
    )
  }

  return <AdminJournalEditor journal={journal!} />
}
