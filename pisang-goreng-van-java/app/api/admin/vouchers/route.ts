import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/features/auth/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: vouchers });
  } catch (error) {
    console.error("GET /api/admin/vouchers Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableTo
    } = body;

    // Validation
    if (!code || !discountType || discountValue == null || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.voucher.findUnique({
      where: { code }
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Kode voucher sudah ada" }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : 0,
        isActive: isActive ?? true,
        applicableTo: applicableTo || "ALL"
      }
    });

    return NextResponse.json({ success: true, data: voucher });
  } catch (error) {
    console.error("POST /api/admin/vouchers Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
    }

    const voucher = await prisma.voucher.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json({ success: true, data: voucher });
  } catch (error) {
    console.error("PATCH /api/admin/vouchers Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.voucher.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/vouchers Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
