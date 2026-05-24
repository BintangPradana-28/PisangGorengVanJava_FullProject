'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ProductType } from '@/src/features/menu/components/MenuCards'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface QuickViewModalProps {
  product: ProductType | null
  allProducts?: ProductType[]
  onClose: () => void
}

interface Topping {
  id: string
  name: string
  price: number
  emoji: string | null
  isActive: boolean
}

const AVAILABLE_TYPES = ['Kembung', 'Lumpia', 'Krispy']

export default function QuickViewModal({ product, allProducts = [], onClose }: QuickViewModalProps) {
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const isStoreOpen = getSetting('store_open', 'true') === 'true'
  const { data: session } = useSession()
  const isReseller = (session?.user as { role?: string })?.role === 'RESELLER'
  const router = useRouter()

  // State Management sesuai instruksi
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedFlavor, setSelectedFlavor] = useState<string>('')
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  
  const [toppingsData, setToppingsData] = useState<Topping[]>([])

  // Init state saat product berubah
  useEffect(() => {
    if (product) {
      setSelectedFlavor(product.flavorName)
      setSelectedType(AVAILABLE_TYPES[0])
      setQuantity(1)
      setSelectedToppings([])
      setNotes('')
    }
  }, [product])

  // Fetch toppings
  useEffect(() => {
    fetch('/api/toppings')
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setToppingsData(res.data.filter((top: Topping) => top.isActive))
        }
      })
      .catch(err => console.error('Failed to fetch toppings', err))
  }, [])

  const availableFlavors = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.flavorName)))
  }, [allProducts])

  const matchedProduct = useMemo(() => {
    if (!selectedFlavor) return null
    return allProducts.find(p => p.flavorName.toLowerCase() === selectedFlavor.toLowerCase()) || null
  }, [selectedFlavor, allProducts])

  if (!product) return null

  // Logika Harga
  const getProductPrice = (p: ProductType | null, type: string) => {
    if (!p) return 0
    if (type === 'Kembung') return isReseller && p.wholesaleKembung > 0 ? p.wholesaleKembung : p.priceKembung
    if (type === 'Lumpia') return isReseller && p.wholesaleLumpia > 0 ? p.wholesaleLumpia : p.priceLumpia
    if (type === 'Krispy') return isReseller && p.wholesaleKrispy > 0 ? p.wholesaleKrispy : p.priceKrispy
    return isReseller && p.wholesaleKembung > 0 ? p.wholesaleKembung : p.priceKembung
  }

  const basePrice = getProductPrice(matchedProduct || product, selectedType)
  const toppingsPrice = selectedToppings.reduce((sum, toppingId) => {
    const topping = toppingsData.find((t) => t.id === toppingId)
    return sum + (topping ? topping.price : 0)
  }, 0)

  const unitPrice = basePrice + toppingsPrice
  const totalPrice = unitPrice * quantity

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Handle Topping Toggle
  const handleToppingToggle = (toppingId: string) => {
    setSelectedToppings((prev) =>
      prev.includes(toppingId)
        ? prev.filter((id) => id !== toppingId)
        : [...prev, toppingId]
    )
  }

  const isFormValid = !!selectedType && !!selectedFlavor

  const handleAddToCart = () => {
    if (!isFormValid || !isStoreOpen) return

    const toppingName = selectedToppings.length > 0 
      ? selectedToppings.map(id => {
          const top = toppingsData.find(t => t.id === id)
          return top ? `${top.emoji || ''} ${top.name}`.trim() : ''
        }).filter(Boolean).join(' + ')
      : null

    const toppingId = selectedToppings.length > 0 ? selectedToppings[0] : null
    const finalProductId = matchedProduct ? matchedProduct.id : product.id
    const finalProductName = `${selectedFlavor} (${selectedType})`

    addToCart({
      productId: finalProductId,
      name: finalProductName,
      basePrice: basePrice,
      toppingName,
      toppingPrice: toppingsPrice,
      quantity,
      notes,
      toppingId
    })

    toast.success(t('toast_added'), {
      style: {
        background: 'var(--primary-custom)',
        color: '#fff',
        borderRadius: '16px',
      }
    })
    onClose()
  }

  const dynamicTitle = selectedFlavor && selectedType 
    ? `${selectedFlavor} (${selectedType})` 
    : product.flavorName

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div 
        className="relative w-full max-w-lg h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl transition-all duration-300 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal (Tetap di Atas) */}
        <div className="relative shrink-0 w-full aspect-video sm:h-48 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-zinc-800 dark:to-zinc-950 flex flex-col items-center justify-center">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={dynamicTitle}
              fill
              className="object-cover"
            />
          ) : (
            <div className="text-center p-6 z-10">
              <span className="text-5xl block mb-2">🍌</span>
              <div className="flex flex-col items-center gap-2">
                <span className="font-serif font-bold text-xl text-brown dark:text-amber-400 bg-white/80 dark:bg-zinc-900/80 px-4 py-1 rounded-full backdrop-blur-sm shadow-sm">
                  {dynamicTitle}
                </span>
                {(product.rating || product.reviewCount) ? (
                  <button onClick={() => { onClose(); router.push('/ulasan'); }} className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-white/80 dark:bg-zinc-900/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1 hover:text-[#D4802A] transition-colors cursor-pointer active:scale-95">
                    ⭐ {product.rating || 'Baru'} {product.reviewCount ? `(${product.reviewCount}) \u2192` : ''}
                  </button>
                ) : null}
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="absolute z-20 top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors focus:outline-none backdrop-blur-md"
            aria-label="Tutup modal"
          >
            ✕
          </button>
        </div>

        {/* Body (Bisa di-Scroll) */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50 dark:bg-zinc-900/50">
          
          {/* Section Tipe (Grid 3 kolom) */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg">Pilih Tipe <span className="text-red-500">*</span></h4>
              <span className="text-xs text-zinc-500 font-medium">Wajib dipilih</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {AVAILABLE_TYPES.map((type) => {
                const isSelected = selectedType === type
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all ${
                      isSelected 
                        ? 'border-[#D4802A] bg-[#D4802A]/10 text-[#D4802A]' 
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                    }`}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </div>


          {/* Section Topping (Grid 2 kolom) */}
          {toppingsData.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg">Ekstra Topping</h4>
                <span className="text-xs text-zinc-500 font-medium">Opsional</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {toppingsData.map((topping) => {
                  const isSelected = selectedToppings.includes(topping.id)
                  return (
                    <label
                      key={topping.id}
                      className={`flex flex-col p-3 border-2 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-[#D4802A] bg-[#D4802A]/5' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToppingToggle(topping.id)}
                          className="accent-[#D4802A] w-4 h-4 rounded"
                        />
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {topping.emoji} {topping.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 pl-6">
                        +{formatPrice(topping.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Catatan Khusus */}
          <div className="mb-2">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-lg mb-2">Catatan Khusus</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pisangnya digoreng garing ya..."
              className="w-full p-4 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl text-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#D4802A] transition-colors min-h-[80px]"
            />
          </div>


        </div>

        {/* Footer (Sticky Bottom) */}
        <div className="p-4 shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 w-full shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
          
          {/* Kontrol Kuantitas */}
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 rounded-full p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#D4802A] transition-colors active:scale-95"
            >
              -
            </button>
            <span className="w-6 text-center font-bold text-zinc-800 dark:text-zinc-100 text-lg">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-700 shadow-sm flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#D4802A] transition-colors active:scale-95"
            >
              +
            </button>
          </div>
          
          {/* Tombol Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!isFormValid || !isStoreOpen}
            className={`flex-1 py-3.5 px-4 rounded-full font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
              isFormValid && isStoreOpen
                ? 'bg-[#D4802A] hover:bg-[#b56d24] text-white active:scale-95 shadow-[#D4802A]/30' 
                : 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
            }`}
          >
            {!isStoreOpen ? (
              <>Toko Sedang Tutup</>
            ) : isFormValid ? (
              <>Tambah • {formatPrice(totalPrice)}</>
            ) : (
              <>Pilih Tipe & Rasa</>
            )}
          </button>

        </div>
      </div>
    </div>
  )
}
