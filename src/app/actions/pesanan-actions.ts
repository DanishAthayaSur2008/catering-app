// src/app/actions/pesanan-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { pesananSchema, type PesananFormData, type ActionResponse, type DetailPesananFormData } from "@/lib/validations/pesanan";
import { z } from "zod";

// ✅ CREATE PESANAN - Parameter HARUS ada nama: 'data: PesananFormData'
export async function createPesanan(data: PesananFormData): Promise<ActionResponse> {
  try {
    const validated = pesananSchema.parse(data);
    const totalHarga = validated.detailPemesanans.reduce((sum, item) => sum + item.subtotal, 0);
    
    const result = await prisma.pemesanan.create({
      data: {  // ✅ WAJIB: 'data:' key untuk Prisma create
        idPelanggan: validated.idPelanggan,
        tanggalAcara: new Date(validated.tanggalAcara),
        totalHarga,
        statusPesanan: validated.statusPesanan || "Menunggu_Konfirmasi",
        statusPembayaran: validated.statusPembayaran || "Menunggu_Pembayaran", // Menyimpan status pembayaran baru
        detailPemesanans: {
          create: validated.detailPemesanans.map((item: DetailPesananFormData) => ({
            idPaket: item.idPaket,
            jumlah: item.jumlah,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { detailPemesanans: { include: { paket: true } } },
    });
    
    revalidatePath("/pesanan");
    return { success: true, message: "Pesanan berhasil dibuat!", id: result.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // ✅ FIX: Mengganti titik koma (;) menjadi koma (,) agar valid sebagai properti objek JavaScript
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Create pesanan error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPDATE PESANAN - Parameter: data: PesananFormData
export async function updatePesanan(id: number, data: PesananFormData): Promise<ActionResponse> {
  try {
    const validated = pesananSchema.parse(data);
    const totalHarga = validated.detailPemesanans.reduce((sum, item) => sum + item.subtotal, 0);
    
    await prisma.detailPemesanan.deleteMany({ where: { idPemesanan: id } });
    
    await prisma.pemesanan.update({
      where: { id },
      data: {  // ✅ WAJIB: 'data:' key untuk Prisma update
        idPelanggan: validated.idPelanggan,
        tanggalAcara: new Date(validated.tanggalAcara),
        totalHarga,
        statusPesanan: validated.statusPesanan || "Menunggu_Konfirmasi",
        statusPembayaran: validated.statusPembayaran || "Menunggu_Pembayaran", // Mengupdate status pembayaran baru
        detailPemesanans: {
          create: validated.detailPemesanans.map((item: DetailPesananFormData) => ({
            idPaket: item.idPaket,
            jumlah: item.jumlah,
            subtotal: item.subtotal,
          })),
        },
      },
    });
    
    revalidatePath("/pesanan");
    revalidatePath("/pesanan-saya");
    return { success: true, message: "Pesanan berhasil diperbarui!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update pesanan error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPDATE STATUS ONLY
export async function updateStatusPesanan(id: number, status: string): Promise<ActionResponse> {
  try {
    await prisma.pemesanan.update({
      where: { id },
      data: { statusPesanan: status },  // ✅ 'data:' key
    });
    revalidatePath("/pesanan");
    return { success: true, message: "Status pesanan berhasil diperbarui!" };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}

// ✅ DELETE PESANAN
export async function deletePesanan(id: number): Promise<ActionResponse> {
  try {
    await prisma.pemesanan.delete({ where: { id } });
    revalidatePath("/pesanan");
    return { success: true, message: "Pesanan berhasil dihapus!" };
  } catch (error) {
    console.error("Delete pesanan error:", error);
    return { success: false, message: "Gagal menghapus pesanan" };
  }
}

// ✅ GET ALL - SQLite compatible (NO mode: insensitive)
export async function getPesanan(search?: string, status?: string) {
  const where: {
    OR?: Array<{
      pelanggan?: { namaPelanggan: { contains: string } };
    }>;
    statusPesanan?: string;
  } = {};
  
  if (search) {
    where.OR = [
      { pelanggan: { namaPelanggan: { contains: search } } },  // ✅ NO mode: insensitive
    ];
  }
  
  if (status && status !== "all") {
    where.statusPesanan = status;
  }

  return prisma.pemesanan.findMany({
    where,
    include: {
      pelanggan: true,
      detailPemesanans: { include: { paket: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET BY ID with details
export async function getPesananById(id: number) {
  return prisma.pemesanan.findUnique({
    where: { id },
    include: {
      pelanggan: true,
      detailPemesanans: { include: { paket: true } },
    },
  });
}

// ✅ GET PELANGGAN LIST
export async function getPelangganOptions() {
  return prisma.pelanggan.findMany({
    select: { id: true, namaPelanggan: true },
    orderBy: { namaPelanggan: "asc" },
  });
}

// ✅ GET PAKET LIST
export async function getPaketOptions() {
  return prisma.paket.findMany({
    select: { id: true, namaPaket: true, hargaPaket: true, kategori: true },
    orderBy: { namaPaket: "asc" },
  });
}