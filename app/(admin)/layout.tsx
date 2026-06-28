import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
