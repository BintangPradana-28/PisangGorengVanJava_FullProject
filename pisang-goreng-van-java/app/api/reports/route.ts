// app/api/reports/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const now   = new Date()
  const start = new Date(now); start.setDate(now.getDate() - 29)

  const [allOrders, byStatus, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: start } }, select: { totalPrice: true, status: true, createdAt: true, source: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { id: true }, _sum: { totalPrice: true } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { items: { include: { variant: true } } } }),
  ])

  // Revenue by day (last 7 days)
  const last7: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    last7[d.toISOString().slice(0, 10)] = 0
  }
  allOrders.filter(o => o.status === 'done').forEach(o => {
    const day = o.createdAt.toISOString().slice(0, 10)
    if (last7[day] !== undefined) last7[day] += o.totalPrice
  })

  const totalRevenue = allOrders.filter(o => o.status === 'done').reduce((s, o) => s + o.totalPrice, 0)
  const totalOrders  = allOrders.length
  const doneOrders   = allOrders.filter(o => o.status === 'done').length
  const sourceCount  = allOrders.reduce((acc: Record<string, number>, o) => { acc[o.source] = (acc[o.source] || 0) + 1; return acc }, {})

  // Map nama_varian to flavorName to maintain client compatibility
  const formattedRecentOrders = recentOrders.map(o => ({
    ...o,
    items: o.items.map(item => ({
      ...item,
      variant: {
        ...item.variant,
        flavorName: item.variant.flavorName
      }
    }))
  }))

  return NextResponse.json({ success: true, data: { totalRevenue, totalOrders, doneOrders, byStatus, revenueByDay: last7, sourceCount, recentOrders: formattedRecentOrders } })
}
