// app/api/toppings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'

export async function GET() {
  const toppings = await prisma.topping.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ success: true, data: toppings })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { name, price, emoji, isActive } = await req.json()
    if (!name) return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 })
    const t = await prisma.topping.create({ data: { name, price: Number(price) || 2000, emoji: emoji || null, isActive: isActive ?? true } })
    return NextResponse.json({ success: true, data: t }, { status: 201 })
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'P2002') return NextResponse.json({ success: false, error: 'Nama topping sudah ada' }, { status: 409 })
    return NextResponse.json({ success: false, error: 'Gagal menambah topping' }, { status: 500 })
  }
}
