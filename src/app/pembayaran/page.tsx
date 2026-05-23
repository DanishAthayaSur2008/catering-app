/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/pembayaran/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { PaymentForm } from "@/components/pembayaran/payment-form";
import { STATUS_PEMBAYARAN } from "@/types/enums";
import { CreditCard, ShieldCheck, ReceiptText } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default async function PembayaranPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await auth();
  
  // 1. Proteksi Halaman
  if (session?.user?.level !== "pelanggan") {
    redirect("/auth/login");
  }
  
  // 2. Validasi ID Pesanan
  const params = await searchParams;
  if (!params?.id) redirect("/pesan");

  const orderId = parseInt(params.id, 10);
  const idPelanggan = parseInt(session.user.id, 10);

  if (Number.isNaN(orderId) || Number.isNaN(idPelanggan)) {
    redirect("/pesan");
  }

  // 3. Ambil Data Pesanan Mentah dari Database
  const rawPesanan = await prisma.pemesanan.findUnique({
    where: { 
      id: orderId, 
      idPelanggan 
    },
    include: {
      detailPemesanans: { 
        include: { 
          paket: true // Di sini ada field 'foto' berjenis Uint8Array (Blob)
        } 
      },
      // Mengambil relasi jenis pembayaran jika skema Anda mengaitkannya ke tabel pemesanan
      jenisPembayaran: {
        include: {
          detailJenisPembayarans: true // Di sini ada field 'logoPembayaran' berjenis Uint8Array (Blob)
        }
      }
    }
  });

  if (!rawPesanan) notFound();

  // 4. Redirect jika sudah lunas
  if (rawPesanan.statusPembayaran === STATUS_PEMBAYARAN.LUNAS) {
    redirect("/pesanan-saya");
  }

  // 5. ✨ PROSES SANITASI DATA (Konversi Uint8Array ke Plain Base64 String)
  const pesanan = {
    ...rawPesanan,
    detailPemesanans: rawPesanan.detailPemesanans.map((dp) => ({
      ...dp,
      paket: dp.paket
        ? {
            ...dp.paket,
            // Periksa dan konversi Uint8Array foto paket jika ada
            foto: dp.paket.foto && dp.paket.foto instanceof Uint8Array
              ? `data:image/jpeg;base64,${Buffer.from(dp.paket.foto).toString("base64")}`
              : typeof dp.paket.foto === "string" 
                ? dp.paket.foto 
                : null,
          }
        : null,
    })),
    // Lakukan hal yang sama pada data jenis pembayaran jika ada di dalam relasi
    jenisPembayaran: rawPesanan.jenisPembayaran
      ? {
          ...rawPesanan.jenisPembayaran,
          detailJenisPembayarans: (rawPesanan.jenisPembayaran as any).detailJenisPembayarans?.map((djp: any) => ({
            ...djp,
            // Periksa dan konversi Uint8Array logo pembayaran jika ada
            logoPembayaran: djp.logoPembayaran && djp.logoPembayaran instanceof Uint8Array
              ? `data:image/png;base64,${Buffer.from(djp.logoPembayaran).toString("base64")}`
              : typeof djp.logoPembayaran === "string" 
                ? djp.logoPembayaran 
                : null,
          })) || [],
        }
      : null,
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <CustomerHeader />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* 🏆 Hero Section (Senada dengan /pesan) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Pembayaran Aman & Terverifikasi
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Selesaikan <span className="text-blue-600">Pembayaran</span>
            </h1>
            <p className="text-slate-500 max-w-lg font-medium">
              Satu langkah lagi! Segera selesaikan pembayaran untuk pesanan <span className="font-bold text-slate-700">#{pesanan.id}</span> agar kami bisa segera memprosesnya.
            </p>
          </div>

          {/* Quick Info Total */}
          <div className="hidden md:block">
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <ReceiptText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Total Tagihan</p>
                  <p className="text-xl font-black text-slate-900">{formatRupiah(pesanan.totalHarga)}</p>
                </div>
             </div>
          </div>
        </div>

        {/* 💳 Payment Form Container */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-1 md:p-2">
            {/* Sekarang objek pesanan aman dilempar ke komponen client karena tipenya murni JSON object */}
            <PaymentForm pesanan={pesanan as any} />
          </div>
        </div>

        {/* 🔒 Trust Badges (Konsisten) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
             </div>
             <p className="text-xs font-semibold text-slate-600">Metode Pembayaran Lengkap</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
             </div>
             <p className="text-xs font-semibold text-slate-600">Konfirmasi Otomatis oleh Admin</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <ReceiptText className="w-5 h-5" />
             </div>
             <p className="text-xs font-semibold text-slate-600">Invoice Terkirim ke Email</p>
          </div>
        </div>
      </main>
    </div>
  );
}