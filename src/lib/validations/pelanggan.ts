// src/lib/validations/pelanggan.ts
// ⚠️ JANGAN pakai "use server" di file ini!

import { z } from "zod";

export const pelangganSchema = z.object({
  nama_pelanggan: z.string().min(2, "Nama minimal 2 karakter"),
  alamat1: z.string().min(5, "Alamat wajib diisi"),
  alamat2: z.string().optional(),
  alamat3: z.string().optional(),
  no_telp: z.string().min(10, "Nomor telepon tidak valid"),
});

export type PelangganFormData = z.infer<typeof pelangganSchema>;

export type ActionResponse =
  | { success: true; message: string }
  | { success: false; message: string; errors?: Record<string, string[]> };