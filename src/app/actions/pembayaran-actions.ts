// src/app/actions/pembayaran-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type CreatePembayaranData = {
  idPemesanan: number;
  idJenisPembayaran: number;
  idDetailJenisPembayaran?: number;
  metodePembayaran: string;
  buktiFoto?: string; // Base64 string dari client
};

export async function createPembayaran(
  data: CreatePembayaranData
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const customerId = Number(session.user.id);
    
    // ✅ PERBAIKAN 1: Hapus 'include: { pembayaran: true }' karena field pembayaran ada di dalam model Pemesanan
    const pesanan = await prisma.pemesanan.findFirst({
      where: { id: data.idPemesanan, idPelanggan: customerId },
    });

    if (!pesanan) return { success: false, message: "Pesanan tidak ditemukan" };
    
    // ✅ PERBAIKAN 2: Validasi status berdasarkan field langsung di model Pemesanan
    if (pesanan.statusPembayaran !== "Menunggu_Pembayaran") {
      return { success: false, message: "Pembayaran sudah diproses atau selesai untuk pesanan ini" };
    }

    // ✅ Validasi payment method dari DB
    const paymentMethod = await prisma.jenisPembayaran.findUnique({
      where: { id: data.idJenisPembayaran },
      include: { detailJenisPembayarans: false } // Sesuai skema, sesuaikan jika tidak butuh include
    });

    if (!paymentMethod) return { success: false, message: "Metode pembayaran tidak valid" };

    // ✅ Handle bukti foto (base64 string dari client)
    let buktiBayar: string | null = null;
    if (data.buktiFoto && data.buktiFoto.startsWith("data:image")) {
      buktiBayar = data.buktiFoto; // Sudah base64 data URL
    }

    // ✅ Tentukan status pembayaran berdasarkan metode (Menggunakan string literal sesuai skema SQLite Anda)
    const isCOD = paymentMethod.namaPembayaran.toUpperCase().includes("COD");
    const statusPembayaran = isCOD 
      ? "Lunas" 
      : "Menunggu_Konfirmasi_Bayar";

    // ✅ PERBAIKAN 3: Gunakan 'prisma.pemesanan.update', bukan 'prisma.pembayaran.create'
    // Karena semua field pembayaran tertanam langsung di model Pemesanan
    await prisma.pemesanan.update({
      where: { id: data.idPemesanan },
      data: {
        idJenisPembayaran: data.idJenisPembayaran,
        metodePembayaran: paymentMethod.namaPembayaran,
        statusPembayaran: statusPembayaran,
        buktiBayar: buktiBayar, // Simpan langsung base64 string
        tanggalBayar: isCOD ? new Date() : null,
        // Jika COD, sekalian update status pesanannya di sini agar lebih efisien
        ...(isCOD ? { statusPesanan: "Sedang_Diproses" } : {})
      },
    });

    revalidatePath("/pesanan-saya");
    return { 
      success: true, 
      message: isCOD 
        ? "Pesanan diproses dengan metode COD!" 
        : "Bukti pembayaran sedang diverifikasi admin!" 
    };
  } catch (error) {
    console.error("❌ Create pembayaran error:", error);
    return { success: false, message: "Gagal memproses pembayaran" };
  }
}

// ✅ GET PAYMENT METHODS (Untuk dropdown di form)
export async function getPaymentMethods() {
  return prisma.jenisPembayaran.findMany({
    include: {
      detailJenisPembayarans: {
        select: {
          id: true,
          tempatPembayaran: true,
          noRekening: true,
          logoPembayaran: true,
        }
      }
    },
    orderBy: { namaPembayaran: "asc" }
  });
}

// Tambah function ini di file yang sama:

// ✅ GET PAYMENT METHODS UNTUK CUSTOMER FORM
export async function getPaymentMethodsForCustomer() {
  return prisma.jenisPembayaran.findMany({
    include: {
      detailJenisPembayarans: {
        select: {
          id: true,
          tempatPembayaran: true,
          noRekening: true,
          logoPembayaran: true,
        }
      }
    },
    orderBy: { namaPembayaran: "asc" }
  });
}