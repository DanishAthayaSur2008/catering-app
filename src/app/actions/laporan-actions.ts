// src/app/actions/laporan-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
// ✅ ActionResponse di-import dari validations (JANGAN declare lokal!)
import { laporanSchema, type LaporanFormData, type ActionResponse } from "@/lib/validations/laporan";
import { z } from "zod";

// ✅ GET REVENUE BY MONTH
// ✅ FIX 1: Parameter HARUS 'data: LaporanFormData'
export async function getRevenueByMonth(data: LaporanFormData): Promise<ActionResponse> {
  try {
    // ✅ FIX 2: Parse dengan variabel 'validated'
    const validated = laporanSchema.parse(data);
    
    const where: {
      tanggalPemesanan?: { gte?: Date; lte?: Date };
      statusPesanan?: { not: string };
    } = { statusPesanan: { not: "Dibatalkan" } };

    if (validated.startDate) {
      where.tanggalPemesanan = { ...where.tanggalPemesanan, gte: new Date(validated.startDate) };
    }
    if (validated.endDate) {
      where.tanggalPemesanan = { ...where.tanggalPemesanan, lte: new Date(validated.endDate) };
    }

    const orders = await prisma.pemesanan.findMany({
      where,
      select: {
        tanggalPemesanan: true,
        totalHarga: true,
      },
    });

    // Group by month
    const revenueByMonth = orders.reduce((acc, order) => {
      const month = new Date(order.tanggalPemesanan).toLocaleString("id-ID", { month: "short", year: "numeric" });
      acc[month] = (acc[month] || 0) + order.totalHarga;
      return acc;
    }, {} as Record<string, number>);

    // ✅ FIX 3: Return object HARUS pakai 'data:' key
    return { 
      success: true, 
      message: "Data revenue berhasil diambil", 
      data: Object.entries(revenueByMonth).map(([name, value]) => ({ name, value }))
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: "Validasi gagal", errors: error.flatten().fieldErrors };
    }
    console.error("Get revenue error:", error);
    return { success: false, message: "Terjadi kesalahan server" };
  }
}

// ✅ GET ORDER STATUS STATS
export async function getOrderStatusStats(): Promise<ActionResponse> {
  try {
    const stats = await prisma.pemesanan.groupBy({
      by: ["statusPesanan"],
      _count: { id: true },
      _sum: { totalHarga: true },
    });

    const chartData = stats.map((s) => ({
      name: s.statusPesanan?.replace(/_/g, " ") || "Unknown",
      value: s._count.id,
      total: s._sum.totalHarga || 0,
    }));

    // ✅ FIX 3: Return object HARUS pakai 'data:' key
    return { success: true, message: "Data status berhasil diambil", data: chartData };
  } catch (error) {
    console.error("Get order stats error:", error);
    return { success: false, message: "Gagal mengambil data status" };
  }
}

// ✅ GET TOP PACKAGES
export async function getTopPackages(limit: number = 5): Promise<ActionResponse> {
  try {
    const topPackages = await prisma.detailPemesanan.groupBy({
      by: ["idPaket"],
      _sum: { jumlah: true, subtotal: true },
      orderBy: { _sum: { jumlah: "desc" } },
      take: limit,
    });

    const packages = await Promise.all(
      topPackages.map(async (item) => {
        const pkg = await prisma.paket.findUnique({
          where: { id: item.idPaket },
          select: { namaPaket: true },
        });
        return {
          name: pkg?.namaPaket || "Unknown",
          terjual: item._sum.jumlah || 0,
          revenue: item._sum.subtotal || 0,
        };
      })
    );

    // ✅ FIX 3: Return object HARUS pakai 'data:' key
    return { success: true, message: "Data paket terlaris berhasil diambil", data: packages };
  } catch (error) {
    console.error("Get top packages error:", error);
    return { success: false, message: "Gagal mengambil data paket" };
  }
}

// ✅ GET SUMMARY STATS
// ✅ FIX 1: Parameter HARUS 'data: LaporanFormData'
export async function getLaporanSummary(data: LaporanFormData): Promise<ActionResponse> {
  try {
    // ✅ FIX 2: Parse dengan variabel 'validated'
    const validated = laporanSchema.parse(data);
    
    const where: {
      tanggalPemesanan?: { gte?: Date; lte?: Date };
      statusPesanan?: { not: string };
    } = { statusPesanan: { not: "Dibatalkan" } };

    if (validated.startDate) {
      where.tanggalPemesanan = { ...where.tanggalPemesanan, gte: new Date(validated.startDate) };
    }
    if (validated.endDate) {
      where.tanggalPemesanan = { ...where.tanggalPemesanan, lte: new Date(validated.endDate) };
    }

    const [totalPesanan, totalRevenue, totalPelanggan] = await Promise.all([
      prisma.pemesanan.count({ where }),
      prisma.pemesanan.aggregate({ where, _sum: { totalHarga: true } }),
      prisma.pelanggan.count(),
    ]);

    const averageOrder = totalPesanan > 0 
      ? (totalRevenue._sum.totalHarga || 0) / totalPesanan 
      : 0;

    // ✅ FIX 3: Return object HARUS pakai 'data:' key dengan proper object syntax
    return {
      success: true,
      message: "Data summary berhasil diambil",
      data: {
        totalPesanan,
        totalRevenue: totalRevenue._sum.totalHarga || 0,
        totalPelanggan,
        averageOrder,
      },
    };
  } catch (error) {
    console.error("Get summary error:", error);
    return { success: false, message: "Gagal mengambil data summary" };
  }
}