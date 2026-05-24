import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'

export async function logAudit(
  action: string,
  resource: string,
  resourceId: string,
  details?: any,
  ipAddress?: string
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'SYSTEM' // Assuming NextAuth populates session.user.id, otherwise we fallback to SYSTEM or use email if id is missing.

    // Better fallback to email if ID is not populated in session callback
    const identifier = (session?.user as any)?.id || session?.user?.email || 'SYSTEM'

    await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId,
        userId: identifier,
        details: details ? JSON.stringify(details) : null,
        ipAddress: ipAddress || 'unknown'
      }
    })
  } catch (error) {
    console.error('[AUDIT_LOG_ERROR] Failed to save audit log:', error)
    // We intentionally don't throw the error so that the main application logic doesn't crash if logging fails.
  }
}
