// src/app/actions/profile-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { pelangganSchema, type PelangganFormData, type ActionResponse } from "@/lib/validations/pelanggan";

// ✅ UPDATE PROFIL SENDIRI - Khusus role 'pelanggan'
export async function updateProfile(formData: PelangganFormData): Promise<ActionResponse> {
  const session = await auth();
  
  // ✅ Validasi: Hanya pelanggan yang bisa akses
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak. Hanya untuk pelanggan." };
  }

  try {
    // ✅ Parse formData
    const validated = pelangganSchema.parse(formData);
    
    // ✅ UPDATE HANYA profil milik user yang login (ownership strict)
    await prisma.pelanggan.update({
      where: { 
        id: Number(session.user.id) // 🔒 Memastikan ID adalah number (sesuai SQLite)
      },
      data: {  // ✅ SEBELUMNYA HILANG: Kata kunci 'data' wajib ada
        namaPelanggan: validated.nama_pelanggan,
        alamat1: validated.alamat1,
        address2: validated.alamat2,  // ✅ Match Prisma schema
        address3: validated.alamat3,  // ✅ Match Prisma schema
        noTelp: validated.no_telp,
        foto: validated.foto || null,
      },
    });

    // ✅ Revalidate path profil pelanggan
    revalidatePath("/profil");
    return { success: true, message: "Profil berhasil diperbarui!" };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Zod validation error:", error.flatten());
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("❌ Update profile error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ GET PROFIL SENDIRI - Helper untuk halaman /profil
export async function getMyProfile() {
  const session = await auth();
  
  // ✅ Hanya pelanggan yang bisa ambil data sendiri
  if (!session?.user || session.user.level !== "pelanggan") {
    return null;
  }

  return prisma.pelanggan.findUnique({
    where: { 
      id: Number(session.user.id) // 🔒 Konversi ke number
    },
  });
}

// ✅ DELETE AKUN SENDIRI (Optional)
export async function deleteMyProfile(): Promise<ActionResponse> {
  const session = await auth();
  
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    const userId = Number(session.user.id);

    // ✅ Cek apakah pelanggan memiliki riwayat pesanan
    const hasOrders = await prisma.pemesanan.count({
      where: { idPelanggan: userId }
    });
    
    if (hasOrders > 0) {
      return { success: false, message: "Tidak bisa hapus: Anda memiliki riwayat pesanan!" };
    }

    // ✅ Hapus hanya akun milik sendiri
    await prisma.pelanggan.delete({
      where: { id: userId }
    });

    revalidatePath("/profil");
    return { success: true, message: "Akun berhasil dihapus!" };
    
  } catch (error) {
    console.error("❌ Delete profile error:", error);
    return { success: false, message: "Gagal menghapus akun" };
  }
}