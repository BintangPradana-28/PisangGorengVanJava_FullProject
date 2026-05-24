import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import EditMenuForm from './EditMenuForm'
import { MenuVariantFormData } from '@/data/types'

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.menuVariant.findUnique({
    where: { id }
  })

  if (!product || product.isDeleted) {
    notFound()
  }

  // Map the database product (which uses Indonesian snake_case names)
  // to the frontend form data structure.
  const initialData: MenuVariantFormData = {
    flavorName:   product.flavorName,
    priceKembung: product.priceKembung,
    priceLumpia:  product.priceLumpia,
    priceKrispy:  product.priceKrispy,
    description:  product.deskripsi_topping || '',
    imageUrl:     product.imageUrl || '',
    isActive:     product.isActive,
    isAvailable:  product.isAvailable,
    sortOrder:    0,    // Default
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 bg-cream-100">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brown-400 mb-6">
          <Link href="/manage-menu" className="hover:text-brown-700 transition-colors">Kelola Menu</Link>
          <span>/</span>
          <span className="text-brown-700 font-medium">Edit Menu</span>
        </div>

        <div className="max-w-2xl">
          <h1 className="font-serif text-2xl font-bold text-brown-700 mb-6">✏️ Edit Menu Varian</h1>
          <EditMenuForm id={id} initialData={initialData} />
        </div>
      </main>
    </div>
  )
}
