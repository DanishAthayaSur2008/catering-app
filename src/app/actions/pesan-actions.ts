// src/app/actions/pesan-actions.ts
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { pesananCustomerSchema } from "@/lib/validations/pesan";

// ✅ 1. Definisikan tipe data dari schema Zod agar tidak "Cannot find name"
type PesananCustomerData = z.infer<typeof pesananCustomerSchema>;

export async function createPesananCustomer(formData: PesananCustomerData) {
  const session = await auth();
  
  // Pastikan user sudah login dan dia adalah pelanggan
  if (!session?.user || session.user.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = pesananCustomerSchema.parse(formData);
    
    // ✅ 2. Ambil harga paket (Gunakan nama kolom 'hargaPaket' sesuai schema kita)
    const paketIds = validated.items.map(i => i.idPaket);
    const packages = await prisma.paket.findMany({
      where: { id: { in: paketIds } },
      select: { id: true, hargaPaket: true } // Sesuai schema: hargaPaket
    });

    if (packages.length !== paketIds.length) {
      return { success: false, message: "Ada paket yang tidak valid" };
    }

    let totalHarga = 0;
    const detailCreate = validated.items.map(item => {
      const pkg = packages.find(p => p.id === item.idPaket);
      if (!pkg) throw new Error("Paket tidak ditemukan");
      
      const subtotal = pkg.hargaPaket * item.jumlah;
      totalHarga += subtotal;
      
      return {
        idPaket: item.idPaket,
        jumlah: item.jumlah,
        subtotal,
      };
    });

    // ✅ 3. Buat pesanan (PENTING: Tambahkan 'data' dan mapping ID Pelanggan)
    const pesanan = await prisma.pemesanan.create({
      data: {
        // Konversi session.user.id ke Number karena di Prisma idPelanggan adalah Int
        idPelanggan: parseInt(session.user.id), 
        tanggalAcara: new Date(validated.tanggalAcara),
        totalHarga: totalHarga,
        statusPesanan: "Menunggu_Konfirmasi",
        // Hapus catatan jika di schema Prisma kamu tidak ada kolom catatan
        detailPemesanans: {
          create: detailCreate
        }
      },
    });

    revalidatePath("/pesanan");
    return { success: true, message: "Pesanan berhasil dibuat!", id: pesanan.id };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Create pesanan error:", error);
    return { success: false, message: "Gagal membuat pesanan di server" };
  }
}