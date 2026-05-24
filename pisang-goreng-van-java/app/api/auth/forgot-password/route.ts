import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/src/features/auth/schemas";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Format email tidak valid", 
          data: parsed.error.flatten() 
        }, 
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // 2. Cek user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.isDeleted) {
      // Security: Prevent User Enumeration by always returning success for forgot password
      return NextResponse.json(
        { success: true, message: "Jika email terdaftar, instruksi reset akan dikirim." },
        { status: 200 }
      );
    }

    // 3. Generate Cryptographically Secure Token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // 4. Save to Database
    await prisma.resetToken.create({
      data: {
        token: resetToken,
        expiresAt,
        userId: user.id,
      },
    });

    // 5. Mock Email Sending
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`;
    console.log(`\n\n[MOCK EMAIL SEND]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset Password Anda`);
    console.log(`Link: ${resetLink}\n\n`);

    return NextResponse.json(
      { success: true, message: "Jika email terdaftar, instruksi reset akan dikirim." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
