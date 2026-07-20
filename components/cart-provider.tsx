"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"
import { useUserAuth } from "@/components/user-auth-provider"
import {
  clearCartItems,
  fetchCartItems,
  mergeGuestCartIntoServer,
  removeCartItem,
  upsertCartItem,
  type CartItem,
} from "@/lib/supabase/cart"

export type { CartItem }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  lastAdded: string | null
  isOpen: boolean
  loading: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

/** Guest-only scratch pad until sign-in (then merged into DB and cleared). */
const GUEST_KEY = "hayda-cart-guest-v1"

function readGuestCart(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(i => i && typeof i.id === "string" && Number(i.quantity) > 0)
  } catch {
    return []
  }
}

function writeGuestCart(items: CartItem[]) {
  try {
    if (!items.length) localStorage.removeItem(GUEST_KEY)
    else localStorage.setItem(GUEST_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { session } = useUserAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const syncReady = useRef(false)

  // Hydrate from Supabase when signed in; guest cart only while signed out
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      syncReady.current = false
      if (session) {
        const guest = readGuestCart()
        const merged = guest.length
          ? await mergeGuestCartIntoServer(guest)
          : await fetchCartItems()
        if (guest.length) writeGuestCart([])
        // Also drop legacy localStorage key from earlier Priority 3
        try { localStorage.removeItem("hayda-cart-v1") } catch { /* ignore */ }
        if (!cancelled) setItems(merged)
      } else {
        if (!cancelled) setItems(readGuestCart())
      }
      if (!cancelled) {
        syncReady.current = true
        setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [session])

  // Persist guest cart only (signed-in cart is written on each mutation)
  useEffect(() => {
    if (!syncReady.current || session) return
    writeGuestCart(items)
  }, [items, session])

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      const nextQty = (existing?.quantity ?? 0) + 1
      const next = existing
        ? prev.map((item) =>
            item.id === product.id ? { ...item, ...product, quantity: nextQty } : item,
          )
        : [...prev, { ...product, quantity: 1 }]

      if (session) {
        void upsertCartItem(product, nextQty)
      }
      return next
    })
    setLastAdded(product.id)
  }, [session])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (session) void removeCartItem(id)
  }, [session])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) => {
      const current = prev.find((item) => item.id === id)
      if (!current) return prev

      if (quantity < 1) {
        if (session) void removeCartItem(id)
        return prev.filter((item) => item.id !== id)
      }

      if (session) void upsertCartItem(current, quantity)
      return prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    })
  }, [session])

  const clearCart = useCallback(() => {
    setItems([])
    setLastAdded(null)
    if (session) void clearCartItems()
    else writeGuestCart([])
  }, [session])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      lastAdded,
      isOpen,
      loading,
      openCart,
      closeCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, count, subtotal, lastAdded, isOpen, loading, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
