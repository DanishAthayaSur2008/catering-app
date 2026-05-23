// src/app/actions/paket-actions.ts
"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schema validasi (hanya teks, file divalidasi terpisah)
const paketSchema = z.object({
  nama_paket: z.string().min(3, "Nama paket minimal 3 karakter"),
  menu_paket: z.string().min(5, "Deskripsi menu minimal 5 karakter"),
  kategori: z.string(),
  harga_paket: z.string().transform((val) => parseFloat(val.replace(/\./g, ""))), // Handle format rupiah
});

// ✅ Mengganti 'any' dengan tipe data fieldErrors bawaan Zod yang spesifik
export async function createPaket(formData: FormData): Promise<{ success: boolean; message: string; errors?: Record<string, string[] | undefined> }> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    // 1. Validasi teks
    const validated = paketSchema.parse({
      nama_paket: formData.get("nama_paket"),
      menu_paket: formData.get("menu_paket"),
      kategori: formData.get("kategori"),
      harga_paket: formData.get("harga_paket"),
    });

    // 2. Handle Upload Foto (BLOB)
    const fotoFile = formData.get("foto") as File | null;
    let fotoBuffer: Buffer | null = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      fotoBuffer = Buffer.from(arrayBuffer);
    }

    // 3. Simpan ke DB
    await prisma.paket.create({
      data: {
        namaPaket: validated.nama_paket,
        menuPaket: validated.menu_paket,
        kategori: validated.kategori,
        hargaPaket: validated.harga_paket,
        foto: fotoBuffer, // Simpan Buffer langsung ke field Bytes
        statusPaket: "aktif",
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

// ✅ Mengganti 'any' dengan tipe data fieldErrors bawaan Zod yang spesifik
export async function updatePaket(id: number, formData: FormData): Promise<{ success: boolean; message: string; errors?: Record<string, string[] | undefined> }> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }

  try {
    const validated = paketSchema.parse({
      nama_paket: formData.get("nama_paket"),
      menu_paket: formData.get("menu_paket"),
      kategori: formData.get("kategori"),
      harga_paket: formData.get("harga_paket"),
    });

    // Handle Update Foto (Opsional: jika user upload baru, timpa yang lama)
    const fotoFile = formData.get("foto") as File | null;
    
    // ✅ Mengganti 'any' dengan deklarasi tipe objek yang strict & aman
    const updateData: {
      namaPaket: string;
      menuPaket: string;
      kategori: string;
      hargaPaket: number;
      foto?: Buffer;
    } = {
      namaPaket: validated.nama_paket,
      menuPaket: validated.menu_paket,
      kategori: validated.kategori,
      hargaPaket: validated.harga_paket,
    };

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      updateData.foto = Buffer.from(arrayBuffer);
    }

    await prisma.paket.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/paket");
    return { success: true, message: "Paket berhasil diperbarui!" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Update paket error:", error);
    return { success: false, message: "Gagal update paket" };
  }
}

export async function deletePaket(id: number): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return { success: false, message: "Akses ditolak" };
  }
  
  try {
    await prisma.paket.delete({ where: { id } });
    revalidatePath("/paket");
    return { success: true, message: "Paket dihapus" };
  } catch (error) {
    // ✅ Menambahkan console.error agar variabel 'error' terpakai dan tidak melanggar aturan no-unused-vars
    console.error("Delete paket error:", error);
    return { success: false, message: "Gagal hapus paket" };
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