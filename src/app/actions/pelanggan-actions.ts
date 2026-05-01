// src/app/actions/pelanggan-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // ✅ IMPORT SESSION
import { pelangganSchema, type PelangganFormData, type ActionResponse } from "@/lib/validations/pelanggan";

// ✅ CREATE - Hanya Admin/Owner
export async function createPelanggan(formData: PelangganFormData): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak. Hanya admin/owner." };
  }

  try {
    // Memperbaiki: data -> formData (sesuai parameter fungsi)
    const validated = pelangganSchema.parse(formData);
    
    await prisma.pelanggan.create({
      data: { // ✅ Tambahkan properti 'data' yang tadi hilang
        namaPelanggan: validated.nama_pelanggan,
        alamat1: validated.alamat1,
        address2: validated.alamat2,
        address3: validated.alamat3,
        noTelp: validated.no_telp,
        foto: validated.foto,
      },
    });

    revalidatePath("/pelanggan");
    return { success: true, message: "Pelanggan berhasil ditambahkan!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Create pelanggan error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPDATE - Pelanggan (hanya akun sendiri) | Admin/Owner (akun siapa saja)
export async function updatePelanggan(id: number, formData: PelangganFormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Harus login terlebih dahulu." };

  // Note: Pastikan session.user.id dikonversi ke number jika id di DB adalah number
  const isOwner = session.user.level === "pelanggan" && Number(session.user.id) === id;
  const isAdmin = session.user.level === "admin" || session.user.level === "owner";

  if (!isOwner && !isAdmin) {
    return { success: false, message: "Akses ditolak. Anda hanya bisa mengedit profil sendiri." };
  }

  try {
    // Memperbaiki: data -> formData
    const validated = pelangganSchema.parse(formData);
    
    await prisma.pelanggan.update({
      where: { id },
      data: { // ✅ Tambahkan properti 'data' yang tadi hilang
        namaPelanggan: validated.nama_pelanggan,
        alamat1: validated.alamat1,
        address2: validated.alamat2,
        address3: validated.alamat3,
        noTelp: validated.no_telp,
        foto: validated.foto,
      },
    });

    revalidatePath(isOwner ? "/profil" : "/pelanggan");
    return { success: true, message: "Data pelanggan berhasil diperbarui!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update pelanggan error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ DELETE - Hanya Admin/Owner
export async function deletePelanggan(id: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    // Validasi apakah pelanggan punya relasi ke tabel pemesanan
    const hasOrders = await prisma.pemesanan.count({
      where: { idPelanggan: id }
    });
    
    if (hasOrders > 0) {
      return { success: false, message: "Tidak bisa hapus: Pelanggan memiliki riwayat pesanan!" };
    }

    await prisma.pelanggan.delete({
      where: { id },
    });

    revalidatePath("/pelanggan");
    return { success: true, message: "Pelanggan berhasil dihapus!" };
  } catch (error) {
    console.error("Delete pelanggan error:", error);
    return { success: false, message: "Gagal menghapus pelanggan" };
  }
}

// ✅ GET ALL - Hanya Admin/Owner
export async function getPelanggans(search?: string) {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") return [];

  const where = search ? {
    OR: [
      { namaPelanggan: { contains: search } },
      { noTelp: { contains: search } },
      { alamat1: { contains: search } },
    ]
  } : {};

  return prisma.pelanggan.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET BY ID - Dengan validasi ownership
export async function getPelangganById(id: number) {
  const session = await auth();
  if (!session?.user) return null;

  const isOwner = session.user.level === "pelanggan" && Number(session.user.id) === id;
  const isAdmin = session.user.level === "admin" || session.user.level === "owner";

  if (!isOwner && !isAdmin) return null;

  return prisma.pelanggan.findUnique({
    where: { id },
  });
}