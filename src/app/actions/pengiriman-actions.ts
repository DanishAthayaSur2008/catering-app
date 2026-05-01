// src/app/actions/pengiriman-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
// ✅ ActionResponse di-import dari validations (JANGAN declare lokal!)
import { pengirimanSchema, type PengirimanFormData, type ActionResponse } from "@/lib/validations/pengiriman";
import { z } from "zod";

// ✅ UPSERT PENGIRIMAN
// ✅ FIX 1: Parameter HARUS 'data: PengirimanFormData' (bukan cuma 'PengirimanFormData')
export async function upsertPengiriman(data: PengirimanFormData): Promise<ActionResponse> {
  try {
    const validated = pengirimanSchema.parse(data);
    
    const existing = await prisma.pengiriman.findUnique({
      where: { idPesan: validated.idPesan }
    });

    if (existing) {
      // ✅ FIX 2: Prisma update HARUS pakai 'data: { ... }' (bukan cuma '{ ... }')
      await prisma.pengiriman.update({
        where: { id: existing.id },
        data: {
          statusKirim: validated.statusKirim,
          tanggalKirim: validated.tanggalKirim ? new Date(validated.tanggalKirim) : null,
          buktiFoto: validated.buktiFoto || null,
          kurirId: validated.kurirId || null,
        },
      });
    } else {
      // ✅ FIX 2: Prisma create HARUS pakai 'data: { ... }' (bukan cuma '{ ... }')
      await prisma.pengiriman.create({
        data: {
          idPesan: validated.idPesan,
          statusKirim: validated.statusKirim,
          tanggalKirim: validated.tanggalKirim ? new Date(validated.tanggalKirim) : null,
          buktiFoto: validated.buktiFoto || null,
          kurirId: validated.kurirId || null,
        },
      });
    }
    
    revalidatePath("/pengiriman");
    return { success: true, message: "Data pengiriman berhasil disimpan!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Upsert pengiriman error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPDATE STATUS ONLY
export async function updateStatusPengiriman(id: number, status: string): Promise<ActionResponse> {
  try {
    // ✅ FIX 2: Prisma update HARUS pakai 'data: { ... }'
    await prisma.pengiriman.update({
      where: { id },
      data: {
        statusKirim: status,
        tanggalKirim: status === "Tiba_Ditujuan" ? new Date() : undefined,
      },
    });
    
    revalidatePath("/pengiriman");
    return { success: true, message: "Status pengiriman berhasil diperbarui!" };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, message: "Gagal memperbarui status" };
  }
}

// ✅ UPLOAD BUKTI FOTO
export async function uploadBuktiFoto(id: number, fotoUrl: string): Promise<ActionResponse> {
  try {
    // ✅ FIX 2: Prisma update HARUS pakai 'data: { ... }'
    await prisma.pengiriman.update({
      where: { id },
      data: { buktiFoto: fotoUrl },
    });
    
    revalidatePath("/pengiriman");
    return { success: true, message: "Bukti foto berhasil diupload!" };
  } catch (error) {
    console.error("Upload bukti foto error:", error);
    return { success: false, message: "Gagal mengupload foto" };
  }
}

// ✅ DELETE PENGIRIMAN
export async function deletePengiriman(id: number): Promise<ActionResponse> {
  try {
    await prisma.pengiriman.delete({ where: { id } });
    revalidatePath("/pengiriman");
    return { success: true, message: "Data pengiriman berhasil dihapus!" };
  } catch (error) {
    console.error("Delete pengiriman error:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}

// ✅ GET ALL - SQLite compatible
// ✅ FIX 3: HAPUS 'mode: "insensitive"' karena SQLite tidak support
export async function getPengirimanList(search?: string, status?: string, kurirId?: number) {
  // ✅ FIX 4: Proper type definition (no 'any')
  const where: {
    OR?: Array<{
      pemesanan?: {
        pelanggan?: { namaPelanggan: { contains: string } };
      };
    }>;
    statusKirim?: string;
    kurirId?: number;
  } = {};
  
  if (search) {
    where.OR = [
      // ✅ FIX 3: NO 'mode: "insensitive"' - SQLite compatible
      { pemesanan: { pelanggan: { namaPelanggan: { contains: search } } } },
    ];
  }
  
  if (status && status !== "all") {
    where.statusKirim = status;
  }
  
  if (kurirId) {
    where.kurirId = kurirId;
  }

  return prisma.pengiriman.findMany({
    where,
    include: {
      pemesanan: {
        include: {
          pelanggan: true,
          detailPemesanans: { include: { paket: true } },
        },
      },
      kurir: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET BY ID with details
export async function getPengirimanById(id: number) {
  return prisma.pengiriman.findUnique({
    where: { id },
    include: {
      pemesanan: {
        include: {
          pelanggan: true,
          detailPemesanans: { include: { paket: true } },
        },
      },
      kurir: { select: { id: true, name: true } },
    },
  });
}

// ✅ GET KURIR LIST
export async function getKurirOptions() {
  return prisma.user.findMany({
    where: { level: "kuri" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

// ✅ GET PESANAN MENUNGGU KIRIM
export async function getPesananMenungguKirim(kurirId?: number) {
  return prisma.pemesanan.findMany({
    where: {
      statusPesanan: "Menunggu_Kurir",
      pengiriman: kurirId ? { kurirId } : undefined,
    },
    include: {
      pelanggan: true,
      detailPemesanans: { include: { paket: true } },
      pengiriman: true,
    },
    orderBy: { tanggalAcara: "asc" },
  });
}