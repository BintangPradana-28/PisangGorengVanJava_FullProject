import { prisma } from '@/lib/prisma'
import Footer from '@/components/user/Footer'
import SearchFilterBar from '@/components/user/SearchFilterBar'
import MenuGrid from '@/components/user/MenuGrid'
import HeroBanner from './HeroBanner' // We'll extract the hero part to a small component or just inline it
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MenuSpesialPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const q      = typeof searchParams.q      === 'string' ? searchParams.q      : ''
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : 'all'
  const flavor = typeof searchParams.flavor === 'string' ? searchParams.flavor : 'all'

  // Fetch all active products with review aggregates
  const dbProducts = await prisma.menuVariant.findMany({
    where: { isDeleted: false },
    orderBy: { flavorName: 'asc' },
    include: {
      reviews: { select: { rating: true } }
    }
  })

  // Compute rating & reviewCount per variant
  const products = dbProducts.map((p) => ({
    id: p.id,
    flavorName: p.flavorName,
    priceKembung: p.priceKembung,
    priceLumpia: p.priceLumpia,
    priceKrispy: p.priceKrispy,
    wholesaleKembung: p.wholesaleKembung,
    wholesaleLumpia: p.wholesaleLumpia,
    wholesaleKrispy: p.wholesaleKrispy,
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    tags: p.tags || [],
    rating: p.reviews.length > 0
      ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
      : undefined,
    reviewCount: p.reviews.length > 0 ? p.reviews.length : undefined,
  }))

  // Two-pass filter: base-type tab → flavor-family chip → search query
  const filtered = products.filter((p) => {
    const name        = p.flavorName.toLowerCase()
    const matchSearch = q      === ''    || name.includes(q.toLowerCase())
    
    // Check if the base type has a price > 0
    const fLower = filter.toLowerCase()
    const matchBase   = filter === 'all' 
                     || (fLower === 'kembung' && p.priceKembung > 0)
                     || (fLower === 'lumpia' && p.priceLumpia > 0)
                     || (fLower === 'krispy' && p.priceKrispy > 0)

    const matchFlavor = flavor === 'all' || name.includes(flavor.toLowerCase())
    
    return matchSearch && matchBase && matchFlavor
  })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-custom)', color: 'var(--text-custom)' }}>
      {/* ── Hero ── */}
      <HeroBanner />

      {/* ── Search & Filter bar (Client Component with Debouncing) ── */}
      <SearchFilterBar totalItems={filtered.length} />

      {/* ── Grid & Favorites (Client Component for Animations) ── */}
      <MenuGrid products={filtered} />

      {/* ── Info Banner ── */}
      <section className="py-16 text-white" style={{ background: 'linear-gradient(135deg, #3D1C02 0%, #5a2e0a 100%)' }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">Tersedia Juga di Outlet Kami</h2>
          <p className="text-white/70 mb-6">Kunjungi gerai Pisang Goreng Van Java terdekat untuk mencicipi langsung saat masih panas.</p>
          <Link href="/lokasi-kontak"
            className="inline-block px-8 py-3.5 rounded-full font-bold text-sm transition-all active:scale-95"
            style={{ background: '#D4802A', color: 'white' }}>
            Lihat Lokasi Outlet
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
