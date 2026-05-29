// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🛑 1. PERBAIKAN UTAMA: Langsung skip middleware untuk internal data Auth.js
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 🛑 2. PERBAIKAN UTAMA: Deteksi header Server Action Next.js
  // Jika ini request Server Action, jangan jalankan logika redirect middleware agar tidak merusak JSON stream
  const isServerAction = request.headers.has("next-action");
  if (isServerAction) {
    return NextResponse.next();
  }

  // 🛑 Skip middleware untuk API/internal routes standar lainnya
  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Jalankan auth() hanya untuk request navigasi halaman murni
  const session = await auth();

  // 🔓 Public routes (no login required)
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");
  const isPublicRoute = isLandingPage || isAuthPage;

  // 🔄 Jika sudah login
  if (session?.user) {
    const userLevel = session.user.level?.toLowerCase();

    // Redirect jika login tapi nekat akses halaman auth (/auth/login atau /auth/register)
    if (isAuthPage) {
      if (userLevel === "kurir" || userLevel === "kuri") {
        return NextResponse.redirect(new URL("/kurir", request.url));
      }
      if (userLevel === "admin" || userLevel === "owner") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Pelanggan diarahkan utama ke /menu
      return NextResponse.redirect(new URL("/menu", request.url));
    }

    // Jika pelanggan mengakses root landing page ("/") setelah login, lempar juga ke /menu
    if (isLandingPage && userLevel === "pelanggan") {
      return NextResponse.redirect(new URL("/menu", request.url));
    }

    // 🛡️ Role-based access control (RBAC)
    if (userLevel === "kurir" || userLevel === "kuri") {
      const allowedPaths = ["/kurir", "/profil"];
      const isAllowed = allowedPaths.some((path) => 
        pathname === path || pathname.startsWith(`${path}/`)
      );
      if (!isAllowed && !isLandingPage) {
        return NextResponse.redirect(new URL("/kurir", request.url));
      }
    }

    if (userLevel === "pelanggan") {
      const allowedPaths = [
        "/menu", "/pesan", "/pesanan-saya", "/profil", 
        "/pembayaran", "/tracking"
      ];
      const isAllowed = allowedPaths.some((path) => 
        pathname === path || pathname.startsWith(`${path}/`)
      );
      // Jika mencoba akses route ilegal, otomatis amankan balik ke /menu
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/menu", request.url));
      }
    }

    if (userLevel === "admin" || userLevel === "owner") {
      // Admin TIDAK boleh akses route customer
      const forbiddenPaths = ["/pesan", "/pesanan-saya", "/menu"]; 
      const isForbidden = forbiddenPaths.some((path) => 
        pathname === path || pathname.startsWith(`${path}/`)
      );
      if (isForbidden) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } 
  // 🔐 Jika belum login
  else {
    if (!isPublicRoute) {
      const loginUrl = new URL("/auth/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};