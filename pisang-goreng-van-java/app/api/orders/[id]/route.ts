// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import { logAudit } from '@/lib/audit'
import { sendWhatsAppNotification } from '@/lib/notifications'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return !!session
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id: id }, include: { items: { include: { variant: true, topping: true } } } })
    if (!order) return NextResponse.json({ success: false, error: 'Order tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ success: true, data: order })
  } catch { return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const { status } = await req.json()
    const valid = ['pending','confirmed','ready','done','cancelled']
    if (!valid.includes(status)) return NextResponse.json({ success: false, error: 'Status tidak valid' }, { status: 400 })
    const order = await prisma.order.update({ where: { id: id }, data: { status } })
    
    // Audit Log
    await logAudit("UPDATE_ORDER_STATUS", "Order", id, { newStatus: status })

    // WA Notification Webhook
    if (['confirmed', 'ready', 'cancelled'].includes(status)) {
      await sendWhatsAppNotification(order.customerPhone, order.customerName, status, order.id)
    }

    return NextResponse.json({ success: true, data: order })
  } catch { return NextResponse.json({ success: false, error: 'Gagal update' }, { status: 500 }) }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.order.delete({ where: { id: id } })
    
    // Audit Log
    await logAudit("DELETE_ORDER", "Order", id)

    return NextResponse.json({ success: true, message: 'Order dihapus' })
  } catch { return NextResponse.json({ success: false, error: 'Gagal menghapus' }, { status: 500 }) }
}
