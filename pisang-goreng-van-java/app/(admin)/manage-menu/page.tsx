// app/(admin)/manage-menu/page.tsx
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/features/auth/authOptions";
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminMenuDashboard from '@/src/features/menu/components/AdminMenuDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Menu | Admin' }

export default async function ManageMenuPage() {
  // Zero Trust: Pastikan pengguna benar-benar memiliki sesi dari NextAuth
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login')
  }

  // Mengambil data produk aktif
  const dbProducts = await prisma.menuVariant.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  })

  // Data yang dikirim ke Client Component
  const products = dbProducts.map(p => ({
    id: p.id,
    flavorName: p.flavorName,
    priceKembung: p.priceKembung,
    priceLumpia: p.priceLumpia,
    priceKrispy: p.priceKrispy,
    wholesaleKembung: p.wholesaleKembung,
    wholesaleLumpia: p.wholesaleLumpia,
    wholesaleKrispy: p.wholesaleKrispy,
    imageUrl: p.imageUrl,
    deskripsi_topping: p.deskripsi_topping,
    isAvailable: p.isAvailable,
    tags: p.tags || [],
  }));

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-cream-100">
        <h1 className="font-serif text-3xl font-bold text-brown-800 mb-6">ADMIN DASHBOARD</h1>
        <AdminMenuDashboard initialProducts={products} />
      </main>
    </div>
  )
}
