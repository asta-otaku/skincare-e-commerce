import { requireFullAdmin } from "@/lib/admin-access"

export default async function UsersAdminLayout({ children }: { children: React.ReactNode }) {
  await requireFullAdmin()
  return children
}
