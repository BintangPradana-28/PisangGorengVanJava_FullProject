// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/features/auth/authOptions'
import { z } from 'zod'

const OrderItemSchema = z.object({
  variantId: z.string().min(1),
  toppingId: z.string().optional().nullable(),
  baseType: z.string().default('kembung'),
  quantity: z.number().int().min(1),
  notes: z.string().optional()
})

// [SECURITY] Iron-clad Zod Regex for Indonesian Phone Numbers
const OrderSchema = z.object({
  customerName: z.string().min(1, "Nama tidak boleh kosong"),
  customerPhone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor telepon tidak valid"),
  deliveryMethod: z.enum(['PICKUP', 'DELIVERY']).default('DELIVERY'),
  items: z.array(OrderItemSchema).min(1),
  notes: z.string().optional(),
  source: z.string().optional(),
  voucherCode: z.string().optional().nullable(),
  discountAmount: z.number().optional()
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page   = parseInt(searchParams.get('page') || '1')
    const limit  = parseInt(searchParams.get('limit') || '20')
    const where  = status ? { status } : {}
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
        include: { items: { include: { variant: true, topping: true } } } }),
      prisma.order.count({ where }),
    ])
    return NextResponse.json({ success: true, data: { orders, total, page, limit } })
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json()
    
    // [SECURITY] Strict Quarantine Validation
    const parsed = OrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { customerName, customerPhone, items, notes, source, voucherCode, deliveryMethod } = parsed.data
    
    // Server Price Validation
    const variantIds = items.map(i => i.variantId)
    const toppingIds = items.map(i => i.toppingId).filter((id): id is string => Boolean(id))

    const variants = await prisma.menuVariant.findMany({ where: { id: { in: variantIds } } })
    const toppings = await prisma.topping.findMany({ where: { id: { in: toppingIds } } })

    let calculatedTotal = 0
    let whatsappItemsText = ''
    
    const formatPrice = (amount: number) => {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
    }

    const validatedItems = items.map((i) => {
      const variant = variants.find(v => v.id === i.variantId)
      if (!variant || !variant.isAvailable) throw new Error(`Varian tidak tersedia atau habis: ${i.variantId}`)

      const isReseller = (session?.user as { role?: string })?.role === 'RESELLER'

      let unitPrice = 0
      const baseType = i.baseType.toLowerCase()
      if (baseType === 'kembung') {
        unitPrice = isReseller && variant.wholesaleKembung > 0 ? variant.wholesaleKembung : variant.priceKembung
      } else if (baseType === 'lumpia') {
        unitPrice = isReseller && variant.wholesaleLumpia > 0 ? variant.wholesaleLumpia : variant.priceLumpia
      } else if (baseType === 'krispy') {
        unitPrice = isReseller && variant.wholesaleKrispy > 0 ? variant.wholesaleKrispy : variant.priceKrispy
      } else {
        unitPrice = isReseller && variant.wholesaleKembung > 0 ? variant.wholesaleKembung : variant.priceKembung // Default
      }

      let toppingPrice = 0
      let toppingName = ''
      if (i.toppingId) {
        const topping = toppings.find(t => t.id === i.toppingId)
        if (topping && topping.isActive) {
          toppingPrice = topping.price
          toppingName = topping.name
        }
      }

      const subtotal = (unitPrice + toppingPrice) * i.quantity
      calculatedTotal += subtotal

      // Build WA text for this item
      whatsappItemsText += `• *${i.quantity}x ${variant.flavorName} (${i.baseType})*\n`
      if (toppingName) whatsappItemsText += `  Topping: ${toppingName}\n`
      if (i.notes) whatsappItemsText += `  Catatan: "${i.notes}"\n`
      whatsappItemsText += `  Subtotal: ${formatPrice(subtotal)}\n\n`

      return {
        variantId: i.variantId,
        toppingId: i.toppingId || null,
        baseType: i.baseType,
        quantity: i.quantity,
        unitPrice,
        subtotal
      }
    })

    let finalTotal = calculatedTotal
    let appliedDiscount = 0
    let validVoucherCode = null
    let voucherText = ''

    // [SECURITY] Validasi Voucher di backend absolut (Menganulir hitungan Frontend)
    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode }
      })

      if (voucher && voucher.isActive) {
        const now = new Date()
        const role = (session?.user as any)?.role || "CUSTOMER"
        
        if (
          now >= voucher.startDate && 
          now <= voucher.endDate &&
          (voucher.usageLimit === 0 || voucher.usedCount < voucher.usageLimit) &&
          calculatedTotal >= voucher.minPurchase &&
          (voucher.applicableTo === "ALL" || voucher.applicableTo === role)
        ) {
          validVoucherCode = voucher.code
          if (voucher.discountType === "PERCENTAGE") {
            appliedDiscount = (calculatedTotal * voucher.discountValue) / 100;
            if (voucher.maxDiscount && appliedDiscount > voucher.maxDiscount) {
              appliedDiscount = voucher.maxDiscount;
            }
          } else {
            appliedDiscount = voucher.discountValue;
          }

          if (appliedDiscount > calculatedTotal) {
            appliedDiscount = calculatedTotal;
          }

          finalTotal -= appliedDiscount;
          voucherText = `Diskon Voucher (${voucher.code}): -${formatPrice(appliedDiscount)}\n`

          // Increment used count
          await prisma.voucher.update({
            where: { id: voucher.id },
            data: { usedCount: { increment: 1 } }
          })
        }
      }
    }

    // Delivery Fee Logic
    let deliveryFee = 0
    if (deliveryMethod === 'DELIVERY') {
      const deliveryFeeSetting = await prisma.siteSetting.findUnique({ where: { key: 'delivery_fee' } })
      deliveryFee = deliveryFeeSetting ? parseInt(deliveryFeeSetting.value) || 0 : 10000 // Default 10k flat rate
      finalTotal += deliveryFee
    }

    // Save to Postgres
    const order = await prisma.order.create({
      data: {
        customerName, 
        customerPhone, 
        totalPrice: finalTotal, 
        notes: notes || null, 
        source: source || 'whatsapp',
        voucherCode: validVoucherCode,
        discountAmount: appliedDiscount,
        deliveryMethod: deliveryMethod,
        deliveryFee: deliveryMethod === 'DELIVERY' ? deliveryFee : 0,
        items: {
          create: validatedItems,
        },
      },
      include: { items: { include: { variant: true, topping: true } } },
    })

    // Server-Generated WhatsApp URL Configuration (The Zero-Trust Core)
    const waSetting = await prisma.siteSetting.findUnique({ where: { key: 'kontak_whatsapp' } })
    const waNumber = waSetting?.value || '6281312167554'
    
    let message = `Halo *Pisang Goreng Van Java*, saya ingin melakukan pemesanan (Order ID: #${order.id.slice(-6)}):\n\n`
    message += `*Nama:* ${customerName}\n*No HP:* ${customerPhone}\n*Metode:* ${deliveryMethod}\n\n`
    message += whatsappItemsText
    message += `*Ringkasan Pembayaran:*\n`
    message += `Total Pesanan: ${formatPrice(calculatedTotal)}\n`
    if (voucherText) message += voucherText
    if (deliveryMethod === 'DELIVERY') message += `Ongkos Kirim: ${formatPrice(deliveryFee)}\n`
    message += `*Total Akhir: ${formatPrice(finalTotal)}*\n`
    
    if (notes) {
      message += `\n*Catatan/Alamat:* ${notes.trim()}\n`
    }

    const cleanMsg = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${waNumber}?text=${cleanMsg}`

    return NextResponse.json({ success: true, data: order, whatsappUrl }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || 'Gagal membuat order' }, { status: 500 })
  }
}
