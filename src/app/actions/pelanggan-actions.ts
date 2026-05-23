// src/app/actions/pelanggan-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { fileToBuffer } from "@/lib/image-utils"; // ✅ Gunakan helper BLOB
import { pelangganSchema, type ActionResponse } from "@/lib/validations/pelanggan";

// ✅ CREATE - Hanya Admin/Owner (Diubah ke FormData agar mendukung upload foto BLOB)
export async function createPelanggan(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak. Hanya admin/owner." };
  }

  try {
    const rawData = {
      nama_pelanggan: formData.get("nama_pelanggan")?.toString() || "",
      no_telp: formData.get("no_telp")?.toString() || "",
      alamat1: formData.get("alamat1")?.toString() || "",
      alamat2: formData.get("alamat2")?.toString() || "",
      alamat3: formData.get("alamat3")?.toString() || "",
    };

    const validated = pelangganSchema.parse(rawData);
    
    // 📸 Proses File Foto ke Buffer (BLOB SQLite)
    const fotoFile = formData.get("foto") as File | null;
    let fotoBuffer: Buffer | undefined;
    if (fotoFile && fotoFile.size > 0) {
      fotoBuffer = await fileToBuffer(fotoFile);
    }
    
    await prisma.pelanggan.create({
      data: {
        namaPelanggan: validated.nama_pelanggan,
        alamat1: validated.alamat1,
        address2: validated.alamat2 || null,
        address3: validated.alamat3 || null,
        noTelp: validated.no_telp,
        // ✅ Hanya masukkan foto jika file diunggah oleh admin
        ...(fotoBuffer && { foto: fotoBuffer }), 
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

// ✅ UPDATE - Pelanggan (akun sendiri) | Admin/Owner (akun siapa saja)
export async function updatePelanggan(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) return { success: false, message: "Harus login terlebih dahulu." };

  const rawId = formData.get("id");
  const id = rawId ? Number(rawId) : null;

  if (id === null || isNaN(id)) {
    return { success: false, message: "ID Pelanggan tidak ditemukan atau tidak valid." };
  }

  const isOwner = session.user.level === "pelanggan" && Number(session.user.id) === id;
  const isAdmin = session.user.level === "admin" || session.user.level === "owner";

  if (!isOwner && !isAdmin) {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    const rawData = {
      nama_pelanggan: formData.get("nama_pelanggan")?.toString() || "",
      no_telp: formData.get("no_telp")?.toString() || "",
      alamat1: formData.get("alamat1")?.toString() || "",
      alamat2: formData.get("alamat2")?.toString() || "",
      alamat3: formData.get("alamat3")?.toString() || "",
    };

    const validated = pelangganSchema.parse(rawData);

    // 📸 Proses File Foto ke Buffer (BLOB SQLite)
    const fotoFile = formData.get("foto") as File | null;
    let fotoBuffer: Buffer | undefined;
    if (fotoFile && fotoFile.size > 0) {
      fotoBuffer = await fileToBuffer(fotoFile);
    }

    await prisma.pelanggan.update({
      where: { id: id },
      data: {
        namaPelanggan: validated.nama_pelanggan,
        noTelp: validated.no_telp,
        alamat1: validated.alamat1,
        address2: validated.alamat2 || null,
        address3: validated.alamat3 || null,
        // ✅ Hanya perbarui foto jika ada file baru yang dipilih
        ...(fotoBuffer && { foto: fotoBuffer }),
      },
    });

    revalidatePath(isOwner ? "/profil" : "/pelanggan");
    return { success: true, message: "Profil berhasil diperbarui!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update error:", error);
    return { success: false, message: "Terjadi kesalahan server." };
  }
}

// ✅ DELETE - Hanya Admin/Owner
export async function deletePelanggan(id: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak." };
  }

  try {
    const hasOrders = await prisma.pemesanan.count({ where: { idPelanggan: id } });
    if (hasOrders > 0) return { success: false, message: "Gagal: Pelanggan punya riwayat transaksi!" };

    await prisma.pelanggan.delete({ where: { id } });
    revalidatePath("/pelanggan");
    return { success: true, message: "Pelanggan berhasil dihapus!" };
  } catch (error) {
    console.error("Detail Error:", error);
    return { success: false, message: "Terjadi kesalahan pada server" };
  }
}

// ✅ GET ALL - Hanya Admin/Owner
export async function getPelanggans(search?: string) {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") return [];

  return prisma.pelanggan.findMany({
    where: search ? {
      OR: [
        { namaPelanggan: { contains: search } },
        { noTelp: { contains: search } },
        { alamat1: { contains: search } },
      ]
    } : {},
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET BY ID - Admin/Owner & Pengguna Terkait
export async function getPelangganById(id: number) {
  const session = await auth();
  if (!session?.user) return null;

  const isOwner = session.user.level === "pelanggan" && Number(session.user.id) === id;
  const isAdmin = session.user.level === "admin" || session.user.level === "owner";

  if (!isOwner && !isAdmin) return null;
  return prisma.pelanggan.findUnique({ where: { id } });
}