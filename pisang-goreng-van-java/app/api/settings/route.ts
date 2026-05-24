// app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import { logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await prisma.siteSetting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] })
  return NextResponse.json({ success: true, data: settings })
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const updates: { key: string; value: string }[] = body.settings || []
  const results = await Promise.all(updates.map(({ key, value }) =>
    prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
  ))
  
  await logAudit("UPDATE_SETTINGS", "SiteSetting", "bulk", updates)

  return NextResponse.json({ success: true, data: results })
}
