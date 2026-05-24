import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// STRICT VALIDATION (C-Level Standard)
const ContactSchema = z.object({
  nama: z.string().min(2, "Nama terlalu pendek").max(100, "Nama terlalu panjang"),
  pesan: z.string().min(5, "Pesan terlalu pendek").max(2000, "Pesan terlalu panjang"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui Kebijakan Privasi"
  })
}).strict()

export async function POST(req: Request) {
  try {
    const rawBody = await req.json()
    
    // 1. ABSOLUTE QUARANTINE (Zod Validation)
    const parsed = ContactSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { nama, pesan } = parsed.data
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown IP'
    const userAgent = req.headers.get('user-agent') || 'Unknown Agent'

    // 2. SAVE TO POSTGRES (Data Asset Capture)
    const lead = await prisma.contactLead.create({
      data: {
        name: nama,
        message: pesan,
        ipAddress: ipAddress.substring(0, 45), // IPv6 max length safe
        userAgent: userAgent.substring(0, 255),
        isConsent: true
      }
    })

    // 3. GENERATE WHATSAPP REDIRECT URL
    // Kita panggil Setting nomor WA dari database juga jika perlu, tapi untuk performa kita gunakan env/default
    const waNumber = process.env.WHATSAPP_NUMBER || '6281312167554'
    const text = encodeURIComponent(`Halo Van Java! Saya *${nama}*.\n\n${pesan}`)
    const redirectUrl = `https://wa.me/${waNumber}?text=${text}`

    // Return the secure redirect URL
    return NextResponse.json({ success: true, redirectUrl })
  } catch (error) {
    // 4. GENERIC OPAQUE ERROR (No Stack Trace Leak)
    console.error('[SECURITY_LOG] Contact Form Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server. Permintaan Anda tidak dapat diproses.' },
      { status: 500 }
    )
  }
}
