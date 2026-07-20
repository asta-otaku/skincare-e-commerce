"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, Eye, EyeOff, Plus, Trash2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getProfile, updateProfile, updatePassword, updatePreferences,
  getAddresses, addAddress, deleteAddress,
  DEFAULT_PREFS,
  type Profile, type Address, type NotificationPrefs,
} from "@/lib/supabase/profile"

type Section = "profile" | "password" | "addresses" | "preferences"

export default function AccountSettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile")
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)

  // Profile form state
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Password form state
  const [passwords, setPasswords] = useState({ next: "", confirm: "" })
  const [showNext, setShowNext] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)

  // Address form state
  const [addingAddress, setAddingAddress] = useState(false)
  const [newAddr, setNewAddr] = useState<Omit<Address, "id" | "is_default">>({
    label: "Home", full_name: "", line1: "", city: "", state: "", country: "Nigeria",
  })
  const [addrSaving, setAddrSaving] = useState(false)

  const [prefs, setPrefs] = useState<NotificationPrefs>({ ...DEFAULT_PREFS })
  const [prefsSaving, setPrefsSaving] = useState(false)
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [profile, addrs] = await Promise.all([getProfile(), getAddresses()])
    setProfileData(profile)
    setFullName(profile?.full_name ?? "")
    setPhone(profile?.phone ?? "")
    if (profile?.preferences) setPrefs(profile.preferences)
    setAddresses(addrs)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleProfileSave() {
    setProfileSaving(true)
    setProfileMsg(null)
    const err = await updateProfile({ full_name: fullName, phone })
    setProfileMsg(err ? { ok: false, text: err } : { ok: true, text: "Profile saved." })
    setProfileSaving(false)
    setTimeout(() => setProfileMsg(null), 3000)
  }

  async function handlePasswordSave() {
    if (passwords.next !== passwords.confirm) {
      setPwMsg({ ok: false, text: "Passwords do not match." })
      return
    }
    if (passwords.next.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    const err = await updatePassword(passwords.next)
    setPwMsg(err ? { ok: false, text: err } : { ok: true, text: "Password updated successfully." })
    setPwSaving(false)
    if (!err) setPasswords({ next: "", confirm: "" })
    setTimeout(() => setPwMsg(null), 3000)
  }

  async function handleAddAddress() {
    if (!newAddr.line1 || !newAddr.city) return
    setAddrSaving(true)
    const err = await addAddress({ ...newAddr, is_default: addresses.length === 0 })
    if (!err) {
      await load()
      setAddingAddress(false)
      setNewAddr({ label: "Home", full_name: fullName, line1: "", city: "", state: "", country: "Nigeria" })
    }
    setAddrSaving(false)
  }

  async function handleDeleteAddress(id: string) {
    await deleteAddress(id)
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  const SECTIONS: { id: Section; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "addresses", label: "Addresses" },
    { id: "preferences", label: "Preferences" },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/50 animate-pulse" />
        <div className="h-4 w-64 bg-muted/30 animate-pulse" />
        <div className="h-24 w-full bg-muted/20 animate-pulse mt-6" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-medium">Account Settings</h2>
        <p className="mt-1 text-sm font-light text-muted-foreground">Manage your profile, security, and preferences.</p>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 border-b border-border pb-px overflow-x-auto">
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
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="input-field"
            />
          </Field>
          <Field label="Email Address">
            <div className="relative">
              <input
                type="email"
                value={profileData?.email ?? ""}
                disabled
                className="input-field opacity-60 cursor-not-allowed pr-32"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-light uppercase tracking-[0.12em] text-muted-foreground">
                Managed by Auth
              </span>
            </div>
          </Field>
          <Field label="Phone Number">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="input-field"
            />
          </Field>
          {profileMsg && (
            <p className={cn("text-xs px-4 py-2.5 border", profileMsg.ok
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-destructive bg-destructive/10 border-destructive/20"
            )}>
              {profileMsg.text}
            </p>
          )}
          <SaveButton onClick={handleProfileSave} loading={profileSaving} />
        </section>
      )}

      {/* Password */}
      {activeSection === "password" && (
        <section className="space-y-5">
          <p className="text-sm font-light text-muted-foreground">
            Enter a new password below. You will remain signed in on this device.
          </p>
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
              placeholder="••••••••"
              className={cn(
                "input-field",
                passwords.confirm && passwords.confirm !== passwords.next
                  ? "border-destructive focus:border-destructive" : "",
              )}
            />
          </Field>
          {pwMsg && (
            <p className={cn("text-xs px-4 py-2.5 border", pwMsg.ok
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-destructive bg-destructive/10 border-destructive/20"
            )}>
              {pwMsg.text}
            </p>
          )}
          <SaveButton onClick={handlePasswordSave} loading={pwSaving} label="Update Password" />
        </section>
      )}

      {/* Addresses */}
      {activeSection === "addresses" && (
        <section className="space-y-4">
          {addresses.length === 0 && !addingAddress && (
            <p className="text-sm font-light text-muted-foreground">No saved addresses yet.</p>
          )}
          {addresses.map(addr => (
            <div key={addr.id} className={cn("border p-5", addr.is_default ? "border-gold/40 bg-gold/5" : "border-border")}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-[0.15em]">{addr.label}</span>
                  {addr.is_default && (
                    <span className="border border-gold/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-gold-foreground bg-gold/10">
                      Default
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  disabled={addr.is_default}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="text-sm font-light text-muted-foreground leading-relaxed pl-6">
                <p className="font-medium text-foreground">{addr.full_name}</p>
                <p>{addr.line1}{addr.line2 && `, ${addr.line2}`}</p>
                <p>{addr.city}, {addr.state}</p>
                <p>{addr.country}</p>
                {addr.phone && <p>{addr.phone}</p>}
              </div>
            </div>
          ))}

          {addingAddress ? (
            <div className="border border-border p-5 space-y-4">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em]">New Address</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Label">
                  <input type="text" value={newAddr.label} onChange={e => setNewAddr(a => ({ ...a, label: e.target.value }))} placeholder="Home / Work" className="input-field" />
                </Field>
                <Field label="Full Name">
                  <input type="text" value={newAddr.full_name} onChange={e => setNewAddr(a => ({ ...a, full_name: e.target.value }))} className="input-field" />
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
                <Field label="Country"><input type="text" value={newAddr.country} onChange={e => setNewAddr(a => ({ ...a, country: e.target.value }))} className="input-field" /></Field>
                <Field label="Phone (optional)"><input type="tel" value={newAddr.phone ?? ""} onChange={e => setNewAddr(a => ({ ...a, phone: e.target.value }))} className="input-field" /></Field>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddAddress}
                  disabled={addrSaving || !newAddr.line1 || !newAddr.city}
                  className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-50"
                >
                  {addrSaving ? "Saving…" : "Save Address"}
                </button>
                <button type="button" onClick={() => setAddingAddress(false)} className="border border-border px-5 py-2.5 text-xs font-light uppercase tracking-[0.15em] hover:border-foreground transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setNewAddr(a => ({ ...a, full_name: fullName })); setAddingAddress(true) }}
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
                { key: "newsletter",   label: "Newsletter & editorial",  desc: "Skincare tips, guides, and HAYDA SKINCo. news" },
                { key: "orderUpdates", label: "Order updates",           desc: "Shipping confirmations and delivery status" },
                { key: "newProducts",  label: "New product launches",    desc: "Be first to know about new arrivals" },
                { key: "saleAlerts",   label: "Promotions & offers",     desc: "Exclusive offers for HAYDA SKINCo. members" },
              ] as const).map(({ key, label, desc }) => (
                <label key={key} className="flex cursor-pointer items-start justify-between gap-4 border border-border p-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs font-light text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                  <div
                    onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={cn(
                      "relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-all",
                      prefs[key] ? "border-gold bg-gold" : "border-border bg-background",
                    )}
                  >
                    <span className={cn("absolute top-0.5 size-3 rounded-full bg-background transition-all", prefs[key] ? "left-3.5 bg-gold-foreground" : "left-0.5")} />
                  </div>
                </label>
              ))}
            </div>
          </div>
          {prefsMsg && (
            <p className={cn("text-xs px-4 py-2.5 border", prefsMsg.ok
              ? "text-green-700 bg-green-50 border-green-200"
              : "text-destructive bg-destructive/10 border-destructive/20"
            )}>
              {prefsMsg.text}
            </p>
          )}
          <SaveButton
            onClick={async () => {
              setPrefsSaving(true)
              setPrefsMsg(null)
              const err = await updatePreferences(prefs)
              setPrefsMsg(err ? { ok: false, text: err } : { ok: true, text: "Preferences saved." })
              setPrefsSaving(false)
              setTimeout(() => setPrefsMsg(null), 3000)
            }}
            loading={prefsSaving}
            label="Save Preferences"
          />
        </section>
      )}

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          font-weight: 300;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-color: hsl(var(--foreground)); }
      `}</style>
    </div>
  )
}

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
  onShow: () => void; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder="••••••••" className="input-field pr-11" />
        <button type="button" onClick={onShow} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  )
}

function SaveButton({ onClick, loading, label = "Save Changes" }: { onClick: () => void | Promise<void>; loading: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] transition-all",
        loading
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-foreground text-background hover:bg-gold hover:text-gold-foreground",
      )}
    >
      {loading ? (
        <span className="size-3.5 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
      ) : (
        <><Check className="size-3.5" /> {label}</>
      )}
    </button>
  )
}
