import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/features/auth/authOptions";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/redis";
import { z } from "zod";
export const dynamic = "force-dynamic";


const profileSchema = z.object({
  name: z.string().optional(),
  phone: z.string()
    .min(1, "Nomor WhatsApp tidak boleh kosong")
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/, "Format nomor telepon tidak valid")
    .transform(val => {
      let formatted = val.replace(/\D/g, "");
      if (formatted.startsWith("08")) {
        formatted = "62" + formatted.substring(1);
      }
      return "+" + formatted;
    })
    .optional(),
  address: z.string()
    .min(1, "Alamat tidak boleh kosong")
    .max(500, "Alamat maksimal 500 karakter")
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/user/profile Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting Protection (Max 5 requests per minute)
    const { success: rateLimitSuccess } = await rateLimit.limit(`profile_update_${userId}`);
    if (!rateLimitSuccess) {
      return NextResponse.json({ success: false, message: "Terlalu banyak permintaan. Coba lagi sebentar." }, { status: 429 });
    }

    const body = await req.json();

    // Zod Server Validation
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        message: parsed.error.issues[0]?.message || "Data tidak valid"
      }, { status: 400 });
    }

    const { name, phone, address } = parsed.data;

    // Zero-Trust Database Mutation
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        phone: phone !== undefined ? phone : undefined,
        address: address !== undefined ? address : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PUT /api/user/profile Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
