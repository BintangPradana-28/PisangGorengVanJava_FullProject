// app/(admin)/dashboard/page.tsx
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader  from '@/components/admin/AdminHeader'
import { formatPriceShort, formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalProducts, recentOrders, todaysOrders, pendingOrders] = await Promise.all([
    prisma.menuVariant.count({ where: { isDeleted: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { variant: true } } }
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: today } }
    }),
    prisma.order.count({
      where: { status: 'pending' }
    })
  ])

  const todayRevenue = todaysOrders.reduce((sum, o) => sum + o.totalPrice, 0)
  
  // Hitung grafik penjualan 7 hari terakhir
  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0,0,0,0)
    return d
  })

  const weekStart = new Date(last7Days[0])
  const weekOrders = await prisma.order.findMany({
    where: { createdAt: { gte: weekStart } }
  })

  const chartData = last7Days.map(date => {
    const dayOrders = weekOrders.filter(o => {
      const oDate = new Date(o.createdAt)
      return oDate.getDate() === date.getDate() && oDate.getMonth() === date.getMonth()
    })
    return {
      date: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      total: dayOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      count: dayOrders.length
    }
  })

  return { totalProducts, recentOrders, todaysOrders: todaysOrders.length, todayRevenue, pendingOrders, chartData }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const data = await getDashboardData()

  const metrics = [
    { label: 'Pendapatan Hari Ini', value: formatPrice(data.todayRevenue), icon: '💰', sub: `${data.todaysOrders} pesanan hari ini` },
    { label: 'Pesanan Menunggu',    value: data.pendingOrders,             icon: '⏳', sub: 'Perlu konfirmasi segera' },
    { label: 'Total Varian Menu',   value: data.totalProducts,             icon: '🍌', sub: 'Aktif dijual' },
  ]

  const maxRevenue = Math.max(...data.chartData.map(d => d.total), 1)

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto min-h-screen bg-cream-100">
        <div className="bg-brown-700 rounded-2xl p-6 mb-6 flex items-center justify-between text-white shadow-sm">
          <div>
            <h2 className="font-serif text-xl font-bold">Selamat datang, {session.user?.name || 'Admin'}! 👋</h2>
            <p className="text-cream-200/70 text-sm mt-1">Pantau pesanan dan pendapatan Pisang Goreng Van Java</p>
          </div>
          <span className="text-5xl drop-shadow-md">🍌</span>
        </div>

        <AdminHeader title="Dashboard" subtitle="Ringkasan data hari ini" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {metrics.map(({ label, value, icon, sub }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center text-xl">{icon}</div>
                <div className="text-xs font-bold text-brown-400 uppercase tracking-wider">{label}</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-bold text-brown-700">{value}</div>
                <div className="text-xs text-brown-400 mt-1">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 shadow-sm p-6">
            <h3 className="font-serif text-lg font-bold text-brown-700 mb-6">Grafik Penjualan 7 Hari Terakhir</h3>
            <div className="h-48 flex items-end gap-2 sm:gap-4">
              {data.chartData.map((d, i) => {
                const height = Math.max((d.total / maxRevenue) * 100, 5)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex justify-center h-full items-end">
                      <div 
                        className="w-full max-w-[40px] bg-amber-brand/80 group-hover:bg-amber-brand rounded-t-md transition-all duration-300 cursor-pointer relative"
                        style={{ height: `${height}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-brown-700 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                          {formatPriceShort(d.total)} ({d.count} ord)
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-brown-400 font-semibold mt-3 uppercase tracking-wider">{d.date}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm p-6 flex flex-col">
            <h3 className="font-serif text-lg font-bold text-brown-700 mb-4">Aktivitas Terkini</h3>
            <div className="flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-2 custom-scrollbar">
              {data.recentOrders.length === 0 ? (
                <div className="h-full flex items-center justify-center text-brown-300 text-sm">Belum ada pesanan masuk</div>
              ) : data.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-start gap-3 border-b border-cream-100 pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {order.source === 'whatsapp' ? '💬' : '🚶'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brown-700">{order.customerName}</div>
                    <div className="text-xs text-brown-400 mt-0.5">{order.items.length} item • {formatPrice(order.totalPrice)}</div>
                    <div className="text-[10px] text-brown-300 mt-1">{new Date(order.createdAt).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
