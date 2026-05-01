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