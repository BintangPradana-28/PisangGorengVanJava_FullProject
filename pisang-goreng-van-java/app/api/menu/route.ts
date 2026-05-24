/**
 * app/api/menu/route.ts  — B2C Public Read-Only Endpoint
 * ─────────────────────────────────────────────────────────────────────────────
 * AKSES: Publik (tanpa autentikasi) — hanya mendukung metode GET.
 *
 * Strategi caching:
 *  - `export const revalidate = 60` → Next.js ISR: response di-cache 60 detik
 *    di server/CDN. Hanya 1 request ke DB setiap menit meskipun ada 10.000
 *    pengunjung bersamaan. Cocok untuk menu yang jarang berubah.
 *
 * Zero-Disclosure DTO:
 *  - Kolom internal (isDeleted, harga legacy, deskripsi_topping legacy)
 *    TIDAK dikirim ke klien agar tidak bocor struktur DB internal.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { MenuVariant, Topping } from "@prisma/client";

export const revalidate = 60;

// ── DTO types — hanya field yang boleh terlihat publik ────────────────────────

type VariantPublicDTO = {
  id: string;
  flavorName: string;
  priceKembung: number;
  priceLumpia: number;
  priceKrispy: number;
  imageUrl: string | null;
  rating?: number;
  reviewCount?: number;
};

type ToppingPublicDTO = {
  id: string;
  name: string;
  price: number;
  emoji: string | null;
};

function toVariantDTO(v: MenuVariant & { reviews?: { rating: number }[] }): VariantPublicDTO {
  let rating = 0;
  let reviewCount = 0;
  
  if (v.reviews && v.reviews.length > 0) {
    reviewCount = v.reviews.length;
    const sum = v.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    rating = Number((sum / reviewCount).toFixed(1));
  }

  return {
    id: v.id,
    flavorName: v.flavorName,
    priceKembung: v.priceKembung,
    priceLumpia: v.priceLumpia,
    priceKrispy: v.priceKrispy,
    imageUrl: v.imageUrl ?? null,
    rating,
    reviewCount
  };
}

function toToppingDTO(t: Topping): ToppingPublicDTO {
  return {
    id: t.id,
    name: t.name,
    price: t.price,
    emoji: t.emoji ?? null,
  };
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const [variants, toppings] = await Promise.all([
      prisma.menuVariant.findMany({
        where: { isDeleted: false, isActive: true },
        orderBy: { flavorName: "asc" },
        include: { reviews: { select: { rating: true } } }
      }),
      prisma.topping.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        variants: variants.map(toVariantDTO),
        toppings: toppings.map(toToppingDTO),
      },
    });
  } catch (error) {
    // Defensive: hanya log secara internal, JANGAN bocorkan detail ke klien
    console.error("[GET /api/menu]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
