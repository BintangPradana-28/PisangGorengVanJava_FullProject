'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/features/auth/authOptions";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

// 1. ZOD SCHEMA: Menutup Celah Runtime Crash & Validasi Logika Bisnis
// Memastikan semua data yang masuk memiliki struktur yang benar dan bernilai positif (> 0)
const PriceMatrixSchema = z.object({
  kembung: z.number().int("Harga harus angka bulat").positive("Harga Kembung tidak boleh minus/nol"),
  lumpia: z.number().int("Harga harus angka bulat").positive("Harga Lumpia tidak boleh minus/nol"),
  krispy: z.number().int("Harga harus angka bulat").positive("Harga Krispy tidak boleh minus/nol"),
});

const UpdateMenuSchema = z.object({
  id: z.string().min(1, "ID Rasa tidak valid"),
  flavorName: z.string().min(1, "Nama rasa tidak boleh kosong"),
  prices: PriceMatrixSchema,
});

// Mengekstrak tipe TypeScript secara otomatis dari skema Zod
export type UpdateMenuInput = z.infer<typeof UpdateMenuSchema>;

// Mock database instance for the Pisang Van Java platform
const mockDb = {
  update: async (id: string, data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { id, ...data };
  }
};

/**
 * Server Action to update matrix pricing for specific banana flavors.
 * Controlled from the /app/(admin)/manage-menu dashboard view.
 */
export async function updateMenuVariant(rawInput: UpdateMenuInput) {
  try {
    const session = await getServerSession(authOptions);

    // 2. SECURITY FIX: Hard Stop (Interupsi Mutlak)
    // Jika tidak ada sesi, fungsi langsung berhenti dan melempar error, mencegah eksekusi DB.
    if (!session || !session.user) {
      console.warn(`[SECURITY WARNING]: Blocked unauthorized matrix update attempt.`);
      return { 
        success: false, 
        error: "Akses ditolak. Sesi tidak valid atau telah kedaluwarsa." 
      };
    }

    // 3. RUNTIME & BUSINESS LOGIC FIX: Parsing Defensif
    // safeParse tidak akan membuat aplikasi crash jika `rawInput` berantakan.
    const validatedData = UpdateMenuSchema.safeParse(rawInput);
    
    if (!validatedData.success) {
      console.error("[VALIDATION ERROR]:", validatedData.error.flatten().fieldErrors);
      return {
        success: false,
        error: "Data yang dikirim tidak valid. Pastikan semua harga lebih dari Rp0."
      };
    }

    const input = validatedData.data;

    // Database payload mapping (sekarang dijamin 100% aman)
    const updatedRecord = await mockDb.update(input.id, {
      name: input.flavorName,
      pricing: {
        kembung: input.prices.kembung,
        lumpia: input.prices.lumpia,
        krispy: input.prices.krispy,
      },
      updatedAt: new Date().toISOString()
    });

    // Revalidate the customer-facing menu path to clear cache
    revalidatePath("/menu");

    // Audit Log
    await logAudit("UPDATE", "MenuVariant", updatedRecord.id, {
      kembung: input.prices.kembung,
      lumpia: input.prices.lumpia,
      krispy: input.prices.krispy
    });

    return { 
      success: true, 
      message: `Matriks harga untuk '${updatedRecord.name}' berhasil diperbarui.`,
      data: updatedRecord 
    };

  } catch (error) {
    console.error("[CRITICAL BACKEND ERROR]: Matrix update pipeline failed", error);
    return { 
      success: false, 
      error: "Terjadi kegagalan sistem internal. Operasi dibatalkan." 
    };
  }
}

export async function toggleAvailability(id: string, isAvailable: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Akses ditolak. Sesi tidak valid." };
    }

    const updatedRecord = await prisma.menuVariant.update({
      where: { id },
      data: { isAvailable },
    });

    // Revalidate customer-facing pages
    revalidatePath("/");
    revalidatePath("/menu-spesial");
    revalidatePath("/(user)", "layout");
    
    // Audit Log
    await logAudit("TOGGLE_AVAILABILITY", "MenuVariant", updatedRecord.id, { isAvailable });

    return { 
      success: true, 
      message: `Status ketersediaan '${updatedRecord.flavorName}' diperbarui.`,
      data: updatedRecord 
    };
  } catch (error) {
    console.error("[CRITICAL BACKEND ERROR]: Toggle availability failed", error);
    return { 
      success: false, 
      error: "Terjadi kegagalan sistem internal. Operasi dibatalkan." 
    };
  }
}