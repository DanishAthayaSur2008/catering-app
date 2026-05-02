// src/app/auth/login/page.tsx
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Catering Management",
  description: "Masuk ke sistem manajemen katering",
};

export default async function LoginPage() {
  // ✅ Cek session di server-side
  const session = await auth();

  // ✅ Jika sudah login, redirect berdasarkan role (SEBELUM render form)
  if (session?.user?.level) {
    switch (session.user.level) {
      case "admin":
      case "owner":
        return redirect("/dashboard");
      case "pelanggan":
        return redirect("/pesan"); // ✅ Pelanggan LANGSUNG ke /pesan, bukan /dashboard!
      case "kurir":
      case "kuri":
        return redirect("/pengiriman");
      default:
        return redirect("/");
    }
  }

  // ✅ Jika belum login, render form seperti biasa
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <LoginForm />
    </div>
  );
}