// src/app/actions/pesan-actions.ts
"use server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const pesananItemSchema = z.object({
  idPaket: z.number().int().positive(),
  jumlah: z.number().int().min(1, "Jumlah minimal 1"),
  subtotal: z.number().optional(),
});

const pesananCustomerSchema = z.object({
  items: z.array(pesananItemSchema).min(1, "Pilih minimal 1 paket"),
  tanggalAcara: z.string().min(1, "Tanggal acara wajib diisi"),
  catatan: z.string().optional(),
});

type PesananCustomerData = z.infer<typeof pesananCustomerSchema>;

export async function createPesananCustomer(formData: PesananCustomerData): Promise<{ success: boolean; message: string; id?: number; errors?: Record<string, string[]> }> {
  const session = await auth();
  if (session?.user?.level !== "pelanggan") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = pesananCustomerSchema.parse(formData);

    // ✅ FIX: Arrow function syntax (=>)
    const paketIds = validated.items.map((i) => i.idPaket);
    const packages = await prisma.paket.findMany({
      where: { id: { in: paketIds } },
      select: { id: true, hargaPaket: true },
    });

    if (packages.length !== paketIds.length) {
      return { success: false, message: "Paket tidak valid atau tidak tersedia" };
    }

    let totalHarga = 0;
    const detailCreate = validated.items.map((item) => {
      const pkg = packages.find((p) => p.id === item.idPaket);
      if (!pkg) throw new Error("Paket tidak ditemukan");
      const subtotal = pkg.hargaPaket * item.jumlah;
      totalHarga += subtotal;
      return {
        idPaket: item.idPaket,
        jumlah: item.jumlah,
        subtotal,
      };
    });

    const idPelanggan = Number(session.user.id);
    if (Number.isNaN(idPelanggan)) {
      return { success: false, message: "ID pelanggan tidak valid" };
    }

    // ✅ FIX: Tambah 'data:' key (Wajib di Prisma)
    const pesanan = await prisma.pemesanan.create({
      data: {
        idPelanggan,
        tanggalAcara: new Date(validated.tanggalAcara),
        totalHarga,
        statusPesanan: "Menunggu_Konfirmasi",
        catatan: validated.catatan || null,
        detailPemesanans: {
          create: detailCreate,
        },
      },
    });

    revalidatePath("/pesanan-saya");
    return { success: true, message: "Pesanan berhasil dibuat!", id: pesanan.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Zod validation error:", error.flatten());
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("❌ Create pesanan customer error:", error);
    return { success: false, message: "Gagal membuat pesanan" };
  }
}