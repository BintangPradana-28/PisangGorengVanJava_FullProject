import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  
  const { currentPassword, newPassword } = await req.json()
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
  
  const userId = session.user?.id
  if (!userId) return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.isDeleted || !user.passwordHash) {
    return NextResponse.json({ success: false, error: 'User tidak ditemukan atau tidak menggunakan password' }, { status: 404 })
  }
  
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) return NextResponse.json({ success: false, error: 'Password lama salah' }, { status: 400 })
  
  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashed } })
  return NextResponse.json({ success: true, message: 'Password berhasil diubah' })
}
