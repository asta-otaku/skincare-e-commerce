"use client"

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react"
import type { Product } from "@/lib/products"

export type CartItem = Product & { quantity: number }

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  lastAdded: string | null
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setLastAdded(product.id)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setLastAdded(null)
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])

  const value = useMemo(
    () => ({ items, count, subtotal, lastAdded, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart }),
    [items, count, subtotal, lastAdded, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart],
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
