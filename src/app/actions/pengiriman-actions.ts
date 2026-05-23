// src/app/actions/pengiriman-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fileToBuffer } from "@/lib/image-utils";
import { Prisma } from "@prisma/client"; // ✅ Import Prisma untuk tipe data strong-typing

// Schema untuk assign/update pengiriman (admin)
// ✅ Skema yang sudah diselaraskan dengan input Form Client
const pengirimanSchema = z.object({
  idPesan: z.number().int().positive(),
  kurirId: z.number().int().positive().nullable().optional(), 
  statusKirim: z.enum(["Belum_Dikirim", "Sedang_Dikirim", "Tiba_Ditujuan"]),
  tanggalKirim: z.string().optional(),
  alamatTujuan: z.string().nullable().optional(), 
  noResi: z.string().nullable().optional(),
  estimasiTiba: z.date().nullable().optional(), 
  catatanKurir: z.string().nullable().optional(),
});

type PengirimanFormValues = z.infer<typeof pengirimanSchema>;

export type ActionResponse =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

// ✅ GET LIST PENGIRIMAN (Admin View - Filter: Belum Selesai)
export async function getPengirimanList(search?: string, status?: string) {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return [];
  }

  // ✅ Perbaikan Utama: Menggunakan tipe data bawaan Prisma agar tidak perlu menggunakan 'as any'
  const where: Prisma.PengirimanWhereInput = {};

  if (status && status !== "all") {
    where.statusKirim = status;
  } else {
    where.statusKirim = { not: "Tiba_Ditujuan" };
  }

  if (search) {
    where.OR = [
      { pemesanan: { pelanggan: { namaPelanggan: { contains: search } } } },
      { pemesanan: { id: { equals: parseInt(search) || 0 } } },
    ];
  }

  return prisma.pengiriman.findMany({
    where, // ✅ Bersih tanpa 'as any'
    include: {
      kurir: { select: { id: true, name: true, email: true } },
      pemesanan: {
        include: {
          pelanggan: { select: { id: true, namaPelanggan: true, alamat1: true, noTelp: true } },
          detailPemesanans: {
            include: {
              paket: { select: { id: true, namaPaket: true, hargaPaket: true, menuPaket: true } }
            }
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ✅ GET KURIR OPTIONS
export async function getKurirOptions() {
  return prisma.user.findMany({
    where: {
      OR: [
        { level: "kurir" },
        { level: "KURIR" }, // 👈 Menghindari error akibat perbedaan huruf kapital di database
        { level: "kuri" } // 👈 Tambahkan ini sebagai pertolongan pertama agar kata "kuri" tetap terbaca
      ]
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

// ✅ UPSERT PENGIRIMAN (Admin: Assign Kurir + Update Status)
export async function upsertPengiriman(data: PengirimanFormValues): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = pengirimanSchema.parse({
      ...data,
      statusKirim: data.statusKirim || "Belum_Dikirim",
    });

    const existing = await prisma.pengiriman.findUnique({
      where: { idPesan: validated.idPesan },
    });

    const deliveryData = {
      kurirId: validated.kurirId,
      statusKirim: validated.statusKirim,
      tanggalKirim: validated.tanggalKirim ? new Date(validated.tanggalKirim) : undefined,
      alamatTujuan: validated.alamatTujuan,
      noResi: validated.noResi,
      estimasiTiba: validated.estimasiTiba || undefined,
      catatanKurir: validated.catatanKurir,
    };

    if (existing) {
      await prisma.pengiriman.update({
        where: { id: existing.id },
        data: deliveryData,
      });
    } else {
      await prisma.pengiriman.create({
        data: {
          idPesan: validated.idPesan,
          ...deliveryData,
        },
      });
    }

    revalidatePath("/pengiriman");
    revalidatePath("/tracking");
    return { success: true, message: "Pengiriman berhasil diupdate!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Upsert pengiriman error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ UPLOAD BUKTI FOTO (Kurir)
export async function uploadBuktiFoto(formData: FormData): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "kurir") {
    return { success: false, message: "Akses ditolak" };
  }

  const kurirId = Number(session?.user?.id);
  if (!kurirId || isNaN(kurirId)) {
    return { success: false, message: "Sesi kurir tidak valid" };
  }

  try {
    const idPengiriman = Number(formData.get("idPengiriman"));
    const buktiFile = formData.get("buktiFoto") as File | null;

    if (!buktiFile || buktiFile.size === 0) {
      return { success: false, message: "File foto wajib diupload" };
    }

    const buffer = await fileToBuffer(buktiFile);

    await prisma.pengiriman.update({
      where: {
        id: idPengiriman,
        kurirId: kurirId
      },
      data: {
        buktiFoto: buffer, // ✅ Masuk ke field Bytes sesuai model database Anda
      },
    });

    revalidatePath("/kurir");
    revalidatePath("/pengiriman");
    revalidatePath("/tracking");
    return { success: true, message: "Bukti foto berhasil diupload! Menunggu approval admin." };
  } catch (error) {
    console.error("Upload bukti foto error:", error);
    return { success: false, message: "Gagal upload bukti foto" };
  }
}

// ✅ APPROVE PENGIRIMAN SELESAI (Admin Only)
export async function approvePengirimanSelesai(idPengiriman: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const pengiriman = await prisma.pengiriman.findUnique({
      where: { id: idPengiriman },
      include: { pemesanan: true }
    });

    if (!pengiriman) {
      return { success: false, message: "Pengiriman tidak ditemukan" };
    }

    if (!pengiriman.buktiFoto || pengiriman.statusKirim !== "Sedang_Dikirim") {
      return { success: false, message: "Tidak bisa approve: bukti foto belum diupload atau status tidak valid" };
    }

    // Menggunakan Prisma $transaction untuk memastikan kedua proses harus berhasil bersamaan
    await prisma.$transaction([
      prisma.pengiriman.update({
        where: { id: idPengiriman },
        data: {
          statusKirim: "Tiba_Ditujuan",
          aktualTiba: new Date(),
        },
      }),
      prisma.pemesanan.update({
        where: { id: pengiriman.pemesanan.id },
        data: { statusPesanan: "Selesai" }
      })
    ]);

    revalidatePath("/pengiriman");
    revalidatePath("/kurir");
    revalidatePath("/tracking");
    return { success: true, message: "Pengiriman disetujui selesai! Pesanan otomatis selesai." };
  } catch (error) {
    console.error("Approve pengiriman error:", error);
    return { success: false, message: "Gagal approve pengiriman" };
  }
}

// ✅ QUICK STATUS UPDATE (Kurir: Mulai Kirim)
export async function updateStatusKirim(idPengiriman: number, newStatus: string): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "kurir" && session?.user?.level !== "kuri") {
    return { success: false, message: "Akses ditolak" };
  }

  const kurirId = Number(session?.user?.id);
  if (!kurirId || isNaN(kurirId)) {
    return { success: false, message: "Sesi kurir tidak valid" };
  }

  try {
    const pengiriman = await prisma.pengiriman.findUnique({
      where: { id: idPengiriman, kurirId }
    });

    if (!pengiriman) {
      return { success: false, message: "Pengiriman tidak ditemukan" };
    }

    if (newStatus !== "Sedang_Dikirim") {
      return { success: false, message: "Status hanya bisa diubah ke 'Sedang_Dikirim'" };
    }

    await prisma.pengiriman.update({
      where: { id: idPengiriman },
      data: {
        statusKirim: newStatus,
        tanggalKirim: new Date(),
      }
    });

    revalidatePath("/kurir");
    revalidatePath("/tracking");
    return { success: true, message: "Pengiriman dimulai! Silakan antar ke tujuan." };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, message: "Gagal update status" };
  }
}

// ✅ DELETE PENGIRIMAN (Admin only)
export async function deletePengiriman(id: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    await prisma.pengiriman.delete({ where: { id } });
    revalidatePath("/pengiriman");
    revalidatePath("/tracking");
    return { success: true, message: "Data pengiriman dihapus" };
  } catch (error) {
    console.error("Delete pengiriman error:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}

// ✅ GET PESANAN YANG BELUM DIKIRIM (Untuk dropdown di form admin)
export async function getPesananBelumDikirim() {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return [];
  }

  return prisma.pemesanan.findMany({
    where: {
      statusPesanan: { in: ["Menunggu_Kurir", "Sedang_Diproses"] },
      OR: [
        { pengiriman: null },
        { pengiriman: { statusKirim: "Belum_Dikirim" } }
      ]
    },
    include: {
      pelanggan: {
        select: { id: true, namaPelanggan: true, alamat1: true, noTelp: true }
      },
      detailPemesanans: {
        include: {
          paket: { select: { id: true, namaPaket: true, menuPaket: true, hargaPaket: true } }
        }
      }
    },
    orderBy: { tanggalAcara: "asc" }
  });
}

// ✅ UPDATE DETAIL PENGIRIMAN
export async function updatePengirimanDetail(
  id: number,
  data: {
    noResi?: string;
    alamatTujuan?: string;
    estimasiTiba?: string;
  }
): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const updateData: Prisma.PengirimanUpdateInput = {};

    if (data.noResi !== undefined) {
      updateData.noResi = data.noResi.trim() || null;
    }
    if (data.alamatTujuan !== undefined) {
      updateData.alamatTujuan = data.alamatTujuan.trim() || null;
    }
    if (data.estimasiTiba !== undefined) {
      updateData.estimasiTiba = data.estimasiTiba ? new Date(data.estimasiTiba) : null;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: true, message: "Tidak ada perubahan" };
    }

    await prisma.pengiriman.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/pengiriman");
    revalidatePath("/pesanan-saya");
    return { success: true, message: "Detail pengiriman berhasil diupdate!" };
  } catch (error) {
    console.error("Update pengiriman detail error:", error);
    return { success: false, message: "Gagal update detail pengiriman" };
  }
}