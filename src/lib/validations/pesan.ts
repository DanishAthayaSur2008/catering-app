import { z } from "zod";

export const pesananItemSchema = z.object({
  idPaket: z.number().int().positive(),
  jumlah: z.number().int().min(1, "Jumlah minimal 1"),
  subtotal: z.number().optional(), // Dihitung ulang di server untuk keamanan
});

export const pesananCustomerSchema = z.object({
  items: z.array(pesananItemSchema).min(1, "Pilih minimal 1 paket"),
  tanggalAcara: z.string().min(1, "Tanggal acara wajib diisi"),
  catatan: z.string().optional(),
});

export type PesananCustomerData = z.infer<typeof pesananCustomerSchema>;