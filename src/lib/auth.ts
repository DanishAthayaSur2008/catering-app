// src/lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailStr = credentials.email as string;
        const passwordStr = credentials.password as string;

        // 1️⃣ Cek Pelanggan
        const pelanggan = await prisma.pelanggan.findUnique({
          where: { email: emailStr },
        });

        if (pelanggan && pelanggan.password) {
          const isValid = await bcrypt.compare(passwordStr, pelanggan.password);
          if (isValid) {
            return {
              id: pelanggan.id.toString(), // Tetap string sesuai d.ts kita
              name: pelanggan.namaPelanggan,
              email: pelanggan.email,
              level: "pelanggan",
            };
          }
        }

        // 2️⃣ Cek User (Admin/Owner/Kurir)
        const user = await prisma.user.findUnique({
          where: { email: emailStr },
        });

        if (user && user.password) {
          const isValid = await bcrypt.compare(passwordStr, user.password);
          if (isValid) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              level: user.level,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Simpan data ke token saat login pertama kali
        token.id = user.id as string;
        token.level = (user as { level: string }).level;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // ✅ Perbaikan: Paksa (cast) unknown menjadi string
        session.user.id = token.id as string;
        session.user.level = token.level as string;
      }
      return session;
    },
  },
});