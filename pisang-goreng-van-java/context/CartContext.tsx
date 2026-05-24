'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export interface CartItem {
  productId: string
  name: string
  basePrice: number
  toppingName: string | null
  toppingPrice: number
  quantity: number
  notes: string
  totalPrice: number
  toppingId?: string | null
  baseType?: string
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'totalPrice'>) => void
  removeFromCart: (productId: string, toppingName: string | null, notes: string) => void
  updateQuantity: (productId: string, toppingName: string | null, notes: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [isDBLoaded, setIsDBLoaded] = useState(false)

  // 1. Initial Load (Local Storage & DB)
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    let initialLocalCart: CartItem[] = []
    if (savedCart) {
      try {
        initialLocalCart = JSON.parse(savedCart)
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e)
      }
    }

    if (status === 'authenticated') {
      // Sync from DB (menggunakan route handler karena NextAuth v4 bug di Server Actions)
      fetch('/api/cart', { cache: 'no-store', credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            // Jika ada cart dari local, gabungkan!
            if (initialLocalCart.length > 0) {
              const merged = mergeCarts(data.data, initialLocalCart)
              setCartItems(merged)
              localStorage.removeItem('cart') // Clear local after merge
              
              // We delay setting isDBLoaded to true so the next render can sync
              setTimeout(() => {
                setIsDBLoaded(true)
                syncToDB(merged)
              }, 100)
            } else {
              setCartItems(data.data)
              setTimeout(() => setIsDBLoaded(true), 100)
            }
          } else {
            console.error("GET /api/cart returned false success")
            // Jangan wipe DB jika gagal fetch!
          }
        })
        .catch((e) => {
          console.error("GET /api/cart throw error", e)
        })
    } else if (status === 'unauthenticated') {
      setCartItems(initialLocalCart)
    }

    setMounted(true)
  }, [status])

  // Helper for background sync
  const syncToDB = (items: CartItem[]) => {
    fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      credentials: 'include'
    }).catch(err => console.error("Failed to sync cart", err))
  }

  // 2. Auto-save side effect
  useEffect(() => {
    if (!mounted) return
    
    if (status === 'unauthenticated') {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    } else if (status === 'authenticated' && isDBLoaded) {
      // Sync to DB when cart changes
      syncToDB(cartItems)
    }
  }, [cartItems, mounted, status, isDBLoaded])

  const mergeCarts = (dbCart: CartItem[], localCart: CartItem[]) => {
    let merged = [...dbCart]
    localCart.forEach(localItem => {
      const existingIndex = merged.findIndex(
        (item) =>
          item.productId === localItem.productId &&
          item.toppingName === localItem.toppingName &&
          item.notes === localItem.notes
      )
      if (existingIndex > -1) {
        merged[existingIndex].quantity += localItem.quantity
        merged[existingIndex].totalPrice = (merged[existingIndex].basePrice + merged[existingIndex].toppingPrice) * merged[existingIndex].quantity
      } else {
        merged = [...merged, localItem]
      }
    })
    return merged
  }

  const addToCart = (newItem: Omit<CartItem, 'totalPrice'>) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.toppingName === newItem.toppingName &&
          item.notes === newItem.notes
      )

      const totalItemPrice = (newItem.basePrice + newItem.toppingPrice) * newItem.quantity

      if (existingIndex > -1) {
        const updated = [...prev]
        const existing = updated[existingIndex]
        const newQty = existing.quantity + newItem.quantity
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPrice: (existing.basePrice + existing.toppingPrice) * newQty,
        }
        return updated
      }
      return [...prev, { ...newItem, totalPrice: totalItemPrice }]
    })
  }

  const removeFromCart = (productId: string, toppingName: string | null, notes: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.productId === productId && item.toppingName === toppingName && item.notes === notes))
    )
  }

  const updateQuantity = (productId: string, toppingName: string | null, notes: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, toppingName, notes)
      return
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.toppingName === toppingName && item.notes === notes) {
          return {
            ...item,
            quantity,
            totalPrice: (item.basePrice + item.toppingPrice) * quantity,
          }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
