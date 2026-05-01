// src/components/dashboard/admin-dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react";

export async function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
      <p className="text-muted-foreground">Kelola operasional katering & pantau performa bisnis.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">124</div><p className="text-xs text-muted-foreground">+4 bulan ini</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paket Aktif</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">18</div><p className="text-xs text-muted-foreground">3 paket baru</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pesanan Bulan Ini</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">89</div><p className="text-xs text-muted-foreground">+12% dari bulan lalu</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pendapatan</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">Rp 45.2M</div><p className="text-xs text-muted-foreground">Akumulasi tahun ini</p></CardContent></Card>
      </div>
    </div>
  );
}