'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useSettings } from '@/context/SettingsContext'
import toast from 'react-hot-toast'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart()
  const { t } = useLanguage()
  const { getSetting } = useSettings()
  const [address, setAddress] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const deliveryFee = parseInt(getSetting('store_delivery_fee', '0')) || 0
  const finalTotal = deliveryMethod === 'DELIVERY' ? cartTotal + deliveryFee : cartTotal

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Mohon isi nama dan nomor WhatsApp Anda.')
      return
    }

    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/
    if (!phoneRegex.test(customerPhone.trim())) {
      toast.error('Format nomor WhatsApp tidak valid (Contoh: 08123456789)')
      return
    }

    if (!consent) {
      toast.error('Anda harus menyetujui Kebijakan Privasi terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 1. SAVE TO POSTGRES FIRST (Zero-Trust)
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        notes: address.trim(),
        source: 'whatsapp',
        deliveryMethod,
        deliveryFee: deliveryMethod === 'DELIVERY' ? deliveryFee : 0,
        items: cartItems.map(item => ({
          variantId: item.productId,
          toppingId: item.toppingId || null,
          baseType: item.name.split('(')[1]?.replace(')', '').trim() || 'Kembung',
          quantity: item.quantity,
          unitPrice: item.basePrice,
          toppingPrice: item.toppingPrice || 0
        }))
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pesanan')

      // 2. SERVER-GENERATED REDIRECT
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank')
      }
      
      clearCart()
      toast.success('Pesanan berhasil dibuat! Silakan lanjutkan di WhatsApp.')
      onClose()
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan saat memproses pesanan.')
      console.error('[CHECKOUT_ERROR]', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-cream-200/40 dark:border-zinc-800 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛒</span>
                <h3 className="font-serif text-xl font-bold text-brown dark:text-zinc-100">
                  {t('cart_title')}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 flex items-center justify-center transition-colors focus:outline-none"
                aria-label="Tutup keranjang"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                  <span className="text-4xl mb-2">🛍️</span>
                  <p className="text-sm font-medium">{t('cart_empty')}</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.toppingName || 'none'}-${index}`}
                    className="p-4 border border-zinc-100 dark:border-zinc-850 bg-zinc-50/40 dark:bg-zinc-800/20 rounded-2xl flex flex-col gap-2 relative"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-sans text-sm font-bold text-zinc-800 dark:text-zinc-100">
                          {item.name}
                        </h4>
                        {item.toppingName && (
                          <span className="text-xs text-secondary font-medium block">
                            + {t('cart_topping')}: {item.toppingName}
                          </span>
                        )}
                        {item.notes && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 italic">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.productId, item.toppingName, item.notes)}
                        className="text-zinc-400 hover:text-red-500 transition-colors text-xs"
                        aria-label="Hapus item"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100/50 dark:border-zinc-800/30">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.toppingName, item.notes, item.quantity - 1)}
                          className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.toppingName, item.notes, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm font-bold text-brown dark:text-amber-400">
                        {formatPrice(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Form & Checkout Actions */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-zinc-100 dark:bg-zinc-900/60 dark:border-zinc-800 bg-zinc-50/50 space-y-4">
                {/* Customer Info Area */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama Anda..."
                      className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    />
                  </div>
                </div>

                {/* Notes/Address Area */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                    Metode Pengiriman
                  </label>
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => setDeliveryMethod('DELIVERY')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${deliveryMethod === 'DELIVERY' ? 'bg-amber-100/50 text-amber-800 border-amber-300' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>
                      🛵 Pesan Antar
                    </button>
                    <button 
                      onClick={() => setDeliveryMethod('PICKUP')}
                      className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${deliveryMethod === 'PICKUP' ? 'bg-amber-100/50 text-amber-800 border-amber-300' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>
                      🏪 Ambil Sendiri
                    </button>
                  </div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                    Catatan {deliveryMethod === 'DELIVERY' ? 'Pengiriman / Alamat Lengkap *' : 'Tambahan (Opsional)'}
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={deliveryMethod === 'DELIVERY' ? "Masukkan alamat pengiriman lengkap Anda..." : "Catatan untuk penjual..."}
                    className="w-full p-3 border border-zinc-200 dark:border-zinc-800 bg-transparent rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-secondary/40 min-h-[60px]"
                  />
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 my-2" />

                {/* Total and CTA */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatPrice(cartTotal)}</span>
                  </div>
                  {deliveryMethod === 'DELIVERY' && deliveryFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">Ongkos Kirim</span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      Total Akhir
                    </span>
                    <span className="text-xl font-bold text-brown dark:text-amber-400">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="privacy-consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 shrink-0 accent-brown w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="privacy-consent" className="text-[10px] text-zinc-500 cursor-pointer">
                    Saya menyetujui data saya disimpan sesuai Kebijakan Privasi perusahaan untuk keperluan pemesanan.
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#2E7D32] hover:bg-[#236026] text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md active:scale-95 text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Memproses...' : (
                    <>
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      {t('cart_checkout')}
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
