/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    // 1. Proteksi: Cek Sesi & Role
    const session = await auth();
    if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Ambil Query Params untuk Filter
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 3. Ambil Data dari Database
    const orders = await prisma.pemesanan.findMany({
      where: {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      },
      include: {
        pelanggan: true,
        // asumsikan ada relasi paket atau item, sesuaikan dengan schema.prisma kamu
      },
      orderBy: { createdAt: "desc" },
    });

    // 4. Inisialisasi Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Pesanan");

    // 5. Definisikan Header Kolom
    worksheet.columns = [
      { header: "No", key: "no", width: 5 },
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Nama Pelanggan", key: "pelanggan", width: 25 },
      { header: "Total Harga", key: "total", width: 20 },
      { header: "Status Pesanan", key: "status", width: 15 },
      { header: "Metode Bayar", key: "metode", width: 15 },
    ];

    // Styling Header (Biar Cantik)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 6. Masukkan Data ke Rows
    orders.forEach((order: any, index) => {
      // Kita gunakan : any sementara jika struktur prisma kamu sangat kompleks,
      // atau sesuaikan field di bawah ini dengan nama asli di schema.prisma kamu.
      
      worksheet.addRow({
        no: index + 1,
        // Pastikan nama field di bawah ini (seperti createdAt, totalHarga, dll) 
        // sesuai dengan yang ada di schema.prisma kamu
        tanggal: order.createdAt ? new Date(order.createdAt).toLocaleDateString("id-ID") : "-",
        
        // SESUAIKAN: Di error kamu tertulis 'namaPelanggan', bukan 'nama'
        pelanggan: order.pelanggan?.namaPelanggan || "Umum",
        
        // SESUAIKAN: Cek apakah di model Pesanan namanya 'totalHarga' atau 'total'
        total: (order as any).totalHarga || (order as any).total || 0,
        
        // SESUAIKAN: Cek apakah namanya 'status' atau 'statusPesanan'
        status: (order as any).status || (order as any).statusPesanan || "-",
        
        metode: (order as any).metodePembayaran || "-"
      });
    });

    // 7. Format Kolom Harga (Rupiah)
    worksheet.getColumn("total").numFmt = '"Rp "#,##0';

    // 8. Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 9. Kirim Response sebagai File
    const filename = `Laporan_Catering_${Date.now()}.xlsx`;
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=${filename}`,
      },
    });
  } catch (error) {
    console.error("Export Excel Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}