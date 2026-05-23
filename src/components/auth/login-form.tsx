// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Eye, EyeOff, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 🔍 FIX: Ubah default fallback dari "/pesan" menjadi "/menu"
  const callbackUrl = searchParams.get("callbackUrl") || "/menu";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Akses Ditolak", {
          description: "Email atau password salah. Silakan periksa kembali.",
        });
        return;
      }

      toast.success("Selamat Datang Kembali!", {
        description: "Berhasil masuk ke akun Anda.",
      });

      // Mengarahkan ke /menu (atau sesuai callbackUrl dari halaman yang di-protect)
      router.push(callbackUrl);
      router.refresh();
      
    } catch {
      toast.error("Sistem Sibuk", {
        description: "Terjadi kesalahan teknis, coba lagi nanti.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-slate-700 font-bold ml-1">Alamat Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      placeholder="nama@email.com"
                      className="h-13 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base"
                      disabled={isLoading}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="font-medium" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <FormLabel className="text-slate-700 font-bold">Password</FormLabel>
                  <button type="button" className="text-xs font-bold text-orange-600 hover:text-orange-700">Lupa Password?</button>
                </div>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                      <Lock className="h-5 w-5" />
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-13 pl-12 pr-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base"
                      disabled={isLoading}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="font-medium" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-13 rounded-2xl bg-slate-900 hover:bg-orange-600 text-white font-black text-lg transition-all shadow-lg shadow-slate-200 border-none" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Menyiapkan Sesi...</span>
              </div>
            ) : (
              "Masuk ke Akun"
            )}
          </Button>
        </form>
      </Form>

      {/* Demo Credentials */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50">
        <div className="flex items-center gap-2 bg-blue-100/50 px-4 py-2 text-blue-700">
          <Info className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Admin Access</span>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div className="space-y-1">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Administrator</p>
            <p className="text-slate-700 font-medium">admin@catering.com</p>
            <p className="text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100 inline-block">admin123</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Logistik/Kurir</p>
            <p className="text-slate-700 font-medium">kurir@catering.com</p>
            <p className="text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100 inline-block">admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}