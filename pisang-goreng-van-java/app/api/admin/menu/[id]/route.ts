import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { updateMenuVariantSchema } from "@/src/features/menu/schemas";
import { authOptions } from "@/src/features/auth/authOptions";
import { sseEmitter } from "@/lib/eventEmitter";
// GET /api/admin/menu/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const variant = await prisma.menuVariant.findUnique({
      where: { id, isDeleted: false },
    });

    if (!variant) {
      return NextResponse.json(
        { success: false, message: "Variant tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: variant });
  } catch (error) {
    console.error("GET /api/admin/menu/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menu/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsedData = updateMenuVariantSchema.safeParse(body);
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

    // Check if exists
    const existing = await prisma.menuVariant.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Variant tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedVariant = await prisma.menuVariant.update({
      where: { id },
      data: parsedData.data,
    });

    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resource: "MenuVariant",
        resourceId: id,
        userId: session?.user?.id || "system",
        details: JSON.stringify(parsedData.data),
        ipAddress: ip,
      }
    });

    sseEmitter.emit("menuUpdated", { action: "UPDATE", data: updatedVariant });

    return NextResponse.json({ success: true, data: updatedVariant });
  } catch (error) {
    console.error("PUT /api/admin/menu/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menu/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = await prisma.menuVariant.findUnique({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Variant tidak ditemukan" },
        { status: 404 }
      );
    }

    // Soft delete
    await prisma.menuVariant.update({
      where: { id },
      data: { isDeleted: true },
    });

    const session = await getServerSession(authOptions);
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        resource: "MenuVariant",
        resourceId: id,
        userId: session?.user?.id || "system",
        details: JSON.stringify({ isDeleted: true }),
        ipAddress: ip,
      }
    });

    sseEmitter.emit("menuUpdated", { action: "DELETE", data: { id } });

    return NextResponse.json({ success: true, message: "Variant berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/admin/menu/[id] Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
