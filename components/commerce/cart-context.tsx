"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

type CartContextType = {
  items: CartItem[]
  totalQuantity: number
  subtotal: number
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = "dmh_cart_v1"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateQuantity = (id: string, quantity: number) => setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i))
  const clear = () => setItems([])

  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items])

  const value: CartContextType = { items, totalQuantity, subtotal, addItem, removeItem, updateQuantity, clear }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}


