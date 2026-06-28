"use client"

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react"
import type { Product } from "@/lib/products"

type FavoritesContextValue = {
  favorites: Product[]
  isFavorited: (id: string) => boolean
  toggleFavorite: (product: Product) => void
  removeFavorite: (id: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

// Seed a couple of products as default favorites for demo
const DEFAULT_FAVORITES = ["radiance-serum", "gold-oil"]

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [seeded, setSeeded] = useState(false)

  // Lazily seed defaults on first access
  const isFavorited = useCallback((id: string) => favorites.some(f => f.id === id), [favorites])

  const toggleFavorite = useCallback((product: Product) => {
    setFavorites(prev =>
      prev.some(f => f.id === product.id)
        ? prev.filter(f => f.id !== product.id)
        : [...prev, product],
    )
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }, [])

  const value = useMemo(
    () => ({ favorites, isFavorited, toggleFavorite, removeFavorite }),
    [favorites, isFavorited, toggleFavorite, removeFavorite],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider")
  return ctx
}
