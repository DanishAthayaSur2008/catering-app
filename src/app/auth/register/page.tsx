// src/app/auth/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { registerPelanggan } from "@/app/actions/auth-actions";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerPelanggan(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/auth/login");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Daftar Akun Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input name="nama_pelanggan" placeholder="Budi Santoso" required />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input name="email" type="email" placeholder="budi@email.com" required />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input name="password" type="password" placeholder="Min. 6 karakter" required />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon *</Label>
              <Input name="no_telp" placeholder="081234567890" required />
            </div>
            <div className="space-y-2">
              <Label>Alamat Utama *</Label>
              <Input name="alamat1" placeholder="Jl. Contoh No. 1" required />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Mendaftar..." : "Daftar Sekarang"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Sudah punya akun? <a href="/auth/login" className="text-primary hover:underline">Login di sini</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}