// src/components/dashboard/admin-dashboard.tsx
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, ShoppingCart, DollarSign, ArrowUpRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export async function AdminDashboard() {
  // 1. Ambil batasan tanggal untuk filter data bulan berjalan ini
  const sekarang = new Date();
  //  BENAR
  const awalBulanIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);

  // 2. Query Data Riil dari Database secara Paralel (Sesuai Skema Prisma Anda)
  const [
    totalPelanggan,
    pelangganBaruBulanIni,
    totalPaketAktif,
    pesananBulanIni,
    totalPendapatan
  ] = await Promise.all([
    // Menghitung total seluruh entri di tabel pelanggan
    prisma.pelanggan.count(),

    // Menghitung pelanggan baru berdasarkan field created_at
    prisma.pelanggan.count({
      where: { createdAt: { gte: awalBulanIni } }
    }),

    // Menghitung paket dengan statusPaket === "aktif" sesuai isi skema Anda
    prisma.paket.count({
      where: { statusPaket: "aktif" }
    }),

    // Menghitung jumlah transaksi pemesanan pada bulan berjalan ini
    prisma.pemesanan.count({
      where: { createdAt: { gte: awalBulanIni } }
    }),

    // Agregasi total_harga untuk pesanan yang tidak dibatalkan
    prisma.pemesanan.aggregate({
      _sum: { totalHarga: true },
      where: {
        statusPesanan: { not: "Dibatalkan" }
      }
    })
  ]);

  const akumulasiPendapatan = totalPendapatan._sum.totalHarga || 0;

  return (
    // Spacing utama menggunakan space-y-7 agar jarak vertikal antar-section lebih lega
    <div className="space-y-7">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard Admin
        </h2>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Kelola operasional katering & pantau performa bisnis secara real-time.
        </p>
      </div>

      {/* Grid Statistik Utama 
        Menggunakan gap-5 (20px) agar jarak antar kotak info terlihat renggang, rapi, dan seimbang
      */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {/* CARD 1: TOTAL PELANGGAN */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Total Pelanggan
            </CardTitle>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl transition-colors">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          {/* py-5 dan px-5 (atau p-5) memastikan teks di dalam card memiliki padding yang simetris */}
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {totalPelanggan}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-2 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{pelangganBaruBulanIni} member baru bulan ini
            </p>
          </CardContent>
        </Card>

        {/* CARD 2: PAKET MENU AKTIF */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Paket Menu Aktif
            </CardTitle>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl transition-colors">
              <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {totalPaketAktif}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Kategori menu siap dipesan
            </p>
          </CardContent>
        </Card>

        {/* CARD 3: PESANAN BULAN INI */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Pesanan Bulan Ini
            </CardTitle>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl transition-colors">
              <ShoppingCart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {pesananBulanIni}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Transaksi bulan berjalan
            </p>
          </CardContent>
        </Card>

        {/* CARD 4: TOTAL PENDAPATAN */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
              Total Pendapatan
            </CardTitle>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl transition-colors">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-1">
            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              {formatRupiah(akumulasiPendapatan)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
              Akumulasi luar pesanan batal
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}