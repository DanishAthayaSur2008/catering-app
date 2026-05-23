// src/app/pesanan-saya/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { cancelPesanan } from "@/app/actions/customer-pesanan-actions";
import { CopyButton } from "@/components/pesanan/copy-button"; // ✅ FIX: Import Komponen Client Terpisah
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatDate, getStatusPesananColor, getStatusPembayaranColor, cn } from "@/lib/utils";
import { Trash2, Truck, ShoppingBag, Plus, Calendar, Clock, Package, MapPin, ChevronRight } from "lucide-react";
import { STATUS_PESANAN } from "@/types/enums";
import Link from "next/link";

export default async function PesananSayaPage() {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") redirect("/auth/login");

  const pesanan = await prisma.pemesanan.findMany({
    where: { idPelanggan: Number(session.user.id) },
    include: {
      detailPemesanans: {
        include: { paket: true }
      },
      pengiriman: true, 
      pelanggan: true,  
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      <CustomerHeader />

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* 📋 Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Riwayat <span className="text-orange-500">Pesanan</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Pantau status pengiriman dan kelola daftar pesanan katering Anda.
            </p>
          </div>
          <Button asChild className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-orange-200">
            <Link href="/pesan">
              <Plus className="mr-2 h-5 w-5" /> Pesan Baru
            </Link>
          </Button>
        </div>

        {pesanan.length === 0 ? (
          /* Empty State */
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-slate-50 p-8 rounded-full mb-6">
                <ShoppingBag className="h-16 w-16 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Belum Ada Pesanan</h3>
              <p className="text-slate-500 max-w-xs mb-8 font-medium">
                Dapur kami siap melayani kebutuhan acara Anda. Yuk, mulai buat pesanan pertama!
              </p>
              <Button asChild variant="outline" className="rounded-xl border-2 font-bold px-8">
                <Link href="/pesan">Lihat Menu</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pesanan.map((p) => (
              <Card
                key={p.id}
                className="border-none shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 rounded-[2rem] bg-white overflow-hidden group"
              >
                <CardContent className="p-0">
                  {/* Bagian Atas: Header Pesanan */}
                  <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black text-sm">
                        #{p.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-sm font-black text-slate-800">
                            {formatDate(p.tanggalAcara)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">
                            Dipesan: {formatDate(p.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn("rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider border-none shadow-sm", getStatusPesananColor(p.statusPesanan))}>
                        {p.statusPesanan.replace(/_/g, " ")}
                      </Badge>
                      {p.statusPembayaran && (
                        <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-bold text-[10px] uppercase tracking-wider border-2", getStatusPembayaranColor(p.statusPembayaran))}>
                          {p.statusPembayaran.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bagian Tengah: Detail Item */}
                  <div className="p-6 bg-slate-50/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <Package className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Detail Menu</span>
                      </div>

                      {p.detailPemesanans.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <span className="text-sm font-bold text-slate-700">{item.paket.namaPaket}</span>
                          <span className="text-xs font-black text-slate-400">
                            {item.jumlah} Porsi <span className="mx-2 text-slate-200">•</span> {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Informasi Pengiriman */}
                  {p.pengiriman && (
                    <div className="px-6 pb-6 bg-slate-50/30">
                      <Card className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Truck className="h-4 w-4 text-orange-500" />
                            Informasi Pengiriman
                          </h4>

                          {/* No. Resi */}
                          {p.pengiriman.noResi && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Resi</p>
                                <p className="font-mono font-bold text-slate-800 text-sm">{p.pengiriman.noResi}</p>
                              </div>
                              
                              {/* ✅ FIXED: Menggunakan komponen Client Side khusus salin resi */}
                              <CopyButton text={p.pengiriman.noResi || ""} />
                            </div>
                          )}

                          {/* Alamat Tujuan */}
                          <div className="flex items-start gap-2 text-sm border-t border-slate-50 pt-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Alamat Pengiriman</p>
                              <p className="font-semibold text-slate-700 text-xs">
                                {p.pengiriman.alamatTujuan || p.pelanggan?.alamat1 || "Alamat tidak tersedia"}
                              </p>
                            </div>
                          </div>

                          {/* Estimasi Tiba */}
                          {p.pengiriman.estimasiTiba && (
                            <div className="flex items-start gap-2 text-sm border-t border-slate-50 pt-2">
                              <Calendar className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimasi Tiba</p>
                                <p className="font-semibold text-slate-700 text-xs">
                                  {new Date(p.pengiriman.estimasiTiba).toLocaleDateString("id-ID", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                  })}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Status Pengiriman */}
                          <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Kirim:</span>
                            <Badge className={cn("rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase border-none", getStatusPesananColor(p.pengiriman.statusKirim))}>
                              {p.pengiriman.statusKirim.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Bagian Bawah: Total & Actions */}
                  <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                      <p className="text-2xl font-black text-orange-600 tracking-tighter">
                        {formatRupiah(p.totalHarga)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {p.statusPesanan === STATUS_PESANAN.MENUNGGU_KONFIRMASI && (
                        <form action={async () => {
                          "use server";
                          await cancelPesanan(p.id);
                        }} className="flex-1 sm:flex-initial">
                          <Button
                            type="submit"
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold gap-2 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Batalkan
                          </Button>
                        </form>
                      )}

                      <Button asChild className="flex-1 sm:flex-initial rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 h-11 px-6 shadow-lg shadow-slate-200">
                        <Link href={`/tracking?id=${p.id}`}>
                          <Truck className="h-4 w-4" /> Lacak Pesanan <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
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