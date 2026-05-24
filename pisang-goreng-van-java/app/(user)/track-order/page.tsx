'use client'

// app/(user)/track-order/page.tsx
// Upgraded: Added "Pesan Lagi" (Reorder) button that pushes all items to cart.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import toast from 'react-hot-toast'

const STATUS_STEPS = ['pending', 'confirmed', 'ready', 'done']
const STATUS_ICONS: Record<string, string> = {
  pending:   '⏳',
  confirmed: '✅',
  ready:     '🍌',
  done:      '🎉',
  cancelled: '❌',
}

interface OrderItem {
  baseType: string
  quantity:  number
  subtotal:  number
  variant: { flavorName?: string; nama_varian?: string }
  topping?: { name: string; emoji?: string } | null
}

interface Order {
  id:           string
  customerName: string
  status:       string
  totalPrice:   number
  createdAt:    string
  items:        OrderItem[]
}

// ── Reorder Button ─────────────────────────────────────────────────────────────
function ReorderButton({ order }: { order: Order }) {
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handleReorder = async () => {
    setLoading(true)
    try {
      // Fetch current prices from the menu API to avoid stale price data
      const res  = await fetch('/api/menu')
      const json = await res.json()
      const liveProducts: Array<{
        id: string
        flavorName: string
        priceKembung: number
        priceLumpia:  number
        priceKrispy:  number
        isAvailable:  boolean
      }> = json.data ?? json ?? []

      let addedCount  = 0
      let skippedCount = 0

      for (const item of order.items) {
        const variantName = item.variant.flavorName ?? item.variant.nama_varian ?? ''
        const live = liveProducts.find(
          (p) => p.flavorName.toLowerCase() === variantName.toLowerCase()
        )

        if (!live || !live.isAvailable) {
          skippedCount++
          continue
        }

        // Resolve base price by baseType
        const baseType  = item.baseType as 'kembung' | 'lumpia' | 'krispy'
        const priceMap  = { kembung: live.priceKembung, lumpia: live.priceLumpia, krispy: live.priceKrispy }
        const basePrice = priceMap[baseType] ?? live.priceKembung

        addToCart({
          productId:    live.id,
          name:         `${variantName} (${item.baseType})`,
          basePrice,
          toppingName:  item.topping?.name  ?? null,
          toppingPrice: item.topping ? 2000 : 0,
          toppingId:    null,
          quantity:     item.quantity,
          notes:        '',
        })
        addedCount++
      }

      if (addedCount > 0 && skippedCount === 0) {
        toast.success(`🛒 ${addedCount} item ditambahkan ke keranjang!`)
      } else if (addedCount > 0 && skippedCount > 0) {
        toast.success(`🛒 ${addedCount} item ditambahkan. ${skippedCount} item habis/tidak tersedia.`, { duration: 4000 })
      } else {
        toast.error('Semua item dalam pesanan ini sedang tidak tersedia.')
      }
    } catch {
      toast.error('Gagal memuat data menu. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReorder}
      disabled={loading || order.status === 'cancelled'}
      title={order.status === 'cancelled' ? 'Pesanan dibatalkan' : 'Tambahkan semua item ke keranjang'}
      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: order.status === 'cancelled' ? 'var(--surface-custom)' : '#D4802A',
        color:      order.status === 'cancelled' ? 'var(--text-custom)'    : 'white',
      }}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        '🛒'
      )}
      {loading ? 'Memproses...' : 'Pesan Lagi'}
    </button>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { t, locale }                        = useLanguage()
  const [phone,   setPhone]                  = useState('')
  const [orders,  setOrders]                 = useState<Order[] | null>(null)
  const [loading, setLoading]                = useState(false)
  const [error,   setError]                  = useState('')

  const STATUS_LABELS: Record<string, string> = {
    pending:   t('status_pending'),
    confirmed: t('status_confirmed'),
    ready:     t('status_ready'),
    done:      t('status_done'),
    cancelled: t('status_cancelled'),
  }

  const handleSearch = async () => {
    if (!phone.trim()) { setError(t('track_toast_invalid_phone')); return }
    setLoading(true); setError(''); setOrders(null)
    try {
      const res  = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone.trim())}`)
      const data = await res.json()
      if (data.success) setOrders(data.data)
      else setError(data.error || t('track_toast_not_found'))
    } catch {
      setError(t('track_toast_conn_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen py-16 px-4" style={{ background: 'var(--background-custom)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📦</div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--text-custom)' }}>
            {t('track_title')}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-custom)', opacity: 0.6 }}>
            {t('track_desc')}
          </p>
        </div>

        {/* Search box */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200/60 dark:border-zinc-800 shadow-sm mb-6">
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('track_placeholder')}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              style={{ color: 'var(--text-custom)' }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-60 transition-all active:scale-95"
              style={{ background: '#D4802A' }}
            >
              {loading ? '...' : t('track_btn_check')}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">⚠️ {error}</p>}
        </div>

        {/* Results */}
        <AnimatePresence>
          {orders && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-custom)', opacity: 0.5 }}>
                  <div className="text-4xl mb-2">🔍</div>
                  <p>{t('track_empty')}</p>
                </div>
              ) : (
                orders.map((order) => {
                  const stepIdx   = STATUS_STEPS.indexOf(order.status)
                  const cancelled = order.status === 'cancelled'
                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 p-5 shadow-sm"
                    >
                      {/* Order header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-custom)' }}>
                            {order.customerName}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: 'var(--text-custom)', opacity: 0.5 }}>
                            {new Date(order.createdAt).toLocaleDateString(
                              locale === 'id' ? 'id-ID' : 'en-US',
                              { day: 'numeric', month: 'long', year: 'numeric' }
                            )}
                          </div>
                        </div>
                        <span className="text-2xl">{STATUS_ICONS[order.status]}</span>
                      </div>

                      {/* Progress bar */}
                      {!cancelled && (
                        <div className="flex items-center gap-1 mb-4">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex items-center flex-1 last:flex-none">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i <= stepIdx ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                                {i + 1}
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-1 rounded transition-colors ${i < stepIdx ? 'bg-amber-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status label */}
                      <div className="text-sm font-semibold mb-3" style={{ color: '#D4802A' }}>
                        {STATUS_LABELS[order.status]}
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span style={{ color: 'var(--text-custom)', opacity: 0.8 }}>
                              {item.variant.flavorName ?? item.variant.nama_varian} ({item.baseType})
                              {item.topping && (
                                <span style={{ opacity: 0.55 }}>
                                  {' '}+ {item.topping.emoji} {item.topping.name}
                                </span>
                              )}
                              {' '}×{item.quantity}
                            </span>
                            <span className="font-medium" style={{ color: 'var(--text-custom)' }}>
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold pt-2 border-t border-zinc-100 dark:border-zinc-800">
                          <span style={{ color: 'var(--text-custom)' }}>{t('track_total')}</span>
                          <span style={{ color: '#D4802A' }}>{formatPrice(order.totalPrice)}</span>
                        </div>
                      </div>

                      {/* ── Reorder CTA ─────────────────────────────────── */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <ReorderButton order={order} />
                      </div>
                    </div>
                  )
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
