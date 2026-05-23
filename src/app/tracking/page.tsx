// src/app/tracking/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, CheckCircle2, MapPin, Package, Hash, Calendar, ChevronRight } from "lucide-react";
import { formatDate, formatRupiah, cn, getStatusPesananColor } from "@/lib/utils";
import { STATUS_PESANAN } from "@/types/enums";
import Link from "next/link";

// ✅ FIX: Di Next.js 15, searchParams adalah Promise
export default async function TrackingPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");

  const customerId = Number(session.user.id);
  const params = await searchParams; // ✅ FIX: Await params

  // --- VIEW 1: DETAIL TRACKING (Jika ada ID) ---
  if (params?.id) {
    const pesanan = await prisma.pemesanan.findFirst({
      where: {
        id: parseInt(params.id),
        idPelanggan: customerId
      },
      include: {
        pengiriman: true,
        detailPemesanans: { include: { paket: true } }
      }
    });

    if (!pesanan) notFound();

    return (
      <div className="min-h-screen bg-slate-50/50">
        <CustomerHeader />
        <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

          {/* 🛰️ Hero Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                <Truck className="w-3 h-3" /> Live Tracking
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Status <span className="text-indigo-600">Pengiriman</span>
              </h1>
              <p className="text-slate-500 font-medium">Pesanan Anda sedang dalam penanganan tim kami.</p>
            </div>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Hash className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID Pesanan</p>
                <p className="text-lg font-black text-slate-900">#{pesanan.id}</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* 📍 Progress Timeline (Kiri) */}
            <div className="lg:col-span-7">
              <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden">
                <CardContent className="p-8">
                  <div className="relative space-y-12">
                    <div className="absolute left-4.75 top-2 bottom-2 w-0.5 bg-slate-100" />

                    {/* Step 1: Pesanan Dibuat */}
                    <div className="relative flex gap-6 items-start">
                      <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm bg-indigo-600 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-black text-slate-900">Pesanan Diterima</h3>
                        <p className="text-sm text-slate-500 font-medium">{formatDate(pesanan.createdAt)}</p>
                      </div>
                    </div>

                    {/* Step 2: Proses/Masak */}
                    <div className="relative flex gap-6 items-start">
                      <div className={cn(
                        "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm",
                        pesanan.statusPesanan !== "MENUNGGU_KONFIRMASI" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-300"
                      )}>
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h3 className={cn("font-black", pesanan.statusPesanan !== "MENUNGGU_KONFIRMASI" ? "text-slate-900" : "text-slate-300")}>Sedang Disiapkan</h3>
                        <p className="text-sm text-slate-500 font-medium">Tim dapur sedang menyiapkan hidangan Anda.</p>
                      </div>
                    </div>

                    {/* Step 3: Pengiriman */}
                    <div className="relative flex gap-6 items-start">
                      <div className={cn(
                        "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm",
                        // ✅ DISUAIKAN: Menggunakan "Sedang_Dikirim" atau "Tiba_Ditujuan" agar sinkron dengan dashboard kurir
                        pesanan.pengiriman?.statusKirim === "Sedang_Dikirim" || pesanan.pengiriman?.statusKirim === "Tiba_Ditujuan"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-300"
                      )}>
                        <Truck className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        {/* ✅ DISUAIKAN: Teks judul menjadi gelap/aktif jika kurir sedang jalan ATAU sudah tiba */}
                        <h3 className={cn(
                          "font-black",
                          pesanan.pengiriman?.statusKirim === "Sedang_Dikirim" || pesanan.pengiriman?.statusKirim === "Tiba_Ditujuan"
                            ? "text-slate-900"
                            : "text-slate-300"
                        )}>
                          Dalam Perjalanan
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">Pesanan Anda sedang dalam perjalanan.</p>
                        {/* Tampilkan estimasi jika status sudah bukan Belum_Dikirim lagi */}
                        {pesanan.pengiriman?.statusKirim !== "Belum_Dikirim" && pesanan.pengiriman?.estimasiTiba && (
                          <p className="text-sm text-indigo-600 font-bold">
                            Estimasi: {formatDate(pesanan.pengiriman.estimasiTiba)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Step 4: Selesai */}
                    <div className="relative flex gap-6 items-start">
                      <div className={cn(
                        "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm",
                        // ✅ DISERAGAMKAN: Menyala hijau jika pesanan sudah Selesai ATAU kurir mengonfirmasi Tiba_Ditujuan
                        pesanan.statusPesanan === "Selesai" || pesanan.pengiriman?.statusKirim === "Tiba_Ditujuan"
                          ? "bg-green-500 text-white"
                          : "bg-slate-100 text-slate-300"
                      )}>
                        <MapPin className="h-5 w-5" />
                      </div>

                      <div className="space-y-1">
                        {/* ✅ DISERAGAMKAN: Judul teks menjadi gelap/aktif sesuai dengan indikator lingkaran */}
                        <h3 className={cn(
                          "font-black",
                          pesanan.statusPesanan === "Selesai" || pesanan.pengiriman?.statusKirim === "Tiba_Ditujuan"
                            ? "text-slate-900"
                            : "text-slate-300"
                        )}>
                          Sampai di Tujuan
                        </h3>

                        <p className="text-sm text-slate-500 font-medium">Pesanan telah sampai di lokasi Anda.</p>

                        {/* Menampilkan tanggal aktual kedatangan jika data dari kurir sudah masuk */}
                        {pesanan.pengiriman?.aktualTiba && (
                          <p className="text-sm text-green-600 font-bold">
                            Diterima pada: {formatDate(pesanan.pengiriman.aktualTiba)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 🧾 Ringkasan (Kanan) */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[2rem] bg-white overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <h3 className="font-black text-slate-800">Detail Paket</h3>
                    <Badge className={cn("rounded-lg border-none font-bold text-[10px] uppercase", getStatusPesananColor(pesanan.statusPesanan))}>
                      {pesanan.statusPesanan.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {pesanan.detailPemesanans.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-xl">
                        <span className="font-bold text-slate-700">{item.paket.namaPaket}</span>
                        <span className="font-black text-slate-400">{item.jumlah} Porsi</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-dashed flex justify-between items-end">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
                    <p className="text-xl font-black text-indigo-600">{formatRupiah(pesanan.totalHarga)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- VIEW 2: LIST PENGIRIMAN AKTIF (Jika tidak ada ID) ---
  const pesananAktif = await prisma.pemesanan.findMany({
    where: {
      idPelanggan: customerId,
      statusPesanan: { notIn: [STATUS_PESANAN.DIBATALKAN, STATUS_PESANAN.SELESAI] }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <CustomerHeader />
      <main className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lacak <span className="text-indigo-600">Pengiriman</span></h1>
          <p className="text-slate-500 font-medium">Daftar pesanan Anda yang sedang dalam proses.</p>
        </div>

        {pesananAktif.length === 0 ? (
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] py-20 text-center">
            <CardContent>
              <div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-800">Tidak Ada Pengiriman Aktif</h3>
              <p className="text-slate-400 mb-8">Semua pesanan Anda telah selesai atau dibatalkan.</p>
              <Button asChild className="rounded-xl font-bold bg-indigo-600">
                <Link href="/pesanan-saya">Lihat Riwayat</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pesananAktif.map((p) => (
              <Card key={p.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-3xl bg-white overflow-hidden group">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Package className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Pesanan #{p.id}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                        <Calendar className="h-3 w-3" /> {formatDate(p.tanggalAcara)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="hidden sm:inline-flex rounded-lg font-bold text-[10px] uppercase">
                      {p.statusPesanan.replace(/_/g, " ")}
                    </Badge>
                    <Button asChild className="rounded-xl h-12 px-6 font-bold bg-slate-900 hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all">
                      <Link href={`/tracking?id=${p.id}`}>Lacak <ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}