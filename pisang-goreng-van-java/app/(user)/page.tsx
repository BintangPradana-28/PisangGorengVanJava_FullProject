// app/(user)/page.tsx
import { prisma } from "@/lib/prisma";
import Hero from "@/components/user/Hero";
import MenuCards, {
  ProductType,
} from "@/src/features/menu/components/MenuCards";
import nextDynamic from 'next/dynamic';
import { unstable_cache } from 'next/cache';

export const dynamic = 'force-dynamic'

const About = nextDynamic(() => import('@/components/user/About'), { ssr: true });
const Gallery = nextDynamic(() => import('@/components/user/Gallery'), { ssr: true });
const LocationMap = nextDynamic(() => import('@/src/features/settings/components/LocationMap'), { ssr: true });
const Footer = nextDynamic(() => import('@/components/user/Footer'), { ssr: true });

// Server Component — fetches data at request time using SWR Caching
const getCachedMenu = unstable_cache(
  async (): Promise<ProductType[]> => {
    try {
      // Zero Trust & Flawless DB: Mengambil produk yang belum dihapus (Soft Delete)
      const dbProducts = await prisma.menuVariant.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: { createdAt: "desc" },
        include: {
          reviews: { select: { rating: true } }
        }
      });

      const products: ProductType[] = dbProducts.map((p) => ({
        id: p.id,
        flavorName: p.flavorName,
        priceKembung: p.priceKembung,
        priceLumpia: p.priceLumpia,
        priceKrispy: p.priceKrispy,
        imageUrl: p.imageUrl,
        isAvailable: p.isAvailable,
        tags: p.tags || [],
        deskripsi_topping: p.deskripsi_topping,
        wholesaleKembung: p.wholesaleKembung,
        wholesaleLumpia: p.wholesaleLumpia,
        wholesaleKrispy: p.wholesaleKrispy,
        rating: p.reviews.length > 0
          ? Math.round((p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length) * 10) / 10
          : undefined,
        reviewCount: p.reviews.length > 0 ? p.reviews.length : undefined,
      }));

      // Data cadangan sementara jika DB masih kosong (Mock data)
      if (products.length === 0) {
        return [
          {
            id: "1",
            flavorName: "Cokelat",
            priceKembung: 10000,
            priceLumpia: 12000,
            priceKrispy: 14000,
            imageUrl: "",
            isAvailable: true,
            tags: ["Manis", "Best Seller"],
            wholesaleKembung: 0,
            wholesaleLumpia: 0,
            wholesaleKrispy: 0,
          },
          {
            id: "2",
            flavorName: "Keju",
            priceKembung: 10000,
            priceLumpia: 12000,
            priceKrispy: 15000,
            imageUrl: null,
            isAvailable: true,
            tags: [],
            wholesaleKembung: 0,
            wholesaleLumpia: 0,
            wholesaleKrispy: 0,
          },
          {
            id: "3",
            flavorName: "Susu",
            priceKembung: 10000,
            priceLumpia: 12000,
            priceKrispy: 15000,
            imageUrl: null,
            isAvailable: true,
            tags: [],
            wholesaleKembung: 0,
            wholesaleLumpia: 0,
            wholesaleKrispy: 0,
          },
        ];
      }

      return products;
    } catch (error) {
      // Global Error Handling: Jika terjadi gagal koneksi, tampilkan mock data saja agar tidak crash (Graceful Degradation)
      console.error("[Safe Log] Database connection error during menu fetch");
      return [
        {
          id: "1",
          flavorName: "Cokelat (Mock)",
          priceKembung: 10000,
          priceLumpia: 12000,
          priceKrispy: 15000,
          imageUrl: null,
          isAvailable: true,
          tags: [],
          wholesaleKembung: 0,
          wholesaleLumpia: 0,
          wholesaleKrispy: 0,
        },
      ];
    }
  },
  ['home-menu-data'],
  { revalidate: 60, tags: ['menu'] }
);

export default async function HomePage() {
  const products = await getCachedMenu();
  const homeProducts = products.slice(0, 3); // Hanya tampilkan 3 menu teratas

  // Fetch active banner
  const activeBanner = await prisma.banner.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" }
  });

  // Fetch aggregate review data for Hero Rating Indicator
  const reviewAggregates = await prisma.review.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
  });

  const averageRating = reviewAggregates._avg.rating ? Number(reviewAggregates._avg.rating.toFixed(1)) : 0;
  const totalReviews = reviewAggregates._count.rating || 0;

  return (
    <>
      <Hero banner={activeBanner} averageRating={averageRating} totalReviews={totalReviews} />
      <About />
      <MenuCards products={homeProducts} />
      {/* Gallery bisa disembunyikan atau dipertahankan tergantung kebutuhan */}
      <LocationMap />
      <Footer />
    </>
  );
}
