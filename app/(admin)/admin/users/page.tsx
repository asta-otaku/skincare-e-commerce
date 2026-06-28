"use client"

import { useState } from "react"
import {
  Search, MoreHorizontal, ShieldCheck, ShieldOff, Mail,
  Users, UserCheck, UserX, ChevronDown, SlidersHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Role = "customer" | "admin"
type Status = "active" | "suspended" | "pending"

type User = {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  joinedAt: string
  orders: number
  totalSpent: number
  lastSeen: string
  avatar: string
}

const MOCK_USERS: User[] = [
  { id: "u1", name: "Sophie Laurent", email: "sophie@example.com", role: "customer", status: "active", joinedAt: "2024-01-14", orders: 8, totalSpent: 912, lastSeen: "2 hours ago", avatar: "SL" },
  { id: "u2", name: "Mia Chen", email: "mia.chen@example.com", role: "customer", status: "active", joinedAt: "2024-02-03", orders: 5, totalSpent: 624, lastSeen: "1 day ago", avatar: "MC" },
  { id: "u3", name: "Emma Williams", email: "emma.w@example.com", role: "customer", status: "active", joinedAt: "2024-03-19", orders: 12, totalSpent: 1488, lastSeen: "3 days ago", avatar: "EW" },
  { id: "u4", name: "Isabelle Dupont", email: "isabelle@example.com", role: "customer", status: "suspended", joinedAt: "2024-04-07", orders: 2, totalSpent: 212, lastSeen: "2 weeks ago", avatar: "ID" },
  { id: "u5", name: "Olivia Park", email: "olivia.park@example.com", role: "customer", status: "active", joinedAt: "2024-04-22", orders: 3, totalSpent: 340, lastSeen: "5 hours ago", avatar: "OP" },
  { id: "u6", name: "Clara Rossi", email: "clara.r@example.com", role: "customer", status: "pending", joinedAt: "2024-05-01", orders: 0, totalSpent: 0, lastSeen: "Just joined", avatar: "CR" },
  { id: "u7", name: "Aisha Diallo", email: "aisha@example.com", role: "customer", status: "active", joinedAt: "2024-05-15", orders: 6, totalSpent: 768, lastSeen: "Yesterday", avatar: "AD" },
  { id: "u8", name: "Luna Torres", email: "luna.torres@example.com", role: "customer", status: "active", joinedAt: "2024-06-02", orders: 4, totalSpent: 452, lastSeen: "4 hours ago", avatar: "LT" },
  { id: "u9", name: "Admin User", email: "admin@aurelia.com", role: "admin", status: "active", joinedAt: "2023-11-01", orders: 0, totalSpent: 0, lastSeen: "Now", avatar: "A" },
  { id: "u10", name: "Fatima Al-Hassan", email: "fatima@example.com", role: "customer", status: "active", joinedAt: "2024-06-18", orders: 1, totalSpent: 128, lastSeen: "1 hour ago", avatar: "FA" },
]

const STATUS_STYLES: Record<Status, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-gold/10 text-gold-foreground border-gold/30",
}

const ROLE_STYLES: Record<Role, string> = {
  admin: "bg-lavender text-lavender-foreground border-lavender-foreground/20",
  customer: "bg-muted text-muted-foreground border-border",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all")
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchRole = roleFilter === "all" || u.role === roleFilter
    const matchStatus = statusFilter === "all" || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "active" ? "suspended" : "active" }
          : u,
      ),
    )
    setOpenMenu(null)
  }

  function toggleRole(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, role: u.role === "admin" ? "customer" : "admin" }
          : u,
      ),
    )
    setOpenMenu(null)
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
  const pending = users.filter((u) => u.status === "pending").length

  return (
    <div className="flex-1 overflow-auto" onClick={() => setOpenMenu(null)}>
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-6 py-4 lg:px-8">
        <div>
          <h1 className="font-serif text-2xl font-medium">Users</h1>
          <p className="text-xs font-light text-muted-foreground mt-0.5">
            {users.length} registered users · Supabase Auth integration pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 border border-border/60 bg-muted/30 px-3 py-1.5 text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground">
            <ShieldCheck className="size-3" /> Supabase
          </span>
        </div>
      </div>

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        {/* KPI cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Users", value: users.length, icon: Users, color: "text-foreground" },
            { label: "Active", value: active, icon: UserCheck, color: "text-green-600" },
            { label: "Suspended", value: suspended, icon: UserX, color: "text-destructive" },
            { label: "Pending", value: pending, icon: Mail, color: "text-gold" },
          ].map((stat) => (
            <div key={stat.label} className="border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-light uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
              <p className="font-serif text-3xl font-medium">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
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
            {(["all", "customer", "admin"] as const).map((r) => (
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
            {(["all", "active", "suspended", "pending"] as const).map((s) => (
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

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 border border-gold/30 bg-gold/5 px-4 py-3">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <button
              type="button"
              onClick={() => {
                setUsers((prev) => prev.map((u) => selectedIds.has(u.id) ? { ...u, status: "suspended" } : u))
                setSelectedIds(new Set())
              }}
              className="text-xs font-light text-destructive hover:underline underline-offset-2"
            >
              Suspend selected
            </button>
            <button
              type="button"
              onClick={() => {
                setUsers((prev) => prev.map((u) => selectedIds.has(u.id) ? { ...u, status: "active" } : u))
                setSelectedIds(new Set())
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

        {/* Table */}
        <div className="border border-border">
          {/* Desktop */}
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
                  <th className="px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Last Seen</th>
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
                    <td className="px-4 py-4 text-sm font-medium">${user.totalSpent.toLocaleString()}</td>
                    <td className="px-4 py-4 text-xs font-light text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-4 py-4 text-xs font-light text-muted-foreground">{user.lastSeen}</td>
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

          {/* Mobile cards */}
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
        </div>

        {/* Footer note */}
        <p className="mt-4 text-[11px] font-light text-muted-foreground text-center">
          User data will be synced from <span className="font-medium text-foreground">Supabase Auth</span> once the integration is configured.
        </p>
      </div>
    </div>
  )
}
