// src/app/actions/kurir-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { STATUS_KIRIM } from "@/types/enums";

// 1. Definisikan tipe data untuk update agar tidak menggunakan 'any'
interface PengirimanUpdatePayload {
  statusKirim: string;
  aktualTiba?: Date;
}

export async function updateStatusKirim(
  idPengiriman: number, 
  newStatus: keyof typeof STATUS_KIRIM
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  
  if (session?.user?.level !== "kurir") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const kurirId = Number(session.user.id);
    
    const pengiriman = await prisma.pengiriman.findUnique({
      where: { 
        id: idPengiriman,
        kurirId: kurirId 
      }
    });
    
    if (!pengiriman) {
      return { success: false, message: "Pengiriman tidak ditemukan atau Anda bukan pengirimnya" };
    }

    // 2. Gunakan interface yang baru dibuat di sini (Perbaikan Error ESLint)
    const dataToUpdate: PengirimanUpdatePayload = {
      statusKirim: STATUS_KIRIM[newStatus],
    };
    
    if (newStatus === "TIBA_DITUJUAN") {
      dataToUpdate.aktualTiba = new Date();
    }

    await prisma.pengiriman.update({
      where: { id: idPengiriman },
      data: dataToUpdate
    });

    if (newStatus === "TIBA_DITUJUAN") {
      await prisma.pemesanan.update({
        where: { id: pengiriman.idPesan },
        data: { statusPesanan: "Selesai" }
      });
    }

    revalidatePath("/kurir");
    revalidatePath("/pengiriman");
    revalidatePath("/tracking"); // ✅ Sinkronisasi halaman tracking agar Step 3 langsung aktif!
    
    return { success: true, message: "Status pengiriman berhasil diupdate" };
    
  } catch (error) {
    console.error("Update status kirim error:", error);
    return { success: false, message: "Gagal update status" };
  }
}