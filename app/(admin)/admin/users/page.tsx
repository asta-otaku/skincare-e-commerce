"use client"

import { useEffect, useState } from "react"
import {
  Search, MoreHorizontal, ShieldCheck, ShieldOff, Mail,
  Users, UserCheck, UserX, ChevronDown, SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/products"
import {
  bulkSetSuspended,
  getAdminUsers,
  updateUserRole,
  updateUserSuspended,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from "@/lib/supabase/users"

const STATUS_STYLES: Record<AdminUserStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
}

const ROLE_STYLES: Record<AdminUserRole, string> = {
  admin: "bg-lavender text-lavender-foreground border-lavender-foreground/20",
  staff: "bg-gold/10 text-gold-foreground border-gold/30",
  customer: "bg-muted text-muted-foreground border-border",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all")
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setUsers(await getAdminUsers())
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  async function toggleStatus(id: string) {
    const user = users.find(u => u.id === id)
    if (!user) return
    const suspend = user.status === "active"
    const error = await updateUserSuspended(id, suspend)
    setOpenMenu(null)
    if (error) {
      setMessage(error)
      return
    }
    await load()
  }

  async function toggleRole(id: string) {
    const user = users.find(u => u.id === id)
    if (!user) return
    const nextRole: AdminUserRole = user.role === "admin" ? "customer" : "admin"
    const error = await updateUserRole(id, nextRole)
    setOpenMenu(null)
    if (error) {
      setMessage(error)
      return
    }
    await load()
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((u) => u.id)))
    }
  }

  const active = users.filter((u) => u.status === "active").length
  const suspended = users.filter((u) => u.status === "suspended").length
  const admins = users.filter((u) => u.role === "admin").length

  return (
    <div className="flex-1 overflow-auto" onClick={() => setOpenMenu(null)}>
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Users</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${users.length} profiles from Supabase`}
          </p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 border border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">
          <ShieldCheck className="size-3" /> Live
        </span>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        {message && (
          <p className="mb-4 border border-border bg-muted/20 px-4 py-3 text-sm font-light">{message}</p>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-foreground" },
            { label: "Active", value: active, icon: UserCheck, color: "text-green-600" },
            { label: "Suspended", value: suspended, icon: UserX, color: "text-destructive" },
            { label: "Admins", value: admins, icon: ShieldCheck, color: "text-gold" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
              <p className="font-serif text-3xl font-medium">{loading ? "—" : stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm font-light outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            {(["all", "customer", "admin", "staff"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "border px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] transition-all capitalize",
                  roleFilter === r
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {r === "all" ? "All Roles" : r}
              </button>
            ))}
            <span className="text-border">|</span>
            {(["all", "active", "suspended"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "border px-3 py-1.5 text-[11px] font-light uppercase tracking-[0.12em] transition-all capitalize",
                  statusFilter === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 border border-gold/30 bg-gold/5 px-4 py-3">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <button
              type="button"
              onClick={async () => {
                const err = await bulkSetSuspended([...selectedIds], true)
                if (err) setMessage(err)
                setSelectedIds(new Set())
                await load()
              }}
              className="text-xs font-light text-destructive hover:underline underline-offset-2"
            >
              Suspend selected
            </button>
            <button
              type="button"
              onClick={async () => {
                const err = await bulkSetSuspended([...selectedIds], false)
                if (err) setMessage(err)
                setSelectedIds(new Set())
                await load()
              }}
              className="text-xs font-light text-green-600 hover:underline underline-offset-2"
            >
              Activate selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs font-light text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}

        <div className="border border-border">
          {loading ? (
            <div className="h-48 bg-muted/20 animate-pulse" />
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left w-10">
                        <div
                          onClick={selectAll}
                          className={cn(
                            "flex size-4 cursor-pointer items-center justify-center border transition-all",
                            selectedIds.size === filtered.length && filtered.length > 0
                              ? "border-gold bg-gold"
                              : "border-border",
                          )}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">User</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Orders</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Spent</th>
                      <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Joined</th>
                      <th className="px-4 py-3 text-right text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((user) => (
                      <tr key={user.id} className={cn("hover:bg-muted/20 transition-colors", selectedIds.has(user.id) && "bg-muted/30")}>
                        <td className="px-4 py-4">
                          <div
                            onClick={() => toggleSelect(user.id)}
                            className={cn(
                              "flex size-4 cursor-pointer items-center justify-center border transition-all",
                              selectedIds.has(user.id) ? "border-gold bg-gold" : "border-border hover:border-foreground",
                            )}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs font-light text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] capitalize", ROLE_STYLES[user.role])}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] capitalize", STATUS_STYLES[user.status])}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-light text-muted-foreground">{user.orders}</td>
                        <td className="px-4 py-4 text-sm font-medium">{formatPrice(user.totalSpent)}</td>
                        <td className="px-4 py-4 text-xs font-light text-muted-foreground">
                          {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end">
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                                className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <MoreHorizontal className="size-4" />
                              </button>
                              {openMenu === user.id && (
                                <div
                                  className="absolute right-0 top-9 z-30 min-w-44 border border-border bg-background shadow-md"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleStatus(user.id)}
                                    className={cn(
                                      "flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-light transition-colors hover:bg-muted",
                                      user.status === "active" ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600",
                                    )}
                                  >
                                    {user.status === "active" ? <ShieldOff className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
                                    {user.status === "active" ? "Suspend User" : "Activate User"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleRole(user.id)}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-light text-foreground transition-colors hover:bg-muted"
                                  >
                                    <ChevronDown className="size-3.5" />
                                    {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                  </button>
                                  <a
                                    href={`mailto:${user.email}`}
                                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-light text-foreground transition-colors hover:bg-muted"
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    <Mail className="size-3.5" /> Send Email
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-border lg:hidden">
                {filtered.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs font-light text-muted-foreground truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={cn("border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]", STATUS_STYLES[user.status])}>
                          {user.status}
                        </span>
                        <span className={cn("border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em]", ROLE_STYLES[user.role])}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === user.id ? null : user.id) }}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="size-10 text-muted-foreground mb-3" />
                  <p className="font-serif text-lg font-medium">No users found</p>
                  <p className="mt-1 text-sm font-light text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
