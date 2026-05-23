// src/app/actions/profile-actions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { pelangganSchema, type ActionResponse } from "@/lib/validations/pelanggan";
import { ZodError } from "zod";

export async function updateProfile(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak. Hanya untuk pelanggan." };
  }

  try {
    // ✅ FIX: HAPUS SEMUA SPASI DI KEY!
    const rawData = {
      nama_pelanggan: formData.get("nama_pelanggan")?.toString().trim() || "",
      no_telp: formData.get("no_telp")?.toString().trim() || "",
      alamat1: formData.get("alamat1")?.toString().trim() || "",
      alamat2: formData.get("alamat2")?.toString().trim() || "",
      alamat3: formData.get("alamat3")?.toString().trim() || "",
    };

    const validated = pelangganSchema.parse(rawData);

    const fotoFile = formData.get("foto") as File | null;
    let fotoBuffer: Buffer | null = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      fotoBuffer = Buffer.from(arrayBuffer);
    }

    const updateData: {
      namaPelanggan: string;
      alamat1: string;
      address2: string | null;
      address3: string | null;
      noTelp: string;
      foto?: Buffer;
    } = {
      namaPelanggan: validated.nama_pelanggan,
      alamat1: validated.alamat1,
      address2: validated.alamat2 || null,
      address3: validated.alamat3 || null,
      noTelp: validated.no_telp,
    };

    if (fotoBuffer) {
      updateData.foto = fotoBuffer;
    }

    // ✅ FIX: Hapus typo "prism a"
    await prisma.pelanggan.update({
      where: { id: Number(session.user.id) },
      data: updateData,
    });

    revalidatePath("/profil");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: error.flatten().fieldErrors as Record<string, string[]>,
      };
    }
    console.error("❌ Update profile error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

export async function getMyProfile() {
  const session = await auth();
  if (!session?.user || session.user.level !== "pelanggan") {
    return null;
  }
  return prisma.pelanggan.findUnique({
    where: { id: Number(session.user.id) },
  });
}

export async function deleteMyProfile(): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    const userId = Number(session.user.id);
    const hasOrders = await prisma.pemesanan.count({
      where: { idPelanggan: userId }
    });

    if (hasOrders > 0) {
      return { success: false, message: "Tidak bisa hapus: Anda memiliki riwayat pesanan!" };
    }

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