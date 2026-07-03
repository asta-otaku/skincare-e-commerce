"use client"

import { useState } from "react"
import { Check, Eye, EyeOff, Plus, Trash2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type Address = {
  id: string
  label: string
  name: string
  line1: string
  line2?: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr1",
    label: "Home",
    name: "Sophie Laurent",
    line1: "12 Rue de Rivoli",
    city: "Paris",
    state: "Île-de-France",
    zip: "75001",
    country: "France",
    isDefault: true,
  },
]

type Section = "profile" | "password" | "addresses" | "preferences"

export default function AccountSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile")
  const [saved, setSaved] = useState<Section | null>(null)

  // Profile form
  const [profile, setProfile] = useState({ name: "Sophie Laurent", email: "sophie@example.com", phone: "+33 6 12 34 56 78" })
  // Password form
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  // Addresses
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES)
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddr, setNewAddr] = useState<Partial<Address>>({ label: "", name: "Sophie Laurent", line1: "", city: "", state: "", zip: "", country: "France", isDefault: false })
  // Preferences
  const [prefs, setPrefs] = useState({ newsletter: true, orderUpdates: true, newProducts: false, saleAlerts: true })

  async function handleSave(section: Section) {
    await new Promise(r => setTimeout(r, 600))
    setSaved(section)
    setTimeout(() => setSaved(null), 2500)
  }

  const SECTIONS: { id: Section; label: string }[] = [
    { id: "profile",     label: "Profile" },
    { id: "password",    label: "Password" },
    { id: "addresses",   label: "Addresses" },
    { id: "preferences", label: "Preferences" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium">Account Settings</h2>
        <p className="mt-1 text-sm font-light text-muted-foreground">Manage your profile, security, and preferences.</p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-border pb-px overflow-x-auto no-scrollbar">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={cn(
              "shrink-0 pb-3 px-1 text-xs font-light uppercase tracking-[0.15em] transition-colors border-b-2 -mb-px",
              activeSection === s.id
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeSection === "profile" && (
        <section className="space-y-5">
          <Field label="Full Name">
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              className="input-field"
            />
          </Field>
          <Field label="Email Address">
            <div className="relative">
              <input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="input-field"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-light uppercase tracking-[0.12em] text-muted-foreground">
                Supabase Auth
              </span>
            </div>
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="input-field"
            />
          </Field>
          <SaveButton onClick={() => handleSave("profile")} saved={saved === "profile"} />
        </section>
      )}

      {/* Password */}
      {activeSection === "password" && (
        <section className="space-y-5">
          <p className="text-sm font-light text-muted-foreground">
            Password changes will be handled by <span className="font-medium text-foreground">Supabase Auth</span> once integrated.
          </p>
          <PasswordField
            label="Current Password"
            value={passwords.current}
            show={showCurrent}
            onShow={() => setShowCurrent(v => !v)}
            onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
          />
          <PasswordField
            label="New Password"
            value={passwords.next}
            show={showNext}
            onShow={() => setShowNext(v => !v)}
            onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
          />
          <Field label="Confirm New Password">
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className={cn(
                "input-field",
                passwords.confirm && passwords.confirm !== passwords.next
                  ? "border-destructive focus:border-destructive"
                  : "",
              )}
            />
          </Field>
          <SaveButton onClick={() => handleSave("password")} saved={saved === "password"} label="Update Password" />
        </section>
      )}

      {/* Addresses */}
      {activeSection === "addresses" && (
        <section className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className={cn("border p-5", addr.isDefault ? "border-gold/40 bg-gold/5" : "border-border")}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em]">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="border border-gold/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-gold-foreground bg-gold/10">
                      Default
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  disabled={addr.isDefault}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="text-sm font-light text-muted-foreground leading-relaxed pl-6">
                <p className="font-medium text-foreground">{addr.name}</p>
                <p>{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                <p>{addr.city}, {addr.state} {addr.zip}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          ))}

          {/* Add address form */}
          {addingAddress ? (
            <div className="border border-border p-5 space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em]">New Address</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Label (e.g. Home)">
                  <input type="text" value={newAddr.label} onChange={e => setNewAddr(a => ({ ...a, label: e.target.value }))} className="input-field" />
                </Field>
                <Field label="Full Name">
                  <input type="text" value={newAddr.name} onChange={e => setNewAddr(a => ({ ...a, name: e.target.value }))} className="input-field" />
                </Field>
              </div>
              <Field label="Address Line 1">
                <input type="text" value={newAddr.line1} onChange={e => setNewAddr(a => ({ ...a, line1: e.target.value }))} className="input-field" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City"><input type="text" value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} className="input-field" /></Field>
                <Field label="State"><input type="text" value={newAddr.state} onChange={e => setNewAddr(a => ({ ...a, state: e.target.value }))} className="input-field" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ZIP"><input type="text" value={newAddr.zip} onChange={e => setNewAddr(a => ({ ...a, zip: e.target.value }))} className="input-field" /></Field>
                <Field label="Country"><input type="text" value={newAddr.country} onChange={e => setNewAddr(a => ({ ...a, country: e.target.value }))} className="input-field" /></Field>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!newAddr.line1 || !newAddr.city) return
                    setAddresses(prev => [...prev, { ...newAddr, id: `addr${Date.now()}`, isDefault: false } as Address])
                    setAddingAddress(false)
                    setNewAddr({ label: "", name: "Sophie Laurent", line1: "", city: "", state: "", zip: "", country: "France", isDefault: false })
                  }}
                  className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Save Address
                </button>
                <button type="button" onClick={() => setAddingAddress(false)} className="border border-border px-5 py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingAddress(true)}
              className="flex w-full items-center justify-center gap-2 border border-dashed border-border py-4 text-xs font-light uppercase tracking-[0.15em] text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              <Plus className="size-3.5" /> Add New Address
            </button>
          )}
        </section>
      )}

      {/* Preferences */}
      {activeSection === "preferences" && (
        <section className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-[0.18em]">Email Notifications</h3>
            <div className="space-y-3">
              {([
                { key: "newsletter",    label: "Newsletter & editorial",   desc: "Skincare tips, guides, and HAYDA SKINCo. news" },
                { key: "orderUpdates",  label: "Order updates",            desc: "Shipping confirmations and delivery status" },
                { key: "newProducts",   label: "New product launches",     desc: "Be first to know about new arrivals" },
                { key: "saleAlerts",    label: "Promotions & offers",      desc: "Exclusive offers for HAYDA SKINCo. members" },
              ] as const).map(({ key, label, desc }) => (
                <label key={key} className="flex cursor-pointer items-start justify-between gap-4 border border-border p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs font-light text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <div
                    onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      "relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-200",
                      prefs[key] ? "border-gold bg-gold" : "border-border bg-background",
                    )}
                  >
                    <span className={cn(
                      "absolute top-0.5 size-3 rounded-full bg-background transition-all duration-200",
                      prefs[key] ? "left-3.5 bg-gold-foreground" : "left-0.5",
                    )} />
                  </div>
                </label>
              ))}
            </div>
          </div>
          <SaveButton onClick={() => handleSave("preferences")} saved={saved === "preferences"} label="Save Preferences" />
        </section>
      )}
    </div>
  )
}

/* ─── Shared helpers ───────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-light uppercase tracking-[0.15em] text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function PasswordField({ label, value, show, onShow, onChange }: {
  label: string; value: string; show: boolean
  onShow: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="input-field pr-11"
        />
        <button type="button" onClick={onShow} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  )
}

function SaveButton({ onClick, saved, label = "Save Changes" }: { onClick: () => void; saved: boolean; label?: string }) {
  const [loading, setLoading] = useState(false)
  async function handle() {
    setLoading(true)
    await onClick()
    setLoading(false)
  }
  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all",
        saved
          ? "bg-green-600 text-white"
          : loading
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
      )}
    >
      {saved ? (
        <><Check className="size-3.5" /> Saved</>
      ) : loading ? (
        <span className="size-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
      ) : label}
    </button>
  )
}
