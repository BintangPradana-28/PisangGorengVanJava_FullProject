import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Cek konfigurasi
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('⚠️ UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing. Redis features might crash in production.')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Konfigurasi standar untuk pembatasan request umum (misal: Register / Login)
export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 request per 15 menit
  analytics: true,
})
