// src/app/laporan/page.tsx
import { auth } from "@/lib/auth";
import { 
  getRevenueByMonth, 
  getOrderStatusStats, 
  getTopPackages,
  getLaporanSummary,
} from "@/app/actions/laporan-actions";
import { RevenueChart } from "@/components/laporan/revenue-chart";
import { StatusPieChart } from "@/components/laporan/status-pie-chart";
import { TopPackagesChart } from "@/components/laporan/top-packages-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import { Download, Package, ShoppingCart, Users, Banknote } from "lucide-react";

interface LaporanPageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const session = await auth();
  
  // ✅ Role check: hanya admin/owner
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        🔒 Akses ditolak. Hanya admin/owner yang dapat melihat laporan.
      </div>
    );
  }

  const params = await searchParams;
  const startDate = params?.startDate;
  const endDate = params?.endDate;

  // ✅ Fetch data (actions sudah return ActionResponse)
  const [revenueRes, statusRes, packagesRes, summaryRes] = await Promise.all([
    getRevenueByMonth({ startDate, endDate }),
    getOrderStatusStats(),
    getTopPackages(5),
    getLaporanSummary({ startDate, endDate }),
  ]);

  // ✅ FIX: Proper type extraction dengan type guard
  const revenueData = revenueRes.success && Array.isArray(revenueRes.data) 
    ? revenueRes.data as { name: string; value: number }[] 
    : [];
    
  const statusData = statusRes.success && Array.isArray(statusRes.data) 
    ? statusRes.data as { name: string; value: number; total: number }[] 
    : [];
    
  const packagesData = packagesRes.success && Array.isArray(packagesRes.data) 
    ? packagesRes.data as { name: string; terjual: number; revenue: number }[] 
    : [];
    
  const summary = summaryRes.success && summaryRes.data 
    ? summaryRes.data as { 
        totalPesanan: number; 
        totalRevenue: number; 
        totalPelanggan: number; 
        averageOrder: number; 
      } 
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan & Statistik</h2>
          <p className="text-muted-foreground">
            Analisis performa bisnis katering Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input 
                type="date" 
                name="startDate" 
                defaultValue={startDate}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal Akhir</Label>
              <Input 
                type="date" 
                name="endDate" 
                defaultValue={endDate}
                className="w-full sm:w-auto"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button type="submit" size="sm">Filter</Button>
                <Button type="button" variant="ghost" size="sm" asChild>
                  <a href="/laporan">Reset</a>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPesanan}</div>
              <p className="text-xs text-muted-foreground">Pesanan berhasil</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatRupiah(summary.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Akumulasi revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Order</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(summary.averageOrder)}
              </div>
              <p className="text-xs text-muted-foreground">Per pesanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPelanggan}</div>
              <p className="text-xs text-muted-foreground">Pelanggan terdaftar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Grafik Pendapatan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueData.length > 0 ? (
              <RevenueChart data={revenueData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <StatusPieChart data={statusData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada data status
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Packages */}
        <Card>
          <CardHeader>
            <CardTitle>Paket Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {packagesData.length > 0 ? (
              <TopPackagesChart data={packagesData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Tidak ada data paket
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table (Preview) */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Lihat semua pesanan di halaman <a href="/pesanan" className="text-primary hover:underline">Pesanan</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}