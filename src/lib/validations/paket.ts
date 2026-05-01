// src/lib/validations/paket.ts
// ⚠️ JANGAN pakai "use server" di file ini!
import { z } from "zod";

export const KATEGORI_PAKET = [
  "Pernikahan",
  "Selametan", 
  "Ulang Tahun",
  "Aqiqah",
  "Kantor",
  "Lainnya",
] as const;

export const paketSchema = z.object({
  nama_paket: z.string().min(3, "Nama paket minimal 3 karakter"),
  menu_paket: z.string().min(5, "Deskripsi menu wajib diisi"),
  kategori: z.string().refine(
    (val) => KATEGORI_PAKET.includes(val as (typeof KATEGORI_PAKET)[number]),
    { message: "Kategori wajib dipilih" }
  ),
  harga_paket: z.string().min(1, "Harga wajib diisi"),
  foto: z.string().url("Format URL foto tidak valid").optional().or(z.literal("")),
});

export type PaketFormData = z.infer<typeof paketSchema>;

// ✅ WAJIB EXPORT INI agar bisa di-import di actions & components
export type ActionResponse = 
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };