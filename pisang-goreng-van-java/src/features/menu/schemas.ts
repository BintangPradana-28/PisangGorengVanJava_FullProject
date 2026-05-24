/**
 * src/features/menu/schemas.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-Trust Validation Layer — semua input dari luar harus melewati layer ini
 * sebelum menyentuh database.
 *
 * Pendekatan defensif:
 *  - Harga divalidasi sebagai integer POSITIF (bukan hanya non-negatif)
 *    untuk mencegah produk harga 0 atau minus secara tidak sengaja.
 *  - flavorName & name wajib minimal 3 karakter agar tidak ada entry kosong.
 *  - imageUrl menggunakan .optional().or(z.literal("")) agar frontend bisa
 *    mengirim string kosong maupun undefined tanpa error.
 */

import { z } from "zod";

// ── MenuVariant Schemas ───────────────────────────────────────────────────────

export const createMenuVariantSchema = z.object({
  flavorName: z.string().min(3, "Nama varian minimal 3 karakter").max(100, "Nama varian terlalu panjang"),
  priceKembung: z.number().int("Harga harus berupa bilangan bulat").positive("Harga Kembung harus lebih dari 0"),
  priceLumpia: z.number().int("Harga harus berupa bilangan bulat").positive("Harga Lumpia harus lebih dari 0"),
  priceKrispy: z.number().int("Harga harus berupa bilangan bulat").positive("Harga Krispy harus lebih dari 0"),
  wholesaleKembung: z.number().int("Harga harus berupa bilangan bulat").nonnegative("Harga Kembung (Grosir) tidak boleh negatif").default(0),
  wholesaleLumpia: z.number().int("Harga harus berupa bilangan bulat").nonnegative("Harga Lumpia (Grosir) tidak boleh negatif").default(0),
  wholesaleKrispy: z.number().int("Harga harus berupa bilangan bulat").nonnegative("Harga Krispy (Grosir) tidak boleh negatif").default(0),
  imageUrl: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  deskripsi_topping: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  tags: z.array(z.string()).optional().default([]),
});

// Partial() memungkinkan PATCH/PUT parsial — hanya field yang dikirim yang diupdate
export const updateMenuVariantSchema = createMenuVariantSchema.partial();

// ── Topping Schemas ───────────────────────────────────────────────────────────

export const createToppingSchema = z.object({
  name: z.string().min(3, "Nama topping minimal 3 karakter").max(100, "Nama topping terlalu panjang"),
  // Harga topping saat ini fixed 2000, tapi kita validasi agar tidak negatif
  // jika suatu saat policy berubah.
  price: z.number().int("Harga harus berupa bilangan bulat").nonnegative("Harga tidak boleh negatif").default(2000),
  emoji: z.string().max(10, "Emoji terlalu panjang").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const updateToppingSchema = createToppingSchema.partial();

// ── TypeScript Types (derived from Zod schemas) ───────────────────────────────

export type CreateMenuVariantInput = z.infer<typeof createMenuVariantSchema>;
export type UpdateMenuVariantInput = z.infer<typeof updateMenuVariantSchema>;
export type CreateToppingInput = z.infer<typeof createToppingSchema>;
export type UpdateToppingInput = z.infer<typeof updateToppingSchema>;
