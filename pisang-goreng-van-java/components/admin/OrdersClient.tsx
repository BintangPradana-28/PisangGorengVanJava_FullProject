'use client'
// components/admin/OrdersClient.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'done' | 'cancelled'

interface OrderItem { id: string; baseType: string; quantity: number; unitPrice: number; subtotal: number; variant: { flavorName: string }; topping?: { name: string; emoji?: string } | null }
interface Order { id: string; customerName: string; customerPhone: string; totalPrice: number; status: string; notes?: string | null; source: string; createdAt: string; deliveryMethod: string; deliveryFee: number; items: OrderItem[] }

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
  pending:   { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', next: 'confirmed'  },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-700',  next: 'ready'      },
  ready:     { label: 'Siap',       color: 'bg-purple-100 text-purple-700', next: 'done'       },
  done:      { label: 'Selesai',    color: 'bg-green-100 text-green-700'                       },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700'                          },
}

const SOURCE_ICON: Record<string, string> = { whatsapp: '💬', 'walk-in': '🚶', phone: '📞' }

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders,     setOrders]     = useState<Order[]>(initialOrders)
  const [filter,     setFilter]     = useState<string>('all')
  const [search,     setSearch]     = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updating,   setUpdating]   = useState<string | null>(null)

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        o.customerPhone.includes(search)
    return matchStatus && matchSearch
  })

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    try {
      const res  = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
        toast.success(`Status diubah ke: ${STATUS_CONFIG[status as OrderStatus]?.label}`)
      } else toast.error(data.error || 'Gagal update')
    } catch { toast.error('Koneksi bermasalah') }
    finally { setUpdating(null) }
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Hapus order ini?')) return
    try {
      const res  = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { setOrders(prev => prev.filter(o => o.id !== id)); toast.success('Order dihapus') }
      else toast.error(data.error)
    } catch { toast.error('Gagal menghapus') }
  }

  const openWhatsApp = (order: Order) => {
    const items = order.items.map(i => `• ${i.variant.flavorName} (${i.baseType})${i.topping ? ` + ${i.topping.emoji || ''} ${i.topping.name}` : ''} ×${i.quantity} = ${formatPrice(i.subtotal)}`).join('\n')
    const msg = encodeURIComponent(`Halo ${order.customerName}! 🍌\n\nKonfirmasi pesanan Anda:\n${items}\n\nTotal: ${formatPrice(order.totalPrice)}\n\nTerima kasih!`)
    window.open(`https://wa.me/${order.customerPhone}?text=${msg}`, '_blank')
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brown-700">Manajemen Order</h1>
          <p className="text-xs text-brown-400 mt-0.5">{orders.length} total pesanan</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Cari nama / nomor..." className="form-input flex-1 sm:w-48" />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === s ? 'bg-brown-700 text-white border-brown-700' : 'bg-white text-brown-500 border-cream-200 hover:border-brown-300'
            }`}>
            {s === 'all' ? `Semua (${orders.length})` : `${STATUS_CONFIG[s as OrderStatus]?.label} (${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Pendapatan', value: formatPrice(orders.filter(o=>o.status==='done').reduce((s,o)=>s+o.totalPrice,0)), icon: '💰' },
          { label: 'Order Selesai',    value: orders.filter(o=>o.status==='done').length,      icon: '✅' },
          { label: 'Order Aktif',      value: orders.filter(o=>['pending','confirmed','ready'].includes(o.status)).length, icon: '🔥' },
          { label: 'Via WhatsApp',     value: orders.filter(o=>o.source==='whatsapp').length,  icon: '💬' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-cream-200 shadow-sm">
            <div className="text-xl mb-1">{icon}</div>
            <div className="font-serif text-xl font-bold text-brown-700">{value}</div>
            <div className="text-xs text-brown-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-200 p-12 text-center text-brown-300">
            <div className="text-4xl mb-2">📋</div>
            <div className="font-medium">Tidak ada order ditemukan</div>
          </div>
        ) : filtered.map(order => {
          const cfg  = STATUS_CONFIG[order.status as OrderStatus]
          const isEx = expandedId === order.id
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isEx ? null : order.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-brown-700">{order.customerName}</span>
                    <span className="text-xs text-brown-400">{order.customerPhone}</span>
                    <span title={order.source}>{SOURCE_ICON[order.source] || '📦'}</span>
                  </div>
                  <div className="text-sm text-brown-400 mt-0.5 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${order.deliveryMethod === 'DELIVERY' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'}`}>
                      {order.deliveryMethod === 'DELIVERY' ? '🛵 DELIVERY' : '🏪 PICKUP'}
                    </span>
                    <span>• {order.items.length} item • {formatPrice(order.totalPrice)} • {new Date(order.createdAt).toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                  <span className="text-brown-300 text-sm">{isEx ? '▲' : '▼'}</span>
                </div>
              </div>

              <AnimatePresence>
                {isEx && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-cream-200 p-4">
                      {/* Items */}
                      <div className="space-y-2 mb-4">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-brown-600">
                              {item.variant.flavorName} ({item.baseType})
                              {item.topping && <span className="text-brown-400"> + {item.topping.emoji} {item.topping.name}</span>}
                              {item.quantity > 1 && <span className="text-brown-400"> ×{item.quantity}</span>}
                            </span>
                            <span className="font-medium text-brown-700">{formatPrice(item.subtotal)}</span>
                          </div>
                        ))}
                        {order.deliveryMethod === 'DELIVERY' && order.deliveryFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-brown-600">🛵 Ongkos Kirim</span>
                            <span className="font-medium text-brown-700">{formatPrice(order.deliveryFee)}</span>
                          </div>
                        )}
                        <div className="border-t border-cream-200 pt-2 flex justify-between font-semibold text-brown-700">
                          <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
                        </div>
                      </div>
                      {order.notes && <p className="text-xs text-brown-400 bg-cream-100 rounded-lg px-3 py-2 mb-4">📝 {order.notes}</p>}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        {cfg?.next && (
                          <button onClick={() => updateStatus(order.id, cfg.next!)} disabled={updating === order.id}
                            className="btn-brown text-xs px-3 py-2 disabled:opacity-50">
                            {updating === order.id ? '...' : `→ ${STATUS_CONFIG[cfg.next]?.label}`}
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'done' && (
                          <button onClick={() => updateStatus(order.id, 'cancelled')} disabled={updating === order.id}
                            className="px-3 py-2 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                            Batalkan
                          </button>
                        )}
                        <button onClick={() => openWhatsApp(order)}
                          className="px-3 py-2 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-1">
                          💬 WA
                        </button>
                        <button onClick={() => deleteOrder(order.id)}
                          className="px-3 py-2 text-xs font-medium bg-red-50 text-red-500 rounded-lg hover:bg-red-100 ml-auto">
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </>
  )
}
