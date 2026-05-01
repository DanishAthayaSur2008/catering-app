// src/lib/validations/laporan.ts
// ⚠️ JANGAN pakai "use server" di file ini!
import { z } from "zod";

export const laporanSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  kategori: z.string().optional(),
  format: z.enum(["pdf", "excel"]).optional(),
});

export type LaporanFormData = z.infer<typeof laporanSchema>;

export type ActionResponse = 
  | { success: true; message: string; data?: unknown }
  | { success: false; message: string; errors?: Record<string, string[]> };