// app/api/toppings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return !!session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const { name, price, emoji, isActive } = await req.json()
    const t = await prisma.topping.update({ where: { id: id }, data: { name, price: Number(price), emoji, isActive } })
    return NextResponse.json({ success: true, data: t })
  } catch (error) {
    console.error("PUT /api/toppings/[id] Error:", error)
    return NextResponse.json({ success: false, error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.topping.delete({ where: { id: id } })
    return NextResponse.json({ success: true, message: 'Topping dihapus' })
  } catch (error) {
    console.error("DELETE /api/toppings/[id] Error:", error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus' }, { status: 500 })
  }
}
