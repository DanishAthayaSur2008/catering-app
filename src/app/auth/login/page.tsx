// src/app/auth/login/page.tsx
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { UtensilsCrossed, Star, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login | CateringPro",
  description: "Masuk ke sistem manajemen katering premium",
};

export default async function LoginPage() {
  const session = await auth();

  // ✅ Redirect Server-side berdasarkan role
  if (session?.user?.level) {
    const level = session.user.level.toLowerCase();
    if (level === "admin" || level === "owner") return redirect("/dashboard");
    if (level === "pelanggan") return redirect("/menu");
    if (level === "kurir" || level === "kuri") return redirect("/kurir");
    return redirect("/");
  }

  return (
    <div className="min-h-svh grid lg:grid-cols-2 bg-white overflow-hidden">
      
      {/* 🎨 Sisi Kiri: Branding Visual (Hidden di Mobile) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-900 overflow-hidden">
        {/* Blobs Dekoratif agar senada dengan Landing Page */}
        <div className="absolute top-0 right-0 w-125 h-125 bg-orange-500/20 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

        <Link href="/" className="relative z-10 flex items-center gap-2 group w-fit">
          <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic text-white">
            Catering<span className="text-orange-500">Ku.</span>
          </span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
            <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Pilihan No. 1 Event Organizer</span>
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
            Kelola Pesanan <br />
            <span className="text-orange-500 underline decoration-slate-700 underline-offset-8">Lebih Profesional.</span>
          </h2>
          <div className="space-y-4">
            {[
              "Pantau status pengiriman real-time",
              "Manajemen menu katering otomatis",
              "Laporan transaksi yang transparan"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-400 font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-medium">
          © 2026 CateringPro Management System v4.0
        </div>
      </div>

      {/* 🔑 Sisi Kanan: Login Form */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-slate-50/50 relative">
        {/* Tombol Back ke Home (Mobile Only) */}
        <div className="absolute top-8 left-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
                <div className="bg-orange-500 p-1.5 rounded-lg">
                    <UtensilsCrossed className="h-4 w-4 text-white" />
                </div>
                <span className="font-black italic text-slate-900">Catering<span className="text-orange-500">Ku.</span></span>
            </Link>
        </div>

        <div className="w-full max-w-110 flex flex-col gap-8">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Selamat Datang 👋</h1>
            <p className="text-slate-500 font-medium">Masukkan kredensial Anda untuk masuk ke dashboard.</p>
          </div>
          
          {/* LoginForm Kita */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
             <LoginForm />
          </div>

          <p className="text-center text-sm text-slate-500 font-medium">
            Belum punya akun?{" "}
            <Link href="/auth/register" className="text-orange-600 font-bold hover:underline underline-offset-4 transition-all">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}