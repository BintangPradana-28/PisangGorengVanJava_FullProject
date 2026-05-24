'use client'
// components/admin/ReportsClient.tsx
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface Order { id: string; totalPrice: number; status: string; source: string; createdAt: string; items: { variant: { flavorName: string } }[] }
interface Props { orders: Order[]; totalVariants: number; totalToppings: number; currentRange: string }

export default function ReportsClient({ orders, totalVariants, totalToppings, currentRange }: Props) {
  const router = useRouter()
  const stats = useMemo(() => {
    const done       = orders.filter(o => o.status === 'done')
    const revenue    = done.reduce((s, o) => s + o.totalPrice, 0)
    const avgOrder   = done.length ? Math.round(revenue / done.length) : 0
    const byStatus   = ['pending','confirmed','ready','done','cancelled'].map(s => ({ s, count: orders.filter(o => o.status === s).length }))
    const bySource   = ['whatsapp','walk-in','phone'].map(src => ({ src, count: orders.filter(o => o.source === src).length }))

    // Revenue by day (last 7 days)
    const days: { label: string; date: string; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const label   = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
      const dayRevenue = done
        .filter(o => o.createdAt.slice(0, 10) === dateStr)
        .reduce((s, o) => s + o.totalPrice, 0)
      days.push({ label, date: dateStr, revenue: dayRevenue })
    }

    // Top flavors
    const flavorCount: Record<string, number> = {}
    orders.forEach(o => o.items.forEach(i => {
      const f = i.variant.flavorName
      flavorCount[f] = (flavorCount[f] || 0) + 1
    }))
    const topFlavors = Object.entries(flavorCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

    // WhatsApp Conversion Analytics
    const waOrders = orders.filter(o => o.source === 'whatsapp')
    const waTotal = waOrders.length
    const waSuccess = waOrders.filter(o => !['pending', 'cancelled'].includes(o.status))
    const waSuccessCount = waSuccess.length
    const waConversionRate = waTotal > 0 ? Math.round((waSuccessCount / waTotal) * 100) : 0
    const waAbandoned = waOrders.filter(o => ['pending', 'cancelled'].includes(o.status))
    const waAbandonedValue = waAbandoned.reduce((s, o) => s + o.totalPrice, 0)

    const variantWAStats: Record<string, { clicks: number; success: number }> = {}
    waOrders.forEach(o => {
      const isSuccess = !['pending', 'cancelled'].includes(o.status)
      o.items.forEach(i => {
        const f = i.variant.flavorName
        if (!variantWAStats[f]) variantWAStats[f] = { clicks: 0, success: 0 }
        variantWAStats[f].clicks += 1
        if (isSuccess) variantWAStats[f].success += 1
      })
    })

    const conversionByVariant = Object.entries(variantWAStats)
      .map(([name, stats]) => ({
        name,
        clicks: stats.clicks,
        success: stats.success,
        rate: stats.clicks > 0 ? Math.round((stats.success / stats.clicks) * 100) : 0
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    return { 
      revenue, avgOrder, done: done.length, total: orders.length, byStatus, bySource, days, topFlavors,
      waTotal, waSuccessCount, waConversionRate, waAbandonedValue, conversionByVariant 
    }
  }, [orders])

  const maxRevenue = Math.max(...stats.days.map(d => d.revenue), 1)

  const STATUS_COLORS: Record<string, string> = {
    done: 'bg-green-500', pending: 'bg-yellow-400', confirmed: 'bg-blue-500',
    ready: 'bg-purple-500', cancelled: 'bg-red-400',
  }
  const STATUS_LABELS: Record<string, string> = {
    done: 'Selesai', pending: 'Pending', confirmed: 'Dikonfirmasi', ready: 'Siap', cancelled: 'Dibatalkan',
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="text-amber-brand text-xs font-semibold tracking-[0.2em] uppercase mb-1">Analytics</div>
          <h1 className="font-serif text-2xl font-bold text-brown-700">Laporan & Statistik</h1>
          <p className="text-sm text-brown-400 mt-0.5">Ringkasan performa penjualan</p>
        </div>
        
        <div className="flex bg-white border border-cream-200 rounded-xl p-1 shadow-sm">
          {[
            { value: '7', label: '7 Hari' },
            { value: '30', label: '30 Hari' },
            { value: '90', label: '3 Bulan' },
            { value: 'all', label: 'Semua Waktu' },
          ].map(r => (
            <button
              key={r.value}
              onClick={() => router.push(`?range=${r.value}`)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                currentRange === r.value 
                  ? 'bg-brown-700 text-white shadow' 
                  : 'text-brown-500 hover:bg-cream-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Pendapatan', value: formatPrice(stats.revenue), icon: '💰', sub: 'Dari order selesai' },
          { label: 'Order Selesai',    value: stats.done,                  icon: '✅', sub: `dari ${stats.total} total` },
          { label: 'Rata-rata Order',  value: formatPrice(stats.avgOrder), icon: '📊', sub: 'Per transaksi' },
          { label: 'Total Varian',     value: totalVariants,               icon: '🍌', sub: `+ ${totalToppings} topping` },
        ].map(({ label, value, icon, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="font-serif text-2xl font-bold text-brown-700">{value}</div>
            <div className="text-xs font-semibold text-brown-500 mt-1">{label}</div>
            <div className="text-xs text-brown-300 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Bar Chart (7 days) */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">📈 Pendapatan 7 Hari</h3>
          <div className="flex items-end gap-2 h-40">
            {stats.days.map(({ label, revenue }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-brown-400 font-medium">{revenue > 0 ? formatPrice(revenue).replace('Rp\u00A0','') : ''}</div>
                <div className="w-full relative flex items-end justify-center" style={{ height: '100px' }}>
                  <div
                    className="w-full rounded-t-lg bg-amber-brand transition-all duration-500"
                    style={{ height: `${Math.max(4, (revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-brown-400 text-center leading-tight">{label}</div>
              </div>
            ))}
          </div>
          {stats.days.every(d => d.revenue === 0) && (
            <p className="text-center text-sm text-brown-300 mt-4">Belum ada data pendapatan</p>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">📋 Status Order</h3>
          <div className="space-y-3">
            {stats.byStatus.map(({ s, count }) => {
              const pct = stats.total ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-brown-600">{STATUS_LABELS[s]}</span>
                    <span className="text-brown-400">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[s]}`}
                         style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Flavors */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">🍌 Rasa Terpopuler</h3>
          {stats.topFlavors.length === 0 ? (
            <p className="text-sm text-brown-300">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {stats.topFlavors.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="font-serif text-lg font-bold text-amber-brand w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-brown-700">{name}</span>
                      <span className="text-brown-400">{count} order</span>
                    </div>
                    <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-brand rounded-full"
                           style={{ width: `${(count / (stats.topFlavors[0]?.[1] || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Source */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">📱 Sumber Order</h3>
          <div className="space-y-4">
            {[
              { src: 'whatsapp', icon: '💬', label: 'WhatsApp',  color: 'bg-green-500' },
              { src: 'walk-in',  icon: '🚶', label: 'Walk-in',   color: 'bg-blue-500'  },
              { src: 'phone',    icon: '📞', label: 'Telepon',   color: 'bg-purple-500'},
            ].map(({ src, icon, label, color }) => {
              const count = stats.bySource.find(b => b.src === src)?.count || 0
              const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0
              return (
                <div key={src} className="flex items-center gap-4">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-brown-700">{label}</span>
                      <span className="text-brown-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* WhatsApp Conversion Analytics Section */}
      <div className="mt-8 mb-6">
        <div className="text-[#25D366] text-xs font-semibold tracking-[0.2em] uppercase mb-1">WhatsApp Intelligence</div>
        <h2 className="font-serif text-2xl font-bold text-brown-700">Analisis Konversi WhatsApp</h2>
        <p className="text-sm text-brown-400 mt-0.5">Lacak tingkat keberhasilan dari klik tombol WA hingga transfer.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-brown-500 uppercase tracking-wider mb-1">Total Klik WA</div>
              <div className="font-serif text-3xl font-bold text-brown-700">{stats.waTotal}</div>
            </div>
            <div className="text-3xl">🖱️</div>
          </div>
          
          <div className="bg-white rounded-2xl p-5 border border-green-200 shadow-sm flex items-center justify-between bg-green-50/30">
            <div>
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Berhasil (Konversi)</div>
              <div className="flex items-baseline gap-2">
                <div className="font-serif text-3xl font-bold text-green-600">{stats.waSuccessCount}</div>
                <div className="text-sm font-bold text-green-500 bg-green-100 px-2 py-0.5 rounded-full">{stats.waConversionRate}%</div>
              </div>
            </div>
            <div className="text-3xl">🎉</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-sm flex items-center justify-between bg-red-50/30">
            <div>
              <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Potensi Hilang (Ghosting)</div>
              <div className="font-serif text-2xl font-bold text-red-600">{formatPrice(stats.waAbandonedValue)}</div>
            </div>
            <div className="text-3xl">👻</div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">🎯 Konversi per Varian Menu</h3>
          {stats.conversionByVariant.length === 0 ? (
            <p className="text-sm text-brown-300">Belum ada data konversi WA.</p>
          ) : (
            <div className="space-y-4">
              {stats.conversionByVariant.map((v, i) => (
                <div key={v.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-brown-700">{v.name}</span>
                    <div className="flex gap-4 text-xs font-medium">
                      <span className="text-brown-400">{v.clicks} Klik</span>
                      <span className="text-green-600 w-16 text-right">{v.rate}% Sukses</span>
                    </div>
                  </div>
                  <div className="h-3 bg-cream-200 rounded-full overflow-hidden flex relative">
                    <div className="h-full bg-green-500 rounded-full z-10 transition-all duration-500"
                         style={{ width: `${v.rate}%` }} />
                    <div className="h-full bg-[#D4802A]/40 absolute top-0 left-0 transition-all duration-500"
                         style={{ width: `${(v.clicks / Math.max(1, stats.conversionByVariant[0]?.clicks)) * 100}%` }} />
                  </div>
                  <div className="text-[10px] text-brown-400 mt-1 text-right">
                    Warna pudar: Volume Klik | Hijau: Sukses
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
