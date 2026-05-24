import AdminSidebar from '@/components/admin/AdminSidebar'
import { prisma } from '@/lib/prisma'
import BannersClient from '@/components/admin/BannersClient'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 bg-cream-100 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <BannersClient initialBanners={banners} />
        </div>
      </main>
    </div>
  )
}
