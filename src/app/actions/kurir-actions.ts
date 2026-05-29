"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface PengirimanUpdatePayload {
  statusKirim: string;
  aktualTiba?: Date;
}

// 1. Fungsi Update Status Kirim
export async function updateStatusKirim(
  idPengiriman: number, 
  newStatus: "Belum_Dikirim" | "Sedang_Dikirim" | "Tiba_Ditujuan"
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  
  if (session?.user?.level !== "kurir") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const kurirId = Number(session.user.id);
    
    // Validasi angka keamanan
    if (!idPengiriman || isNaN(idPengiriman) || isNaN(kurirId)) {
      return { success: false, message: "Data parameter tidak valid" };
    }
    
    // FIX: Menggunakan findFirst karena memfilter kolom non-unique (kurirId)
    const pengiriman = await prisma.pengiriman.findFirst({
      where: { 
        id: idPengiriman,
        kurirId: kurirId 
      }
    });
    
    if (!pengiriman) {
      return { success: false, message: "Pengiriman tidak ditemukan atau Anda bukan pengirimnya" };
    }

    const dataToUpdate: PengirimanUpdatePayload = {
      statusKirim: newStatus,
    };
    
    if (newStatus === "Tiba_Ditujuan") {
      dataToUpdate.aktualTiba = new Date();
    }

    await prisma.pengiriman.update({
      where: { id: idPengiriman },
      data: dataToUpdate
    });

    if (newStatus === "Tiba_Ditujuan") {
      await prisma.pemesanan.update({
        where: { id: pengiriman.idPesan },
        data: { statusPesanan: "Selesai" }
      });
    }

    // FIX: Revalidasi kedua halaman agar Admin & Kurir sama-sama sinkron
    revalidatePath("/kurir");
    revalidatePath("/pengiriman");
    
    return { success: true, message: "Status pengiriman berhasil diperbarui" };
    
  } catch (error) {
    console.error("Update status kirim error:", error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}

// 2. Fungsi Upload Bukti Foto
export async function uploadBuktiFoto(formData: FormData): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  
  if (!session?.user || session.user.level !== "kurir") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const idPengiriman = Number(formData.get("idPengiriman"));
    const file = formData.get("buktiFoto");

    if (!idPengiriman || isNaN(idPengiriman)) {
      return { success: false, message: "ID Pengiriman tidak valid" };
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, message: "Berkas foto tidak valid atau kosong" };
    }

    const kurirId = Number(session.user.id);
    if (isNaN(kurirId)) {
      return { success: false, message: "ID Kurir tidak valid" };
    }

    const pengiriman = await prisma.pengiriman.findFirst({
      where: { 
        id: idPengiriman, 
        kurirId: kurirId 
      }
    });

    if (!pengiriman) {
      return { success: false, message: "Data pengiriman tidak ditemukan atau Anda tidak memiliki akses" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const bufferData = Buffer.from(arrayBuffer);

    await prisma.pengiriman.update({
      where: { id: idPengiriman },
      data: { 
        buktiFoto: bufferData 
      }
    });

    // FIX: Revalidasi kedua halaman agar Admin & Kurir sama-sama sinkron
    revalidatePath("/kurir");
    revalidatePath("/pengiriman");
    
    return { success: true, message: "Bukti foto berhasil disimpan ke database!" };

  } catch (error) {
    console.error("Gagal memproses upload foto:", error);
    return { success: false, message: "Terjadi kesalahan internal saat mengunggah gambar" };
  }
}