import { notFound } from "next/navigation"
import { getJournal } from "@/lib/journals"
import { AdminJournalEditor } from "@/components/admin-journal-editor"

export default async function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const journal = getJournal(id)
  if (!journal) notFound()
  return <AdminJournalEditor journal={journal} />
}
