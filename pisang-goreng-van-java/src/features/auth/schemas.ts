import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  whatsapp: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, "Format nomor WhatsApp tidak valid (Contoh: 08123456789)"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal satu huruf besar")
    .regex(/[0-9]/, "Password harus mengandung minimal satu angka")
    .regex(/[^A-Za-z0-9]/, "Password harus mengandung minimal satu simbol/karakter spesial"),
  consent: z.boolean().refine(val => val === true, "Anda harus menyetujui Kebijakan Privasi & Syarat Ketentuan"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});
