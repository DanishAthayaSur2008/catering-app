// src/app/actions/customer-pesanan-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { STATUS_PESANAN, STATUS_PEMBAYARAN } from "@/types/enums";

export async function cancelPesanan(idPemesanan: number): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  
  // Pastikan user sudah login dan dia adalah pelanggan
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    // ✅ FIX 1: Ubah session.user.id (string) menjadi Number agar sesuai tipe Int di Prisma
    const customerId = Number(session.user.id);

    // ✅ VALIDASI: Pesanan HARUS milik user yang login
    const pesanan = await prisma.pemesanan.findFirst({
      where: { 
        id: idPemesanan, 
        idPelanggan: customerId 
      }
    });

    if (!pesanan) return { success: false, message: "Pesanan tidak ditemukan" };
    
    // ✅ Hanya bisa batal jika masih menunggu konfirmasi
    if (pesanan.statusPesanan !== STATUS_PESANAN.MENUNGGU_KONFIRMASI) {
      return { success: false, message: "Pesanan sudah diproses, tidak dapat dibatalkan" };
    }

    // ✅ FIX 2: Bungkus field update di dalam objek 'data'
    // ✅ Jika sudah bayar, update status pesanan dan status pembayaran (Refund) sekaligus
    if (pesanan.statusPembayaran === STATUS_PEMBAYARAN.LUNAS) {
      await prisma.pemesanan.update({
        where: { id: idPemesanan },
        data: { 
          statusPesanan: STATUS_PESANAN.DIBATALKAN,
          statusPembayaran: STATUS_PEMBAYARAN.REFUND,
          // Pastikan kolom adminCatatan ada di schema, jika tidak hapus baris ini
          // adminCatatan: "Refund otomatis karena pembatalan oleh pelanggan"
        }
      });
    } else {
      // Jika belum bayar, cukup update status pesanannya saja
      await prisma.pemesanan.update({
        where: { id: idPemesanan },
        data: { statusPesanan: STATUS_PESANAN.DIBATALKAN }
      });
    }

    revalidatePath("/pesanan-saya");
    return { success: true, message: "Pesanan dibatalkan. Dana akan dikembalikan dalam 3-5 hari kerja jika sudah dibayar." };
  } catch (error) {
    console.error("❌ Cancel pesanan error:", error);
    return { success: false, message: "Gagal membatalkan pesanan" };
  }
}