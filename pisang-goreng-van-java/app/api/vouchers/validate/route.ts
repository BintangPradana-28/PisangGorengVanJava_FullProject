import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/features/auth/authOptions";
import { z } from "zod";

// 2. ABSOLUTE QUARANTINE (Zod)
// We quarantine the raw request body. Only allow alphanumeric voucher codes up to 50 chars.
// cartTotal must be a positive number.
const VoucherValidationSchema = z.object({
  code: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/, "Mendeklarasikan format voucher tidak valid"),
  cartTotal: z.number().min(0, "Total belanja tidak boleh negatif").max(100000000, "Total belanja tidak wajar"),
}).strict(); // Reject any undocumented fields immediately (Anti Mass-Assignment)

export async function POST(req: NextRequest) {
  try {
    // 1. THE IRON GATE (Auth)
    // Any unauthenticated request must be dropped immediately. No "fallback" to CUSTOMER allowed.
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: "Unauthorized: Active session required" }, { status: 401 });
    }
    const role = session.user.role;
    if (role !== "CUSTOMER" && role !== "RESELLER" && role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden: Invalid authorization role" }, { status: 403 });
    }

    // Attempt to parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Bad Request: Malformed JSON payload" }, { status: 400 });
    }

    // Quarantine the payload
    const parsed = VoucherValidationSchema.safeParse(body);
    if (!parsed.success) {
      console.warn(`[SECURITY] Invalid voucher payload from user ${session.user.email}`);
      return NextResponse.json({ success: false, error: "Bad Request: Payload failed security validation" }, { status: 400 });
    }

    const { code, cartTotal } = parsed.data;

    // 3. DATA MASKING
    // We explicitly SELECT only the fields we need to validate. Do NOT fetch the entire Voucher object.
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        code: true,
        isActive: true,
        startDate: true,
        endDate: true,
        usageLimit: true,
        usedCount: true,
        minPurchase: true,
        applicableTo: true,
        discountType: true,
        discountValue: true,
        maxDiscount: true,
      }
    });

    if (!voucher) {
      return NextResponse.json({ success: false, error: "Kode voucher tidak valid atau tidak ditemukan" }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({ success: false, error: "Kode voucher tidak valid atau tidak ditemukan" }, { status: 400 }); // Opaque error
    }

    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return NextResponse.json({ success: false, error: "Voucher tidak berlaku pada saat ini" }, { status: 400 });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ success: false, error: "Kuota voucher telah habis" }, { status: 400 });
    }

    if (cartTotal < voucher.minPurchase) {
      return NextResponse.json({ success: false, error: `Syarat minimal belanja Rp ${voucher.minPurchase.toLocaleString('id-ID')} belum terpenuhi` }, { status: 400 });
    }

    if (voucher.applicableTo !== "ALL" && voucher.applicableTo !== role) {
      return NextResponse.json({ success: false, error: `Voucher ini tidak berlaku untuk akun Anda` }, { status: 400 });
    }

    // Business Logic Validation
    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount !== null && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    // Return strictly masked data
    return NextResponse.json({
      success: true,
      data: {
        code: voucher.code,
        discountAmount,
        discountType: voucher.discountType,
      }
    });

  } catch (error) {
    // 4. OPAQUE ERRORS
    console.error(`[CRITICAL] Error in POST /api/vouchers/validate:`, error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
