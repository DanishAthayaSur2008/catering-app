// src/lib/validations/pengiriman.ts
// ⚠️ JANGAN pakai "use server" di file ini!
import { z } from "zod";

export const STATUS_KIRIM = [
  "Belum_Dikirim",
  "Sedang_Dikirim",
  "Tiba_Ditujuan",
] as const;

export type StatusKirim = typeof STATUS_KIRIM[number];

export const pengirimanSchema = z.object({
  idPesan: z.number().min(1, "Pesanan wajib dipilih"),
  statusKirim: z.string().refine(
    (val) => STATUS_KIRIM.includes(val as StatusKirim),
    { message: "Status pengiriman tidak valid" }
  ),
  tanggalKirim: z.string().optional(),
  buktiFoto: z.string().url("Format URL foto tidak valid").optional().or(z.literal("")),
  kurirId: z.number().optional(),
});

export type PengirimanFormData = z.infer<typeof pengirimanSchema>;

// ✅ WAJIB EXPORT INI agar bisa di-import di actions & components
export type ActionResponse = 
  | { success: true; message: string; id?: number }
  | { success: false; message: string; errors?: Record<string, string[]> };