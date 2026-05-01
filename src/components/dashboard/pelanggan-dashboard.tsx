// src/components/dashboard/pelanggan-dashboard.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Truck, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export async function PelangganDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const activeOrders = await prisma.pemesanan.count({
    where: { idPelanggan: Number(session.user.id), NOT: { statusPesanan: { in: ["Selesai", "Dibatalkan"] } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Pelanggan</h2>
          <p className="text-muted-foreground">Kelola pesanan & pantau pengiriman Anda.</p>
        </div>
        <Button asChild>
          <Link href="/paket">+ Pesan Katering</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle><ShoppingBag className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{activeOrders}</div><p className="text-xs text-muted-foreground">Sedang diproses/dikirim</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pengiriman Hari Ini</CardTitle><Truck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">1</div><p className="text-xs text-muted-foreground">Estimasi tiba: 14:00</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Status Terakhir</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><Badge className="bg-blue-100 text-blue-800">Sedang_Diproses</Badge><p className="text-xs text-muted-foreground mt-1">Pesanan #8921</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Riwayat Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Lihat semua pesanan Anda di halaman <Link href="/pesanan" className="text-primary hover:underline">Pesanan Saya</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}