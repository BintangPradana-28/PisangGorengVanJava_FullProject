import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/features/auth/authOptions";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, data: [] });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, data: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { variantId: true },
    });

    const favoriteVariantIds = favorites.map((fav) => fav.variantId);

    return NextResponse.json({ success: true, data: favoriteVariantIds });
  } catch (error) {
    console.error("GET /api/favorites Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return NextResponse.json({ success: false, error: "Variant ID required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const existingFav = await prisma.favorite.findUnique({
      where: {
        userId_variantId: {
          userId: user.id,
          variantId,
        },
      },
    });

    if (existingFav) {
      await prisma.favorite.delete({
        where: { id: existingFav.id },
      });
      return NextResponse.json({ success: true, action: "removed", variantId });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          variantId,
        },
      });
      return NextResponse.json({ success: true, action: "added", variantId });
    }
  } catch (error) {
    console.error("POST /api/favorites Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
