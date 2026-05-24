// lib/session.ts
import { SessionOptions } from 'iron-session'
import { AdminSession } from '@/data/types'

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'vanjava_admin_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
  },
}

// Extend iron-session types
declare module 'iron-session' {
  interface IronSessionData {
    admin?: AdminSession
  }
}
