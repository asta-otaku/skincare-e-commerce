import { requireFullAdmin } from "@/lib/admin-access"

export default async function DealsAdminLayout({ children }: { children: React.ReactNode }) {
  await requireFullAdmin()
  return children
}
