// app/(admin)/orders/page.tsx
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import AdminSidebar from '@/components/admin/AdminSidebar'
import OrdersClient from '@/components/admin/OrdersClient'
import { Toaster } from 'react-hot-toast'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }, take: 50,
    include: { items: { include: { variant: true, topping: true } } },
  })

  const formattedOrders = orders.map(o => ({
    ...o,
    items: o.items.map(item => ({
      ...item,
      variant: item.variant ? {
        ...item.variant,
        flavorName: item.variant.flavorName
      } : null
    }))
  }))

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 bg-cream-100 overflow-y-auto">
        <Toaster position="top-right" />
        <OrdersClient initialOrders={JSON.parse(JSON.stringify(formattedOrders))} />
      </main>
    </div>
  )
}
