import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ABSOLUTE QUARANTINE: Zod Schema to strictly validate inputs
// Strips out script tags or highly suspicious HTML payloads as a basic XSS defense mechanism
const sanitizeHtml = (val: string) => val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

const GenericSettingsSchema = z.record(z.string(), z.string().transform(sanitizeHtml))

export async function POST(req: NextRequest) {
  try {
    // THE IRON GATE: Verify Authentication & Authorization
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 })
    }

    const body = await req.json()
    const { group, payload } = body

    if (!['home', 'about', 'contact', 'store'].includes(group)) {
       return NextResponse.json({ error: 'Invalid group' }, { status: 400 })
    }

    // QUARANTINE VALIDATION: Validate payload as string record
    const validationResult = GenericSettingsSchema.safeParse(payload)
    
    if (!validationResult.success) {
      console.warn(`[SECURITY] Invalid payload shape detected at /api/admin/settings/bulk-update:`, validationResult.error.format())
      return NextResponse.json({ error: 'Bad Request: Data integrity validation failed' }, { status: 400 })
    }

    const safeData = validationResult.data

    // Database Execution Strategy: Upsert each key-value pair securely
    const updatePromises = Object.entries(safeData).map(([key, value]) => {
      if (value === undefined) return Promise.resolve()
      return prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value, group }
      })
    })

    await Promise.all(updatePromises)

    // Log the audit trail for accountability
    await prisma.auditLog.create({
      data: {
        action: `UPDATE_${group.toUpperCase()}_SETTINGS`,
        resource: 'SiteSetting',
        resourceId: `${group}-group`,
        userId: session.user.id,
        details: JSON.stringify(Object.keys(safeData)),
      }
    })

    // DATA MASKING: Return generic success without leaking database structure
    return NextResponse.json({ message: 'About Us settings secured and updated successfully.' }, { status: 200 })

  } catch (error) {
    // OPAQUE ERRORS: Log actual error to internal console, return generic to client
    console.error('[CRITICAL] Exception in /api/admin/settings/about:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
