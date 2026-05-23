// src/app/pesan/page.tsx
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CustomerHeader } from "@/components/layout/customer-header";
import { OrderForm } from "@/components/pesan/order-form";
import { STATUS_PAKET } from "@/types/enums";
import { ShoppingBag, UtensilsCrossed } from "lucide-react";

function bufferToBase64(buffer: Buffer | Uint8Array | string | null, mimeType = "image/jpeg"): string | null {
  if (!buffer) return null;
  
  // Kalau sudah string (URL atau Base64), return langsung
  if (typeof buffer === "string") return buffer;
  
  // Kalau Buffer atau Uint8Array, convert ke Base64
  try {
    const base64 = Buffer.isBuffer(buffer) 
      ? buffer.toString("base64")
      : Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function PesanPage() {
  const session = await auth();
  
  // 1. Proteksi Halaman
  if (session?.user?.level !== "pelanggan") {
    redirect("/auth/login");
  }

  // 2. Fetching Data Paket
  // 2. Fetching Data Paket
  const packagesFromDb = await prisma.paket.findMany({
    where: {
      statusPaket: STATUS_PAKET.AKTIF, 
    },
    orderBy: { namaPaket: "asc" },
    select: {
      id: true,
      namaPaket: true,
      menuPaket: true,
      kategori: true,
      hargaPaket: true,
      foto: true, // Ini tipe Bytes (Buffer) dari database
      createdAt: true,
      updatedAt: true,
    },
  });

  // ✅ 3. Convert semua foto Buffer ke Base64 string
  const packages = packagesFromDb.map((p) => ({
    id: p.id,
    namaPaket: p.namaPaket,
    menuPaket: p.menuPaket,
    kategori: p.kategori,
    hargaPaket: p.hargaPaket,
    foto: bufferToBase64(p.foto as Buffer | Uint8Array | string | null), // Convert Buffer → Base64
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    harga: p.hargaPaket, // Map hargaPaket ke property 'harga' untuk OrderForm
  }));

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header Navigasi */}
      <CustomerHeader />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero / Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider">
              <UtensilsCrossed className="w-3 h-3" />
              Menu Katering Fresh
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Pesan Menu <span className="text-primary">Favoritmu</span>
            </h1>
            <p className="text-slate-500 max-w-lg font-medium">
              Pilih paket langganan atau harian dengan rasa autentik yang siap diantar langsung ke lokasimu.
            </p>
          </div>

          <div className="hidden md:block">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Status Pesanan</p>
                  <p className="text-sm font-bold text-slate-700">Pilih menu & bayar</p>
                </div>
             </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {packages.length > 0 ? (
            <div className="p-1 md:p-2">
              <OrderForm packages={packages} />
            </div>
          ) : (
            <div className="py-24 text-center">
              <div className="inline-flex p-6 rounded-full bg-slate-50 text-slate-300 mb-4">
                <UtensilsCrossed className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Belum ada paket tersedia</h3>
              <p className="text-slate-500">Mohon maaf, saat ini dapur kami sedang menyiapkan menu baru.</p>
            </div>
          )}
        </div>

        {/* Footer Info (Opsional) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <span className="font-bold">✓</span>
             </div>
             <p className="text-xs font-semibold text-slate-600 underline decoration-green-200 underline-offset-4">Bahan Baku Berkualitas</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold">✓</span>
             </div>
             <p className="text-xs font-semibold text-slate-600 underline decoration-blue-200 underline-offset-4">Pengiriman Tepat Waktu</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/50 border border-slate-100 flex items-center gap-3">
             <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
                <span className="font-bold">✓</span>
             </div>
             <p className="text-xs font-semibold text-slate-600 underline decoration-orange-200 underline-offset-4">Tanpa Bahan Pengawet</p>
          </div>
        </div>
      </main>
    </div>
  );
}