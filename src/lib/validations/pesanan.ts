// src/lib/validations/pesanan.ts
// ⚠️ JANGAN pakai "use server" di file ini!
import { z } from "zod";

export const STATUS_PESANAN = [
  "Menunggu_Konfirmasi",
  "Sedang_Diproses",
  "Menunggu_Kurir",
  "Selesai",
  "Dibatalkan",
] as const;

export type StatusPesanan = typeof STATUS_PESANAN[number];

export const detailPesananSchema = z.object({
  idPaket: z.number().min(1, "Paket wajib dipilih"),
  jumlah: z.number().min(1, "Minimal 1 porsi"),
  subtotal: z.number().min(0),
});

export const pesananSchema = z.object({
  idPelanggan: z.number().min(1, "Pelanggan wajib dipilih"),
  tanggalAcara: z.string().min(1, "Tanggal acara wajib diisi"),
  statusPesanan: z.string().refine(
    (val) => STATUS_PESANAN.includes(val as StatusPesanan),
    { message: "Status tidak valid" }
  ).optional(),
  detailPemesanans: z.array(detailPesananSchema).min(1, "Minimal 1 item paket"),
});

export type PesananFormData = z.infer<typeof pesananSchema>;
export type DetailPesananFormData = z.infer<typeof detailPesananSchema>;

// ✅ WAJIB EXPORT INI agar bisa di-import di actions & components
export type ActionResponse = 
  | { success: true; message: string; id?: number }
  | { success: false; message: string; errors?: Record<string, string[]> };