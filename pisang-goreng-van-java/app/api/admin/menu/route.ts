import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { createMenuVariantSchema } from "@/src/features/menu/schemas";
import { authOptions } from "@/src/features/auth/authOptions";
import { sseEmitter } from "@/lib/eventEmitter";

// GET /api/admin/menu
export async function GET(req: NextRequest) {
  try {
    // Note: Middleware protects this route, no need to manually check session again
    const variants = await prisma.menuVariant.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json({ success: true, data: variants });
  } catch (error) {
    console.error("GET /api/admin/menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menu
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Zero Trust Validation
    const parsedData = createMenuVariantSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Data tidak valid", 
          data: parsedData.error.flatten() 
        },
        { status: 400 }
      );
    }

    const { flavorName, priceKembung, priceLumpia, priceKrispy, wholesaleKembung, wholesaleLumpia, wholesaleKrispy, imageUrl, deskripsi_topping, isActive, isAvailable, tags } = parsedData.data;

    const newVariant = await prisma.menuVariant.create({
      data: {
        flavorName,
        priceKembung,
        priceLumpia,
        priceKrispy,
        wholesaleKembung,
        wholesaleLumpia,
        wholesaleKrispy,
        imageUrl: imageUrl || null,
        deskripsi_topping: deskripsi_topping || null,
        isActive: isActive !== undefined ? isActive : true,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        tags: tags || [],
      },
    });

    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        resource: "MenuVariant",
        resourceId: newVariant.id,
        userId: session?.user?.id || "system",
        details: JSON.stringify({ flavorName, priceKembung, priceLumpia, priceKrispy }),
        ipAddress: ip,
      }
    });

    sseEmitter.emit("menuUpdated", { action: "CREATE", data: newVariant });

    return NextResponse.json({ success: true, data: newVariant }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/menu Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
