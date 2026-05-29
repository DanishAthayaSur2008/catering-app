// src/components/auth/login-form.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Eye, EyeOff, ShieldAlert, Phone } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { resetPasswordTanpaEmail } from "@/app/actions/auth-actions";

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
  
  // State untuk kontrol Modal Lupa Password
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  
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

  // Handler Kirim Form Lupa Password
  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await resetPasswordTanpaEmail(formData);
      if (res.success) {
        toast.success("Pemulihan Berhasil", { description: res.message });
        setIsForgotOpen(false);
      } else {
        toast.error("Pemulihan Gagal", { description: res.message });
      }
    });
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
                  <button 
                    type="button" 
                    onClick={() => setIsForgotOpen(true)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Lupa Password?
                  </button>
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

      {/* 🔐 MODAL DIALOG LUPA PASSWORD */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-110 rounded-3xl p-6 border-none shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-2 shadow-sm border border-orange-100">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
              Pulihkan Akun Anda
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
              Verifikasi identitas akun katering Anda dengan memasukkan Email dan Nomor Telepon aktif yang telah terdaftar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 mt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Email Terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="contoh@email.com" 
                  className="pl-11 rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">Nomor Telepon WA</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  name="noTelp" 
                  type="text" 
                  required 
                  placeholder="08xxxxxxxxxx" 
                  className="pl-11 rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1 border-t border-dashed border-slate-100 pt-3">
              <label className="text-xs font-bold text-slate-700 ml-1">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  name="passwordBaru" 
                  type={showNewPassword ? "text" : "password"} 
                  required 
                  placeholder="Minimal 6 Karakter" 
                  className="pl-11 pr-11 rounded-xl border-slate-200 bg-slate-50/50 h-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsForgotOpen(false)}
                className="rounded-xl border-slate-200 text-slate-500 font-bold text-sm h-11"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm h-11 shadow-md shadow-orange-100 border-none"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Setel Ulang Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}