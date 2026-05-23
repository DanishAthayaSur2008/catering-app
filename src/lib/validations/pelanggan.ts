// src/lib/validations/pelanggan.ts
import { z } from "zod";

export const pelangganSchema = z.object({
  nama_pelanggan: z.string().min(2, "Nama minimal 2 karakter"),
  alamat1: z.string().min(5, "Alamat wajib diisi"),
  alamat2: z.string().optional(),
  alamat3: z.string().optional(),
  no_telp: z.string().min(10, "Nomor telepon tidak valid"),
  foto: z.any().optional(), // 👈 Diubah menjadi z.any() agar mendukung objek File / biner dari client
});

export type PelangganFormData = z.infer<typeof pelangganSchema>;

export type ActionResponse =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };