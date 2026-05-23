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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRupiah } from "@/lib/utils";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Banknote, 
  Calendar, 
  FileText, 
  Table as TableIcon,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Link from 'next/link'

interface LaporanPageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}

export default async function LaporanPage({ searchParams }: LaporanPageProps) {
  const session = await auth();
  
  // ✅ Role check: Hanya admin/owner
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Card className="max-w-md border-none shadow-lg">
           <CardContent className="pt-6 text-center space-y-4">
              <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Akses Ditolak</h3>
                <p className="text-muted-foreground">Maaf, hanya Admin atau Owner yang diizinkan mengakses halaman laporan dan statistik bisnis.</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Kembali ke Dashboard</Link>
              </Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  const params = await searchParams;
  const startDate = params?.startDate || "";
  const endDate = params?.endDate || "";

  // Query string untuk tombol Export agar sesuai dengan filter yang sedang aktif
  const exportParams = new URLSearchParams();
  if (startDate) exportParams.set("startDate", startDate);
  if (endDate) exportParams.set("endDate", endDate);
  const queryString = exportParams.toString() ? `?${exportParams.toString()}` : "";

  // ✅ Fetch data
  const [revenueRes, statusRes, packagesRes, summaryRes] = await Promise.all([
    getRevenueByMonth({ startDate, endDate }),
    getOrderStatusStats(),
    getTopPackages(5),
    getLaporanSummary({ startDate, endDate }),
  ]);

  // Type Casting & Safety Checks
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
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <Sidebar userRole={session?.user?.level} currentPath="/laporan" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header & Export Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Laporan & Statistik</h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Analisis performa bisnis dan pertumbuhan katering Anda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Tombol Export terhubung ke API Route */}
                <Button variant="outline" asChild className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 cursor-pointer">
                  <a href={`/api/export/pdf${queryString}`}>
                    <FileText className="mr-2 h-4 w-4 text-red-500" />
                    Export PDF
                  </a>
                </Button>
                <Button variant="outline" asChild className="bg-white dark:bg-slate-900 shadow-sm border-slate-200 cursor-pointer">
                  <a href={`/api/export/excel${queryString}`}>
                    <TableIcon className="mr-2 h-4 w-4 text-emerald-500" />
                    Export Excel
                  </a>
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 italic">
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Filter Rentang Waktu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-wrap items-end gap-4">
                  <div className="grid gap-2 flex-1 min-w-50">
                    <Label htmlFor="startDate" className="text-xs uppercase tracking-wider text-slate-500 font-bold">Tanggal Mulai</Label>
                    <Input 
                      type="date" 
                      id="startDate"
                      name="startDate" 
                      defaultValue={startDate}
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="grid gap-2 flex-1 min-w-50">
                    <Label htmlFor="endDate" className="text-xs uppercase tracking-wider text-slate-500 font-bold">Tanggal Akhir</Label>
                    <Input 
                      type="date" 
                      id="endDate"
                      name="endDate" 
                      defaultValue={endDate}
                      className="bg-slate-50/50"
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button type="submit" className="px-8 font-semibold">Terapkan Filter</Button>
                    <Button type="button" variant="ghost" asChild>
                      <a href="/laporan">Reset</a>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            {summary && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm overflow-hidden relative group">
                  <div className="absolute -right-2.5 -top-2.5 bg-blue-500/5 p-8 rounded-full group-hover:bg-blue-500/10 transition-colors" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-500">Total Pesanan</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">{summary.totalPesanan}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Transaksi berhasil</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                  <div className="absolute -right-2.5 -top-2.5 bg-emerald-500/5 p-8 rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-500">Pendapatan</CardTitle>
                    <Banknote className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(summary.totalRevenue)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Total omzet bruto</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                  <div className="absolute -right-2.5 -top-2.5 bg-purple-500/5 p-8 rounded-full group-hover:bg-purple-500/10 transition-colors" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-500">Rata-rata Order</CardTitle>
                    <Package className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">
                      {formatRupiah(summary.averageOrder)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Nilai per transaksi</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden relative group">
                  <div className="absolute -right-2.5 -top-2.5 bg-orange-500/5 p-8 rounded-full group-hover:bg-orange-500/10 transition-colors" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-500">Pelanggan</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">{summary.totalPelanggan}</div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">Mitra terdaftar</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2 border-none shadow-sm">
                <CardHeader className="border-b mb-4">
                  <CardTitle className="text-lg font-bold">Tren Pendapatan Bulanan</CardTitle>
                  <CardDescription>Visualisasi kenaikan omzet sepanjang tahun berjalan</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <div className="h-87.5 w-full">
                       <RevenueChart data={revenueData} />
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <TrendingUp className="h-8 w-8 mb-2 opacity-20" />
                      <p>Tidak ada data pendapatan untuk periode ini</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="border-b mb-4">
                  <CardTitle className="text-lg font-bold">Komposisi Status</CardTitle>
                  <CardDescription>Persentase status pesanan saat ini</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <div className="h-75 w-full">
                      <StatusPieChart data={statusData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>Data status belum tersedia</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="border-b mb-4">
                  <CardTitle className="text-lg font-bold">Top 5 Paket Terlaris</CardTitle>
                  <CardDescription>Menu yang paling banyak diminati pelanggan</CardDescription>
                </CardHeader>
                <CardContent>
                  {packagesData.length > 0 ? (
                    <div className="h-75 w-full">
                       <TopPackagesChart data={packagesData} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <p>Belum ada data penjualan paket</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Footer Navigation */}
            <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20">
              <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold">Butuh rincian data per transaksi?</h4>
                  <p className="text-sm text-muted-foreground">Gunakan filter di halaman Pesanan untuk analisis lebih mendalam.</p>
                </div>
                <Button variant="outline" asChild className="shrink-0 bg-white dark:bg-slate-900">
                  <a href="/pesanan">Buka Data Pesanan</a>
                </Button>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}