// src/app/actions/pembayaran-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { STATUS_PEMBAYARAN } from "@/types/enums";

type CreatePembayaranData = {
  idPemesanan: number;
  metodePembayaran: string;
};

export async function createPembayaran(data: CreatePembayaranData): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    // ✅ FIX 1: Ubah session.user.id (string) menjadi Number (angka)
    const customerId = Number(session.user.id);

    // ✅ FIX 2: Gunakan findFirst karena mencari berdasarkan kombinasi id & idPelanggan
    const pesanan = await prisma.pemesanan.findFirst({
      where: { 
        id: data.idPemesanan, 
        idPelanggan: customerId 
      }
    });
    
    if (!pesanan) return { success: false, message: "Pesanan tidak ditemukan" };

    // ✅ Logika Update
    const isCOD = data.metodePembayaran === "COD";

    await prisma.pemesanan.update({
      where: { id: data.idPemesanan },
      data: {
        metodePembayaran: data.metodePembayaran,
        statusPembayaran: isCOD 
          ? STATUS_PEMBAYARAN.LUNAS 
          : STATUS_PEMBAYARAN.MENUNGGU_KONFIRMASI_BAYAR,
        tanggalBayar: isCOD ? new Date() : null,
        // ✅ Jika COD, status pesanan langsung berubah ke "Sedang_Diproses"
        statusPesanan: isCOD ? "Sedang_Diproses" : pesanan.statusPesanan
      },
    });

    revalidatePath("/pesanan-saya"); // Sesuaikan dengan route customer kamu
    return { success: true, message: isCOD ? "Pesanan diproses dengan metode COD!" : "Bukti pembayaran sedang diverifikasi!" };
  } catch (error) {
    console.error("❌ Create pembayaran error:", error);
    return { success: false, message: "Gagal memproses pembayaran" };
  }
}