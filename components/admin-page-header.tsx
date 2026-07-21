import { cn } from "@/lib/utils"

interface AdminPageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export const adminPageHeaderClass = "admin-page-header"

/** Body under sticky header — parent must be `flex flex-col gap-6` (or sm:gap-8) for the gap */
export const adminPageBodyClass = "admin-page-body"

export function AdminPageHeader({ title, description, actions, className }: AdminPageHeaderProps) {
  return (
    <div className={cn(adminPageHeaderClass, className)}>
      <div className="min-w-0">
        <h1 className="font-serif text-xl font-medium sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-xs font-light text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
