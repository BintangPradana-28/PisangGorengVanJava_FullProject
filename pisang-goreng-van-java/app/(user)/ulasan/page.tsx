import ReviewSystem from '@/src/features/reviews/components/ReviewSystem'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Ulasan Pelanggan | Pisang Van Java',
  description: 'Apa kata mereka tentang kerenyahan Pisang Van Java? Baca ulasan jujur dari pelanggan kami.',
}

export const dynamic = 'force-dynamic'

export default async function UlasanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  const filter = searchParams.filter || 'Semua'

  // Build where clause
  const where: Prisma.ReviewWhereInput = {}
  if (filter === 'Dengan Komentar') {
    where.comment = { not: null, gt: '' }
  } else if (filter !== 'Semua') {
    where.rating = parseInt(filter, 10)
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { 
      user: { select: { name: true } },
      variant: { select: { flavorName: true } }
    },
  })

  const maskName = (name: string | null) => {
    if (!name) return 'A****n'
    if (name.length <= 2) return name
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  }

  const data = reviews.map((r) => ({
    id:        r.id,
    userId:    r.userId,
    userName:  maskName(r.user?.name),
    variantName: r.variant.flavorName,
    rating:    r.rating,
    comment:   r.comment,
    imageUrl:  r.imageUrl,
    isVerifiedBuyer: r.isVerifiedBuyer,
    createdAt: r.createdAt.toISOString(),
  }))

  const allReviews = await prisma.review.findMany({
    select: { rating: true }
  })

  let average = 0
  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  if (allReviews.length > 0) {
    let sum = 0
    allReviews.forEach(r => {
      sum += r.rating
      if (starCounts[r.rating as keyof typeof starCounts] !== undefined) {
        starCounts[r.rating as keyof typeof starCounts]++
      }
    })
    average = Number((sum / allReviews.length).toFixed(1))
  }

  const aggregates = {
    average,
    total: allReviews.length,
    starCounts
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-16">
      <ReviewSystem initialReviews={data} initialAggregates={aggregates} currentFilter={filter} />
    </main>
  )
}
