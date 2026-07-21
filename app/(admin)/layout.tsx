import { AdminAuthProvider } from '@/components/admin-auth-provider'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </AdminAuthProvider>
  )
}
