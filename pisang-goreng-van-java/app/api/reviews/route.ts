import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/src/features/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  variantId: z.string().min(1),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().max(1000).optional(),
  imageUrl:  z.string().url().optional().or(z.literal('')),
})

// GET /api/reviews
export async function GET(req: NextRequest) {
  const variantId = req.nextUrl.searchParams.get('variantId')
  const ratingFilter = req.nextUrl.searchParams.get('rating')
  const hasComment = req.nextUrl.searchParams.get('hasComment') === 'true'

  const withPhoto = req.nextUrl.searchParams.get('withPhoto') === 'true'

  // Build where clause
  const where: any = {}
  if (variantId) where.variantId = variantId
  if (ratingFilter) where.rating = parseInt(ratingFilter, 10)
  if (hasComment) where.comment = { not: null, gt: '' }
  if (withPhoto) where.imageUrl = { not: null, gt: '' }

  try {
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { name: true } },
        variant: { select: { flavorName: true } }
      },
    })

    const data = reviews.map((r) => {
      // Mask user name
      const maskName = (name: string | null) => {
        if (!name) return 'A****n'
        if (name.length <= 2) return name
        return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
      }
      return {
        id:        r.id,
        userId:    r.userId,
        userName:  maskName(r.user?.name),
        variantName: r.variant.flavorName,
        rating:    r.rating,
        comment:   r.comment,
        imageUrl:  r.imageUrl,
        isVerifiedBuyer: r.isVerifiedBuyer,
        createdAt: r.createdAt.toISOString(),
      }
    })

    // Calculate aggregates without filter for the summary card
    const allReviewsWhere = variantId ? { variantId } : {}
    const allReviews = await prisma.review.findMany({
      where: allReviewsWhere,
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

    return NextResponse.json({ 
      success: true, 
      data, 
      aggregates: {
        average,
        total: allReviews.length,
        starCounts
      }
    })
  } catch (err) {
    console.error('[GET /api/reviews]', err)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data ulasan.' }, { status: 500 })
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Login terlebih dahulu untuk memberikan ulasan.' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { variantId, rating, comment, imageUrl } = parsed.data

  try {
    // Verified Buyer Check
    let isVerifiedBuyer = false
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (user && user.phone) {
      const order = await prisma.order.findFirst({
        where: {
          customerPhone: user.phone,
          status: { notIn: ['pending', 'cancelled'] },
          items: { some: { variantId } }
        }
      })
      if (order) isVerifiedBuyer = true
    }

    const review = await prisma.review.upsert({
      where:  { userId_variantId: { userId: session.user.id, variantId } },
      create: { 
        userId: session.user.id, 
        variantId, 
        rating, 
        comment: comment ?? null,
        imageUrl: imageUrl ?? null,
        isVerifiedBuyer
      },
      update: { 
        rating, 
        comment: comment ?? null,
        imageUrl: imageUrl ?? null,
        isVerifiedBuyer // Re-check verification in case they bought it later
      },
    })
    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/reviews]', err)
    return NextResponse.json({ success: false, error: 'Gagal menyimpan ulasan.' }, { status: 500 })
  }
}
