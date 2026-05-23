// src/lib/utils.ts (tambahkan di bawah cn())

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency IDR
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Format date Indonesia
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Get status badge color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    "Menunggu_Konfirmasi": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "Sedang_Diproses": "bg-blue-100 text-blue-800 hover:bg-blue-100",
    "Menunggu_Kurir": "bg-purple-100 text-purple-800 hover:bg-purple-100",
    "Selesai": "bg-green-100 text-green-800 hover:bg-green-100",
    "Dibatalkan": "bg-red-100 text-red-800 hover:bg-red-100",
    "Belum_Dikirim": "bg-gray-100 text-gray-800 hover:bg-gray-100",
    "Sedang_Dikirim": "bg-orange-100 text-orange-800 hover:bg-orange-100",
    "Tiba_Ditujuan": "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  };
  return colors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
}

// Tambahkan ini di src/lib/utils.ts
export function getStatusPesananColor(status: string) {
  switch (status) {
    case "Menunggu_Konfirmasi": return "bg-yellow-500 text-white";
    case "Sedang_Diproses": return "bg-blue-500 text-white";
    case "Tiba_Ditujuan": return "bg-purple-500 text-white";
    case "Selesai": return "bg-green-500 text-white";
    case "Dibatalkan": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}

export function getStatusPembayaranColor(status: string) {
  switch (status) {
    case "Lunas": return "text-green-600 border-green-600";
    case "Refund": return "text-orange-600 border-orange-600";
    case "Gagal": return "text-red-600 border-red-600";
    default: return "text-yellow-600 border-yellow-600";
  }
}

export function getStatusKirimColor(status: string): string {
  const colors: Record<string, string> = {
    'Belum_Dikirim': 'bg-gray-100 text-gray-800',
    'Sedang_Dikirim': 'bg-blue-100 text-blue-800',
    'Tiba_Ditujuan': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// src/lib/utils.ts

// ✅ Pindahkan fungsi ini ke sini
export function generateNoResi(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RESI-${timestamp}-${random}`;
}