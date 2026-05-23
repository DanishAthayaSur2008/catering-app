// src/app/api/export/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getLaporanSummary,
  getTopPackages,
  getRevenueByMonth
} from "@/app/actions/laporan-actions";
import { formatRupiah } from "@/lib/utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Deklarasi Interface untuk Keamanan Tipe Data (Anti-ESLint Any Error)
interface SummaryData {
  totalPesanan: number;
  totalRevenue: number;
  totalPelanggan: number;
  averageOrder: number;
}

interface PackageData {
  name: string;
  terjual: number;
  revenue: number;
}

interface RevenueData {
  name: string;
  value: number;
}

export async function GET(request: NextRequest) {
  // 1. Validasi Akses Pengguna
  const session = await auth();
  if (session?.user?.level !== "admin" && session?.user?.level !== "owner") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  // 2. Ambil Query Filter Waktu dari URL Berjalan
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  try {
    // 3. Tarik Data Utama dari Server Actions
    const [summaryRes, packagesRes, revenueRes] = await Promise.all([
      getLaporanSummary({ startDate, endDate }),
      getTopPackages(5),
      getRevenueByMonth({ startDate, endDate }),
    ]);

    const summary = summaryRes.success && summaryRes.data ? summaryRes.data as SummaryData : null;
    const packagesData = packagesRes.success && Array.isArray(packagesRes.data) ? packagesRes.data as PackageData[] : [];
    const revenueData = revenueRes.success && Array.isArray(revenueRes.data) ? revenueRes.data as RevenueData[] : [];

    // 4. Bangun Dokumen PDF Menggunakan pdf-lib (Aman Tanpa File-System Disk)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Standar Ukuran A4 dalam hitungan Poin
    const { width, height } = page.getSize();

    // Registrasi Font Standar (Terintegrasi Langsung secara Biner)
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Variabel pembantu tracking posisi baris vertikal (dimulai dari atas halaman)
    let currentY = 50;

    // --- Fungsi Pembantu Cetak Teks (Top-Down Wrapper) ---
    const drawTextCenter = (text: string, font: typeof helvetica, size: number, y: number, color = rgb(0, 0, 0)) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: (width - textWidth) / 2, y: height - y, size, font, color });
    };

    const drawTextLeft = (text: string, font: typeof helvetica, size: number, x: number, y: number, color = rgb(0, 0, 0)) => {
      page.drawText(text, { x, y: height - y, size, font, color });
    };

    const drawTextRight = (text: string, font: typeof helvetica, size: number, rightX: number, y: number, color = rgb(0, 0, 0)) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, { x: rightX - textWidth, y: height - y, size, font, color });
    };

    // --- KOP SURAT ---
    drawTextCenter("CATERING MANAGEMENT SYSTEM", helveticaBold, 20, currentY);
    currentY += 25;
    drawTextCenter("Laporan Performa Bisnis & Ringkasan Eksekutif", helvetica, 12, currentY);
    currentY += 18;

    const periodeText = startDate && endDate ? `${startDate} s/d ${endDate}` : "Semua Periode";
    drawTextCenter(`Periode: ${periodeText}`, helveticaOblique, 10, currentY);
    currentY += 20;

    // Garis Pembatas Kop Surat (#cbd5e1)
    page.drawLine({
      start: { x: 40, y: height - currentY },
      end: { x: width - 40, y: height - currentY },
      color: rgb(0.796, 0.835, 0.882),
      thickness: 1,
    });
    currentY += 30;

    // --- SEKSI 1: EXECUTIVE SUMMARY ---
    drawTextLeft("1. Ringkasan Eksekutif", helveticaBold, 14, 40, currentY, rgb(0.118, 0.227, 0.541));
    currentY += 22;

    if (summary) {
      drawTextLeft(`• Total Transaksi Sukses : ${summary.totalPesanan} Pesanan`, helvetica, 11, 50, currentY);
      currentY += 18;
      drawTextLeft(`• Total Pendapatan Omzet : ${formatRupiah(summary.totalRevenue)}`, helvetica, 11, 50, currentY);
      currentY += 18;
      drawTextLeft(`• Rata-rata Nilai Order  : ${formatRupiah(summary.averageOrder)}`, helvetica, 11, 50, currentY);
      currentY += 18;
      drawTextLeft(`• Total Mitra Pelanggan : ${summary.totalPelanggan} Orang terdaftar`, helvetica, 11, 50, currentY);
      currentY += 35;
    } else {
      drawTextLeft("Data ringkasan tidak tersedia.", helveticaOblique, 11, 50, currentY);
      currentY += 35;
    }

    // --- SEKSI 2: TABEL TOP 5 MENU ---
    drawTextLeft("2. Top 5 Menu Paket Terlaris", helveticaBold, 14, 40, currentY, rgb(0.118, 0.227, 0.541));
    currentY += 20;

    if (packagesData.length > 0) {
      // Kotak Header Tabel (Warna Biru #2563eb)
      page.drawRectangle({
        x: 40,
        y: height - currentY - 15,
        width: width - 80,
        height: 22,
        color: rgb(0.145, 0.388, 0.922),
      });
      drawTextLeft("Nama Paket Katering", helveticaBold, 10, 50, currentY, rgb(1, 1, 1));
      drawTextRight("Porsi Terjual", helveticaBold, 10, 400, currentY, rgb(1, 1, 1));
      drawTextRight("Total Revenue", helveticaBold, 10, 540, currentY, rgb(1, 1, 1));
      currentY += 22;

      // Isi Rows Data Tabel
      packagesData.forEach((pkg, index) => {
        if (index % 2 === 0) {
          // Efek Zebra Striping Abu-Abu (#f8fafc)
          page.drawRectangle({
            x: 40,
            y: height - currentY - 15,
            width: width - 80,
            height: 22,
            color: rgb(0.973, 0.98, 0.988),
          });
        }
        drawTextLeft(`${index + 1}. ${pkg.name}`, helvetica, 10, 50, currentY);
        drawTextRight(`${pkg.terjual} Porsi`, helvetica, 10, 400, currentY);
        drawTextRight(formatRupiah(pkg.revenue), helvetica, 10, 540, currentY);
        currentY += 22;
      });
      currentY += 20;
    } else {
      drawTextLeft("Belum ada data penjualan produk.", helveticaOblique, 11, 50, currentY);
      currentY += 35;
    }

    // --- SEKSI 3: REKAP BULANAN ---
    drawTextLeft("3. Rekapitulasi Tren Omzet Bulanan", helveticaBold, 14, 40, currentY, rgb(0.118, 0.227, 0.541));
    currentY += 20;

    if (revenueData.length > 0) {
      // Kotak Header Tabel Tren (Warna Hijau #059669)
      page.drawRectangle({
        x: 40,
        y: height - currentY - 15,
        width: width - 80,
        height: 22,
        color: rgb(0.02, 0.588, 0.412),
      });
      drawTextLeft("Bulan / Periode", helveticaBold, 10, 50, currentY, rgb(1, 1, 1));
      drawTextRight("Total Capaian Pendapatan (Gross)", helveticaBold, 10, 540, currentY, rgb(1, 1, 1));
      currentY += 22;

      // Isi Rows Data Tabel Tren
      revenueData.forEach((rev, index) => {
        if (index % 2 === 0) {
          page.drawRectangle({
            x: 40,
            y: height - currentY - 15,
            width: width - 80,
            height: 22,
            color: rgb(0.973, 0.98, 0.988),
          });
        }
        drawTextLeft(rev.name, helvetica, 10, 50, currentY);
        drawTextRight(formatRupiah(rev.value), helvetica, 10, 540, currentY);
        currentY += 22;
      });
    } else {
      drawTextLeft("Data grafik bulanan kosong.", helveticaOblique, 11, 50, currentY);
    }

    // --- FOOTER DOKUMEN ---
    currentY += 35;
    const footerText = `Dokumen laporan ini digenerate otomatis oleh sistem katering pada tanggal: ${new Date().toLocaleString("id-ID")}`;
    drawTextCenter(footerText, helveticaOblique, 9, currentY, rgb(0.392, 0.455, 0.545));

    // 5. Finalisasi Compile PDF ke Uint8Array
    const pdfBytes = await pdfDoc.save();

    // KONVERSI AMAN: Ubah generic Uint8Array menjadi Buffer Node.js murni
    const pdfBuffer = Buffer.from(pdfBytes);

    // Sekarang pdfBuffer sudah bertipe BlobPart yang valid
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Laporan_Bisnis_Catering_${Date.now()}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error) {
    console.error("Gagal mengekspor berkas laporan PDF:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}