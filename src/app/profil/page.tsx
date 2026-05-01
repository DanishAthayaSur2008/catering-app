// src/app/profil/page.tsx - CUSTOMER PROFILE
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, ShoppingBag } from "lucide-react";
import Link from "next/link";

// ✅ Import helper yang sudah kita buat sebelumnya
import { getMyProfile } from "@/app/actions/profile-actions"; 

export default async function ProfilPage() {
  const session = await auth();
  
  // ✅ Proteksi awal: Cek session & level
  if (!session?.user || session.user.level !== "pelanggan") {
    redirect("/dashboard");
  }

  // ✅ MENGGUNAKAN HELPER: Tidak perlu panggil prisma.findUnique lagi di sini
  // Semua logic ID (Number) dan ownership sudah ditangani di dalam action
  const pelanggan = await getMyProfile();

  if (!pelanggan) {
    // Jika data pelanggan tidak ditemukan di DB
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profil Saya</h2>
        <p className="text-muted-foreground">
          Kelola informasi pribadi dan alamat pengiriman Anda secara mandiri.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={pelanggan.foto || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {pelanggan.namaPelanggan.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-lg">{pelanggan.namaPelanggan}</span>
                <span className="text-xs font-normal text-muted-foreground">Level: Pelanggan</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">Nama Lengkap</Label>
              <p className="font-medium">{pelanggan.namaPelanggan}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">Nomor Telepon</Label>
              <p className="font-medium">{pelanggan.noTelp || "-"}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase">Alamat Utama</Label>
              <p className="text-sm">{pelanggan.alamat1 || "-"}</p>
            </div>

            {(pelanggan.address2 || pelanggan.address3) && (
              <div className="pt-2 space-y-3 border-t">
                {pelanggan.address2 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">Alamat Tambahan 1</Label>
                    <p className="text-sm">{pelanggan.address2}</p>
                  </div>
                )}
                {pelanggan.address3 && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase">Alamat Tambahan 2</Label>
                    <p className="text-sm">{pelanggan.address3}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
               <Button variant="outline" size="sm" className="w-full">
                 <Pencil className="mr-2 h-4 w-4" />
                 Edit Profil
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order History Summary */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Aktivitas Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="bg-muted p-4 rounded-full">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Siap pesan catering lagi?</p>
              <p className="text-xs text-muted-foreground">
                Pantau pesanan yang sedang diproses atau lihat riwayat lama.
              </p>
            </div>
            <Link href="/pesanan" className="w-full">
              <Button variant="secondary" className="w-full">
                Lihat Pesanan Saya
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}