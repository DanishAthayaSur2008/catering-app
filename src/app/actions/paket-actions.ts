// src/app/actions/paket-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// ✅ Import ActionResponse dari validations (JANGAN declare lokal!)
import { paketSchema, type PaketFormData, type ActionResponse } from "@/lib/validations/paket";
import { z } from "zod";

// ✅ CREATE - Parameter: data: PaketFormData (bukan cuma PaketFormData)
export async function createPaket(data: PaketFormData): Promise<ActionResponse> {
  try {
    const validated = paketSchema.parse(data);
    const harga = parseFloat(validated.harga_paket.replace(/\./g, "").replace(",", "."));
    
    await prisma.paket.create({
      data: {  // ✅ WAJIB: 'data:' key untuk Prisma create
        namaPaket: validated.nama_paket,
        menuPaket: validated.menu_paket,
        kategori: validated.kategori,
        hargaPaket: isNaN(harga) ? 0 : harga,
        foto: validated.foto || null,
      },
    });
    
    revalidatePath("/paket");
    return { success: true, message: "Paket berhasil ditambahkan!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Create paket error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPDATE - Parameter: data: PaketFormData
export async function updatePaket(id: number, data: PaketFormData): Promise<ActionResponse> {
  try {
    const validated = paketSchema.parse(data);
    const harga = parseFloat(validated.harga_paket.replace(/\./g, "").replace(",", "."));
    
    await prisma.paket.update({
      where: { id },
      data: {  // ✅ WAJIB: 'data:' key untuk Prisma update
        namaPaket: validated.nama_paket,
        menuPaket: validated.menu_paket,
        kategori: validated.kategori,
        hargaPaket: isNaN(harga) ? 0 : harga,
        foto: validated.foto || null,
      },
    });
    
    revalidatePath("/paket");
    return { success: true, message: "Paket berhasil diperbarui!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update paket error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ DELETE
export async function deletePaket(id: number): Promise<ActionResponse> {
  try {
    const hasOrders = await prisma.detailPemesanan.count({
      where: { idPaket: id }
    });
    
    if (hasOrders > 0) {
      return { success: false, message: "Tidak bisa hapus: Paket memiliki riwayat pesanan!" };
    }
    
    await prisma.paket.delete({ where: { id } });
    revalidatePath("/paket");
    return { success: true, message: "Paket berhasil dihapus!" };
  } catch (error) {
    console.error("Delete paket error:", error);
    return { success: false, message: "Gagal menghapus paket" };
  }
}

// ✅ GET ALL - SQLite compatible (NO mode: insensitive)
export async function getPakets(search?: string, kategori?: string) {
  // ✅ Using simple object for SQLite compatibility
  const where: {
    OR?: Array<{
      namaPaket?: { contains: string };
      menuPaket?: { contains: string };
      kategori?: { contains: string };
    }>;
    kategori?: string;
  } = {};
  
  if (search) {
    where.OR = [
      { namaPaket: { contains: search } },  // ✅ NO mode: insensitive (SQLite tidak support)
      { menuPaket: { contains: search } },
      { kategori: { contains: search } },
    ];
  }
  
  if (kategori && kategori !== "all") {
    where.kategori = kategori;
  }

  return prisma.paket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET BY ID
export async function getPaketById(id: number) {
  return prisma.paket.findUnique({ where: { id } });
}