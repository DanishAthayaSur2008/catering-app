// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // 🔓 Public routes (tidak butuh login)
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/api/auth"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔐 Protected routes: wajib login
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const userLevel = session.user.level;

  // 🚫 STRICT BLOCK: Admin-only routes (PELANGGAN TIDAK BOLEH AKSES)
  const adminOnlyRoutes = ["/dashboard", "/laporan", "/pelanggan", "/pesanan"]; // ✅ Tambah '/pesanan' di sini!
  if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
    if (userLevel !== "admin" && userLevel !== "owner") {
      // Pelanggan → redirect ke /pesan | Kurir → redirect ke /pengiriman
      const fallbackUrl = userLevel === "pelanggan" ? "/pesan" : "/pengiriman";
      return NextResponse.redirect(new URL(fallbackUrl, request.url));
    }
  }

  // ✅ ROLE: Pelanggan (Customer) - Hanya boleh akses route customer
  if (userLevel === "pelanggan") {
    const allowedRoutes = [
      "/pesan",
      "/pesanan-saya",
      "/profil", 
      "/pembayaran",
      "/tracking",
      "/paket", // ✅ Tambah /paket agar bisa browse
    ];
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/pesan", request.url));
    }
  }

  // ✅ ROLE: Kurir
  if (userLevel === "kurir" || userLevel === "kuri") {
    const allowedRoutes = ["/pengiriman"];
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/pengiriman", request.url));
    }
  }

  // ✅ ROLE: Admin & Owner
  if (userLevel === "admin" || userLevel === "owner") {
    // Redirect admin yang nyasar ke route customer
    if (pathname.startsWith("/pesanan-saya") || pathname.startsWith("/pesan")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const allowedRoutes = [
      "/dashboard",
      "/pelanggan",
      "/paket",
      "/pesanan",
      "/pengiriman",
      "/laporan",
    ];
    const isAllowed = allowedRoutes.some((route) => pathname.startsWith(route));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};