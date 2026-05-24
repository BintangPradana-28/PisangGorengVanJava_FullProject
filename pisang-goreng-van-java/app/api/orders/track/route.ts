import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone) return NextResponse.json({ success: false, error: 'Nomor HP diperlukan' }, { status: 400 })
  try {
    const orders = await prisma.order.findMany({
      where: { customerPhone: { contains: phone } },
      orderBy: { createdAt: 'desc' }, take: 10,
      include: { items: { include: { variant: true, topping: true } } },
    })

    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        variant: item.variant
          ? {
              ...item.variant,
              flavorName: item.variant.flavorName,
            }
          : null,
      })),
    }))

    return NextResponse.json({ success: true, data: formattedOrders })
  } catch { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}
