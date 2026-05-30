import { z } from "zod";

// ============================================================================
// C-LEVEL SECURITY MANDATE: THE ABSOLUTE QUARANTINE
// All schemas MUST use .strict() to prevent mass assignment and prototype pollution.
// All strings MUST have hard upper limits to prevent Buffer Overflows / ReDoS.
// ============================================================================

export const loginSchema = z.object({
  // Gunakan batas maksimal standar untuk mencegah serangan payload raksasa.
  username: z.string().trim().min(3).max(254).email(),
  password: z.string().min(8).max(128),
}); // Removed .strict() to allow NextAuth internal fields

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().min(3).max(254).email(),
  whatsapp: z.string().trim().min(9).max(16).regex(/^[0-9+]+$/, "Hanya boleh angka dan tanda plus"),
  password: z
    .string()
    .min(8, "Sandi minimal 8 karakter")
    .max(128, "Sandi maksimal 128 karakter"),
  consent: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui Kebijakan Privasi",
  }),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(3).max(254).email(),
}).strict();
