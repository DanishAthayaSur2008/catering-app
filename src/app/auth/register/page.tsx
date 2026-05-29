"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  Loader2, 
  Eye, 
  EyeOff, 
  UtensilsCrossed, 
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerPelanggan } from "@/app/actions/auth-actions";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerPelanggan(formData);
      if (result.success) {
        toast.success("Pendaftaran Berhasil!", {
          description: "Silakan login dengan akun baru Anda.",
        });
        router.push("/auth/login");
      } else {
        toast.error("Gagal Mendaftar", {
          description: result.message,
        });
      }
    });
  }

  return (
    /** * FIX: Parent menggunakan h-svh (Small Viewport Height) dan overflow-hidden 
     * agar sidebar kiri tidak ikut bergeser saat form di scroll.
     */
    <div className="h-svh grid lg:grid-cols-[1fr_1.2fr] bg-white overflow-hidden">
      
      {/* 🎨 Sisi Kiri: Branding Visual (STIKY / FIXED) */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-900">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-125 h-125 bg-orange-500/20 rounded-full blur-[120px] -ml-64 -mt-64" />
        
        <Link href="/" className="relative z-10 flex items-center gap-2 group w-fit text-white">
          <div className="bg-orange-500 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter italic">
            Catering<span className="text-orange-500">Pro.</span>
          </span>
        </Link>

        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-bold text-orange-100 uppercase tracking-widest">Gabung Bersama Kami</span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
              Nikmati Kemudahan <br />
              <span className="text-orange-500 underline decoration-slate-700 underline-offset-8">Pesan Antar Makanan.</span>
            </h2>
            <p className="text-slate-400 font-medium max-w-md text-lg">
              Daftar sekarang dan dapatkan akses ke ratusan menu premium untuk setiap momen berharga Anda.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-slate-500 text-sm font-medium">
          Premium Catering Service © 2026
        </div>
      </div>

      {/* 🔑 Sisi Kanan: Area Form (HANYA INI YANG BISA DI-SCROLL) */}
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
        <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50/50 relative">
          
          {/* Tombol Kembali - Diletakkan di dalam container scroll agar ikut bergeser atau tetap di atas */}
          <div className="w-full max-w-120 mb-8">
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-120 flex flex-col gap-8 pb-12"
          >
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">Buat Akun Baru</h1>
              <p className="text-slate-500 font-medium">Lengkapi data diri Anda untuk mulai memesan.</p>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Nama Lengkap</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input 
                      name="nama_pelanggan" 
                      placeholder="Budi Santoso" 
                      required 
                      className="h-13 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input 
                      name="email" 
                      type="email" 
                      placeholder="budi@email.com" 
                      required 
                      className="h-13 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    />
                  </div>
                </div>

                {/* No. Telepon */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Nomor Telepon</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input 
                      name="no_telp" 
                      placeholder="08123456..." 
                      required 
                      className="h-13 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min. 6 karakter" 
                      required 
                      className="h-13 pl-12 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Alamat Utama */}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-bold ml-1 text-xs uppercase tracking-wider">Alamat Pengiriman Utama</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <textarea 
                      name="alamat1" 
                      placeholder="Masukkan alamat lengkap pengiriman Anda..." 
                      required 
                      rows={3}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-base min-h-25 resize-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white font-black text-lg transition-all shadow-xl shadow-slate-200 border-none mt-4" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Membuat Akun...</span>
                    </div>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </Button>
              </form>
            </div>

            <p className="text-center text-sm text-slate-500 font-medium">
              Sudah menjadi bagian dari kami?{" "}
              <Link href="/auth/login" className="text-orange-600 font-bold hover:underline underline-offset-4 transition-all">
                Login di sini
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}