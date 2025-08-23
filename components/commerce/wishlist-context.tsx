"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type WishItem = { id: string; name: string; imageUrl?: string; price?: number }

type WishlistContextType = {
  items: WishItem[]
  has: (id: string) => boolean
  toggle: (item: WishItem) => void
  remove: (id: string) => void
  count: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
const STORAGE_KEY = "dmh_wishlist_v1"

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const has = (id: string) => items.some(i => i.id === id)
  const toggle = (item: WishItem) => setItems(prev => (has(item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]))
  const remove = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const count = useMemo(() => items.length, [items])

  return (
    <WishlistContext.Provider value={{ items, has, toggle, remove, count }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}


