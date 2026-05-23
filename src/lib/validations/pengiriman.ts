// src/lib/validations/pengiriman.ts
// ⚠️ JANGAN pakai "use server" di file ini!
import { z } from "zod";

// ✅ STATUS KIRIM ENUM
export const STATUS_KIRIM = [
  "Belum_Dikirim",
  "Sedang_Dikirim", 
  "Tiba_Ditujuan",
] as const;

export type StatusKirim = typeof STATUS_KIRIM[number];

// ✅ SCHEMA UNTUK FORM TEKS SAJA (File upload handle terpisah via FormData)
export const pengirimanSchema = z.object({
  idPesan: z.number().min(1, "Pesanan wajib dipilih"),
  
  // Status pengiriman (harus salah satu dari STATUS_KIRIM)
  statusKirim: z.string().refine(
    (val) => STATUS_KIRIM.includes(val as StatusKirim),
    { message: "Status pengiriman tidak valid" }
  ),
  
  // Tanggal kirim (opsional, format YYYY-MM-DD)
  tanggalKirim: z.string().optional(),
  
  // ✅ FIELD BARU: No. Resi / Tracking Number
  noResi: z.string().max(50, "No. resi maksimal 50 karakter").optional().or(z.literal("")),
  
  // ✅ FIELD BARU: Alamat tujuan override (jika beda dari alamat pelanggan)
  alamatTujuan: z.string().max(255, "Alamat tujuan terlalu panjang").optional().or(z.literal("")),
  
  // ✅ FIELD BARU: Estimasi tiba (format ISO date string: YYYY-MM-DD)
  estimasiTiba: z.string().optional(),
  
  // ✅ FIELD BARU: Catatan dari kurir (opsional)
  catatanKurir: z.string().max(500, "Catatan maksimal 500 karakter").optional().or(z.literal("")),
  
  // Kurir yang di-assign (opsional)
  kurirId: z.number().optional(),
  
  // ❌ HAPUS: buktiFoto tidak di-schema karena file upload handle manual via FormData
});

export type PengirimanFormData = z.infer<typeof pengirimanSchema>;

// ✅ ACTION RESPONSE TYPE (WAJIB EXPORT untuk type safety di server actions)
export type ActionResponse = 
  | { success: true; message: string; id?: number }
  | { success: false; message: string; errors?: Record<string, string[]> };