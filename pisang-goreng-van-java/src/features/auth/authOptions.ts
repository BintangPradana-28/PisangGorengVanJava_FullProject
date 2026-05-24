import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "./schemas";
import { rateLimit } from "@/lib/redis";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Cast to any to bypass type mismatch between @auth/prisma-adapter and next-auth v4
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || "MOCK_CLIENT_ID",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "MOCK_CLIENT_SECRET",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER", // OAuth users default to CUSTOMER
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);
        
        if (!parsedCredentials.success) {
          throw new Error("Format kredensial tidak valid");
        }

        const { username, password } = parsedCredentials.data;

        // Upstash Redis Brute-Force Protection
        const { success: rateLimitSuccess } = await rateLimit.limit(`login_${username}`);
        if (!rateLimitSuccess) {
          throw new Error("Terlalu banyak percobaan gagal. Coba lagi dalam 15 menit.");
        }

        const user = await prisma.user.findUnique({
          where: { email: username },
        });

        if (!user || user.isDeleted) {
          throw new Error("Email atau Password tidak cocok.");
        }

        if (!user.passwordHash) {
          throw new Error("Akun ini didaftarkan menggunakan Google. Silakan klik Log In with Google.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error("Email atau Password tidak cocok.");
        }

        return { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Saat login, inject ID dan Role ke dalam token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      // Teruskan ID dan Role dari token ke session client
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/member-login", // Halaman login B2C
    error: "/member-login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_key_change_me_in_production",
  debug: process.env.NODE_ENV === "development",
};
