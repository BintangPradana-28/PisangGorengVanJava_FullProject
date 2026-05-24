'use server'

import { prisma } from '@/lib/prisma'
import { registerSchema, forgotPasswordSchema } from './schemas'
import bcrypt from 'bcryptjs'
import { redis, rateLimit } from '@/lib/redis'
import crypto from 'crypto'

export async function registerUser(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const parsed = registerSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: 'Data tidak valid' }
    }

    const { name, email, password, whatsapp } = parsed.data

    // Rate Limiting
    const { success: rateLimitSuccess } = await rateLimit.limit(`register_${email}`)
    if (!rateLimitSuccess) {
      return { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' }
    }

    // Email Uniqueness Check
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true } 
    })
    
    if (existingUser) {
      return { success: false, error: 'Email ini sudah terdaftar. Silakan Log In.' }
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create User
    await prisma.user.create({
      data: {
        name,
        email,
        phone: whatsapp,
        passwordHash,
        role: 'CUSTOMER',
      },
      select: { id: true }
    })

    return { success: true }
  } catch (error) {
    console.error('Register error:', error)
    return { success: false, error: 'Terjadi kesalahan pada server.' }
  }
}

export async function generateResetToken(formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries())
    const parsed = forgotPasswordSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: 'Data tidak valid' }
    }

    const { email } = parsed.data

    // Rate Limiting (e.g., prevent spamming reset emails)
    const { success: rateLimitSuccess } = await rateLimit.limit(`reset_${email}`)
    if (!rateLimitSuccess) {
      return { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' }
    }

    const user = await prisma.user.findUnique({ where: { email } })
    
    // SELALU return success (ambiguous behavior)
    if (!user) {
      return { success: true }
    }

    // Generate Token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Save to Redis (1 hour TTL)
    await redis.set(`reset-token:${token}`, user.id, { ex: 3600 })

    // TODO: Send email containing the token (e.g., via Resend or Nodemailer)
    // console.log(`Sending reset email to ${email} with token: ${token}`)

    return { success: true }
  } catch (error) {
    console.error('Reset password error:', error)
    return { success: false, error: 'Terjadi kesalahan pada server.' }
  }
}
