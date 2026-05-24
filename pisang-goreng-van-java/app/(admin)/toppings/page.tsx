// app/(admin)/toppings/page.tsx
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ToppingsClient from '@/components/admin/ToppingsClient'
import { Toaster } from 'react-hot-toast'

export default async function ToppingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const toppings = await prisma.topping.findMany({ orderBy: { name: 'asc' } })
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 bg-cream-100 overflow-y-auto">
        <Toaster position="top-right" />
        <ToppingsClient initialToppings={toppings} />
      </main>
    </div>
  )
}
