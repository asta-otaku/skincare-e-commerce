import { requireFullAdmin } from "@/lib/admin-access"

export default async function InboxAdminLayout({ children }: { children: React.ReactNode }) {
  await requireFullAdmin()
  return children
}
