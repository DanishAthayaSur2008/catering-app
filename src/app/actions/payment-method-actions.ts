// src/app/actions/payment-method-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema untuk JenisPembayaran
const jenisPembayaranSchema = z.object({
  namaPembayaran: z.string().min(2, "Nama metode pembayaran minimal 2 karakter"),
});

export type ActionResponse =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };

// ✅ GET ALL JENIS PEMBAYARAN + DETAILS (SUDAH DISERIALISASI KE BASE64)
export async function getPaymentMethodsAdmin() {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return [];
  }

  const rawData = await prisma.jenisPembayaran.findMany({
    include: {
      detailJenisPembayarans: {
        select: {
          id: true,
          tempatPembayaran: true,
          noRekening: true,
          logoPembayaran: true,
        }
      },
      _count: {
        select: { pemesanans: true }
      }
    },
    orderBy: { namaPembayaran: "asc" }
  });

  // Konversi field logoPembayaran (Buffer) menjadi String Base64 murni di sisi Server
  return rawData.map((method) => ({
    ...method,
    detailJenisPembayarans: method.detailJenisPembayarans.map((detail) => {
      let logoUrl: string | null = null;
      if (detail.logoPembayaran) {
        const base64String = Buffer.isBuffer(detail.logoPembayaran)
          ? detail.logoPembayaran.toString("base64")
          : Buffer.from(detail.logoPembayaran as Uint8Array).toString("base64");
        logoUrl = `data:image/png;base64,${base64String}`;
      }

      return {
        ...detail,
        logoPembayaran: logoUrl, // Mengganti tipe Buffer menjadi String aman untuk Client Component
      };
    }),
  }));
}

// ✅ CREATE JENIS PEMBAYARAN BARU
export async function createJenisPembayaran(
  data: z.infer<typeof jenisPembayaranSchema>
): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = jenisPembayaranSchema.parse(data);

    await prisma.jenisPembayaran.create({
      data: {
        namaPembayaran: validated.namaPembayaran,
      },
    });

    revalidatePath("/payment-methods");
    return { success: true, message: "Metode pembayaran berhasil ditambahkan!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Create jenis pembayaran error:", error);
    return { success: false, message: "Gagal menambah metode pembayaran" };
  }
}

// ✅ UPDATE JENIS PEMBAYARAN
export async function updateJenisPembayaran(
  id: number,
  data: z.infer<typeof jenisPembayaranSchema>
): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = jenisPembayaranSchema.parse(data);

    await prisma.jenisPembayaran.update({
      where: { id },
      data: {
        namaPembayaran: validated.namaPembayaran,
      },
    });

    revalidatePath("/payment-methods");
    return { success: true, message: "Metode pembayaran berhasil diupdate!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update jenis pembayaran error:", error);
    return { success: false, message: "Gagal update metode pembayaran" };
  }
}

// ✅ DELETE JENIS PEMBAYARAN
export async function deleteJenisPembayaran(id: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const count = await prisma.pemesanan.count({
      where: { 
        idJenisPembayaran: id 
      }
    });

    if (count > 0) {
      return { success: false, message: "Tidak bisa hapus: Metode pembayaran masih digunakan dalam pesanan!" };
    }

    await prisma.jenisPembayaran.delete({ where: { id } });
    revalidatePath("/payment-methods");
    return { success: true, message: "Metode pembayaran berhasil dihapus!" };
  } catch (error) {
    console.error("Delete jenis pembayaran error:", error);
    return { success: false, message: "Gagal menghapus metode pembayaran" };
  }
}

// ✅ CREATE DETAIL MENGGUNAKAN PLAIN OBJECT & BASE64 (TETAP SIMPAN BINER DI DB)
export async function createDetailJenisPembayaran(data: {
  idJenisPembayaran: number;
  tempatPembayaran: string;
  noRekening?: string | null;
  logoPembayaran?: string | null; // Menerima string Base64 dari Client
}): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    if (!data.tempatPembayaran || data.tempatPembayaran.length < 2) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: { tempatPembayaran: ["Nama bank/e-wallet minimal 2 karakter"] },
      };
    }

    // Convert string base64 kembali menjadi biner Buffer untuk disimpan ke database
    let logoBuffer: Buffer | null = null;
    if (data.logoPembayaran && data.logoPembayaran.startsWith("data:")) {
      const base64Data = data.logoPembayaran.split(",")[1];
      if (base64Data) {
        logoBuffer = Buffer.from(base64Data, "base64");
      }
    }

    await prisma.detailJenisPembayaran.create({
      data: {
        idJenisPembayaran: data.idJenisPembayaran,
        tempatPembayaran: data.tempatPembayaran,
        noRekening: data.noRekening || null,
        logoPembayaran: logoBuffer, // Disimpan sebagai foto biner asli di DB
      },
    });

    revalidatePath("/payment-methods");
    return { success: true, message: "Detail pembayaran berhasil ditambahkan!" };
  } catch (error) {
    console.error("Create detail pembayaran error:", error);
    return { success: false, message: "Gagal menambah detail pembayaran" };
  }
}

// ✅ UPDATE DETAIL MENGGUNAKAN PLAIN OBJECT & BASE64 (TETAP SIMPAN BINER DI DB)
export async function updateDetailJenisPembayaran(
  id: number,
  data: {
    tempatPembayaran: string;
    noRekening?: string | null;
    logoPembayaran?: string | null; // Menerima string Base64 baru jika ada
    keepExistingLogo: boolean;
  }
): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    if (!data.tempatPembayaran || data.tempatPembayaran.length < 2) {
      return {
        success: false,
        message: "Validasi gagal",
        errors: { tempatPembayaran: ["Nama bank/e-wallet minimal 2 karakter"] },
      };
    }

    let logoBuffer: Buffer | null | undefined = undefined;
    
    if (!data.keepExistingLogo) {
      if (data.logoPembayaran && data.logoPembayaran.startsWith("data:")) {
        const base64Data = data.logoPembayaran.split(",")[1];
        if (base64Data) {
          logoBuffer = Buffer.from(base64Data, "base64");
        }
      } else {
        logoBuffer = null; // Menghapus logo lama di DB jika user menghapusnya
      }
    }

    const updateData: any = {
      tempatPembayaran: data.tempatPembayaran,
      noRekening: data.noRekening || null,
    };

    if (logoBuffer !== undefined) {
      updateData.logoPembayaran = logoBuffer; // Disimpan sebagai foto biner asli di DB
    }

    await prisma.detailJenisPembayaran.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/payment-methods");
    return { success: true, message: "Detail pembayaran berhasil diupdate!" };
  } catch (error) {
    console.error("Update detail pembayaran error:", error);
    return { success: false, message: "Gagal update detail pembayaran" };
  }
}

// ✅ DELETE DETAIL JENIS PEMBAYARAN
export async function deleteDetailJenisPembayaran(id: number): Promise<ActionResponse> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    await prisma.detailJenisPembayaran.delete({ where: { id } });
    revalidatePath("/payment-methods");
    return { success: true, message: "Detail pembayaran berhasil dihapus!" };
  } catch (error) {
    console.error("Delete detail pembayaran error:", error);
    return { success: false, message: "Gagal menghapus detail pembayaran" };
  }
}